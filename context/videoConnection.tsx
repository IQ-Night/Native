import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dimensions } from "react-native";
import { mediaDevices, RTCPeerConnection } from "react-native-webrtc";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";
import { useGameContext } from "./game";

const VideoConnection = createContext<any>(null);

export const useVideoConnectionContext = () => useContext(VideoConnection);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface contextProps {
  children: ReactNode;
}

export const VideoConnectionContextWrapper: React.FC<contextProps> = ({
  children,
}) => {
  const { apiUrl } = useAppContext();
  const { currentUser } = useAuthContext();
  const { socket, activeRoom, gamePlayers, spectators } = useGameContext();
  const [loading, setLoading] = useState<any>(false);

  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStreams, setRemoteStreams] = useState<any>([]);

  const peerConnections = useRef<{ [userId: string]: any }>({});

  // turn video
  const [video, setVideo] = useState(false);

  useEffect(() => {
    if (socket) {
      const handleReceiveOffer = async ({
        signal,
        creatorId,
      }: {
        signal: RTCSessionDescriptionInit;
        callerId: string;
        creatorId: string;
      }) => {
        if (!peerConnections.current[creatorId])
          createPeerConnection(creatorId);
        setLoading(creatorId);
        try {
          // console.log("Setting remote description for offer:", signal);
          await peerConnections.current[creatorId]?.setRemoteDescription(
            signal
          );
        } catch (error) {
          console.log("Error setting remote description:", error);
        }

        const answer = await peerConnections.current[creatorId]?.createAnswer();
        await peerConnections.current[creatorId]?.setLocalDescription(answer);

        socket.emit("send-answer", {
          signal: answer,
          creatorId: creatorId,
        });
      };

      const handleReceiveAnswer = async ({
        signal,
        userId,
      }: {
        signal: RTCSessionDescriptionInit;
        creatorId: string;
        userId: string;
      }) => {
        if (!peerConnections.current[userId]) {
          console.log(`PeerConnection for userId ${userId} not found.`);
          return;
        }

        const peerConnection = peerConnections.current[userId];
        // Signaling state must be "have-local-offer" to set an answer
        if (peerConnection.signalingState !== "have-local-offer") {
          console.log(
            `Cannot set remote description. Current signaling state: ${peerConnection.signalingState}`
          );
          return;
        }

        try {
          await peerConnection.setRemoteDescription(signal);
        } catch (error) {
          console.log(
            `Error setting remote description for userId: ${userId}`,
            error
          );
        }
      };

      const handleReceiveCandidate = async ({
        candidate,
        userId,
      }: {
        candidate: RTCIceCandidateInit;
        userId: string;
      }) => {
        if (peerConnections.current[userId]) {
          try {
            // console.log("Adding ICE Candidate:", candidate);
            await peerConnections.current[userId].addIceCandidate(candidate);
          } catch (error) {
            console.log("Error adding ICE candidate:", error);
          }
        }
      };

      socket?.on("receive-offer", handleReceiveOffer);
      socket?.on("receive-answer", handleReceiveAnswer);
      socket?.on("receive-candidate", handleReceiveCandidate);

      return () => {
        socket.off("receive-offer", handleReceiveOffer);
        socket.off("receive-answer", handleReceiveAnswer);
        socket.off("receive-candidate", handleReceiveCandidate);

        Object.values(peerConnections.current).forEach((connection) => {
          connection.close();
        });
      };
    }
  }, [socket, currentUser?._id]);

  const createPeerConnection = (userId: string) => {
    if (peerConnections.current[userId]) {
      console.warn(`PeerConnection already exists for userId: ${userId}`);
      return;
    }

    peerConnections.current[userId] = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnections.current[userId].onicecandidate = (
      event: RTCPeerConnectionIceEvent
    ) => {
      if (event.candidate) {
        socket?.emit("send-candidate", {
          candidate: event.candidate,
          userId: userId,
        });
      }
    };

    peerConnections.current[userId].ontrack = (event: RTCTrackEvent) => {
      // console.log("Received remote track:", event.streams[0]?.toURL());

      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev: any) => [
          ...prev?.filter((p: any) => p?.userId !== userId),
          { streams: event?.streams[0], userId: userId },
        ]);
      }
    };
  };

  const startCall = async (val: boolean) => {
    if (val) {
      setLoading(currentUser?._id);
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setLocalStream(stream);

        const allUsers = gamePlayers.concat(spectators);

        allUsers?.map(async (user: any) => {
          if (user?.userId !== currentUser?._id) {
            createPeerConnection(user?.userId);

            stream.getTracks().forEach((track) => {
              peerConnections.current[user?.userId]?.addTrack(track, stream);
            });

            const offer = await peerConnections.current[
              user?.userId
            ].createOffer();
            await peerConnections.current[user?.userId]?.setLocalDescription(
              offer
            );

            socket?.emit("send-offer", {
              signal: offer,
              creatorId: currentUser?._id,
              receiverSocket: user?.socketId,
            });
          }
        });
      } catch (error) {
        console.log("Error starting call:", error);
      }
    } else {
      // Close all PeerConnections
      Object.keys(peerConnections.current).forEach((userId) => {
        peerConnections.current[userId]?.close();
        delete peerConnections.current[userId];
      });

      // Stop local media tracks
      if (localStream) {
        localStream.getTracks().forEach((track: any) => track.stop());
        setLocalStream(null);
      }

      // Emit to notify the server
      socket.emit("off-video", {
        roomId: activeRoom?._id,
        userId: currentUser?._id,
      });
    }
  };

  useEffect(() => {
    const SendOffer = async () => {
      // Combine gamePlayers and spectators to get all potential user IDs
      const allUsers = [...gamePlayers, ...spectators];

      // Filter out the users who are not in peerConnections
      const newUsers = allUsers
        .filter((u: any) => u.userId !== currentUser?._id)
        .filter((usr) => {
          if (!peerConnections.current[usr?.userId]) {
            return usr;
          } else {
            return null;
          }
        });
      const stream = localStream;
      // Loop through new users and handle the offer logic
      newUsers?.length > 0 &&
        newUsers.forEach(async (user) => {
          try {
            if (user?.userId !== currentUser?._id) {
              createPeerConnection(user?.userId);
              stream.getTracks().forEach((track: any) => {
                peerConnections.current[user?.userId]?.addTrack(track, stream);
              });
              const offer = await peerConnections.current[
                user?.userId
              ].createOffer();
              await peerConnections.current[user?.userId]?.setLocalDescription(
                offer
              );
              socket?.emit("send-offer", {
                signal: offer,
                creatorId: currentUser?._id,
                receiverSocket: user?.socketId,
              });
            }
          } catch (error) {
            console.log("Error starting call:", error);
          }
        });
    };
    if (video) {
      SendOffer();
    }
  }, [gamePlayers, spectators]);

  /** open video */
  const [openVideo, setOpenVideo] = useState<any>(false);
  // control connection with socket update
  useEffect(() => {
    if (socket) {
      const removeUserFromStream = ({ userId }: any) => {
        setRemoteStreams((prev: any) =>
          prev?.filter((p: any) => p?.userId !== userId)
        );
        if (peerConnections.current[userId]) {
          peerConnections.current[userId].close();
          delete peerConnections.current[userId];
        }
      };
      socket.on("video-off", removeUserFromStream);
      return () => {
        socket.off("video-off", removeUserFromStream);
      };
    }
  }, [socket]);

  /**
   * Microphone controll
   *   */

  // disable voice & video
  const [microphone, setMicrophone] = useState(false);

  const toggleMicrophone = (stream: any, isEnabled: any) => {
    if (stream) {
      stream.getAudioTracks().forEach((track: any) => {
        track.enabled = isEnabled; // true = ჩართული, false = გამორთული
      });
      console.log(`Microphone is now ${isEnabled ? "enabled" : "disabled"}`);
    } else {
      console.log("Stream not found. Unable to toggle microphone.");
    }
  };
  useEffect(() => {
    if (!video) {
      setMicrophone(false);
      socket.emit("enable-microphone", {
        userId: currentUser?._id,
        value: video && microphone ? true : false,
      });
    }
    if (localStream) {
      toggleMicrophone(localStream, microphone);
      socket.emit("enable-microphone", {
        userId: currentUser?._id,
        value: video && microphone ? true : false,
      });
    }
  }, [microphone, localStream, video]);

  return (
    <VideoConnection.Provider
      value={{
        video,
        setVideo,
        localStream,
        remoteStreams,
        startCall,
        openVideo,
        setOpenVideo,
        setLoading,
        loading,
        microphone,
        setMicrophone,
        toggleMicrophone,
      }}
    >
      {children}
    </VideoConnection.Provider>
  );
};

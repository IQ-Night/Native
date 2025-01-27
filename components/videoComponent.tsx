import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  View,
} from "react-native";
import InCallManager from "react-native-incall-manager";
import { RTCView } from "react-native-webrtc";
import { useAuthContext } from "../context/auth";
import { useVideoConnectionContext } from "../context/videoConnection";
import { useAppContext } from "../context/app";
import { FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useGameContext } from "../context/game";
import { ActivityIndicator } from "react-native-paper";
import { set } from "lodash";

const VideoComponent = ({
  userId,
  setOpenVideo,
  currentUserRole,
  user,
  setOpenUser,
  display,
  game,
  activePlayerToSpeech,
  nominations,
  voting,
}: any) => {
  const {
    localStream,
    remoteStreams,
    setRemoteStreams,
    setLoading,
    video,
    loadingFirstConnection,
    loading,
    setVideo,
    setMicrophone,
  } = useVideoConnectionContext();
  const { currentUser } = useAuthContext();
  const { haptics, theme } = useAppContext();
  const { socket } = useGameContext();
  const [userStream, setUserStream] = useState<any>(null);
  const [userStreamURL, setUserStreamURL] = useState<any>(null);
  const [userMicrophones, setUserMicrophones] = useState<any>([]);

  useEffect(() => {
    setUserStream(
      remoteStreams?.find((stream: any) => stream.userId === userId)
    );
  }, [remoteStreams, userId]);

  useEffect(() => {
    if (userStream?.streams) {
      setUserStreamURL(userStream.streams?.toURL());
    }
  }, [userStream]);

  // Memoized Stream URLs
  const localStreamURL = useMemo(() => localStream?.toURL(), [localStream]);

  // InCallManager-ის სტაბილური მართვა
  const isInCallManagerStarted = useRef(false);

  useEffect(() => {
    if (!isInCallManagerStarted.current) {
      try {
        InCallManager.start({ media: "video" });
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
        isInCallManagerStarted.current = true;
        // console.log("InCallManager started with Speakerphone ON");
      } catch (error) {
        console.log("InCallManager Error:", error);
      }
    }

    return () => {
      if (Platform.OS === "android") {
        console.log("Cleaning up InCallManager for Android");
        InCallManager.stop();
      } else {
        // console.log("Preserving InCallManager for iOS");
      }
      isInCallManagerStarted.current = false;
    };
  }, []);

  const toggleMicrophone = () => {
    if (userStream) {
      const audioTrack = userStream?.streams
        ?.getAudioTracks()
        ?.find((track: any) => track.kind === "audio");

      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled; // ტრეკის სტატუსის ტოგგლირება
        console.log(
          `Microphone ${
            audioTrack.enabled ? "enabled" : "disabled"
          } for user ${userId}`
        );
      } else {
        console.warn("No audio track found in the user stream.");
      }

      // UI განახლება
      setUserMicrophones((prev: any) => {
        if (prev?.includes(userId)) {
          return prev.filter((p: any) => p !== userId); // მომხმარებლის მიკროფონი გამორთულია
        } else {
          return [...prev, userId]; // მომხმარებლის მიკროფონი ჩართულია
        }
      });
    } else {
      console.warn("User stream is not available.");
    }
  };

  // /**
  //  * update user video audio status
  //  */
  const [isVideoActive, setIsVideoActive] = useState<boolean>(true);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(true);

  const handleUpdateStatus = (data: any) => {
    // if (data?.type === "spectator") {
    //   if (data?.userName === "Geo Market") {
    //     console.log(
    //       "<<<<<   ",
    //       currentUser?.name,
    //       " - ",
    //       data?.type,
    //       " - ",
    //       data?.audio,
    //       " - ",
    //       data?.video,
    //       "   >>>>>>>"
    //     );
    //   }
    // }
    if (
      data?.userId !== currentUser?._id &&
      data?.userId === userStream?.userId
    ) {
      if (userStream && userStream?.streams) {
        const audioTrack = userStream?.streams
          ?.getAudioTracks()
          ?.find((track: any) => track.kind === "audio");
        if (audioTrack) {
          audioTrack.enabled = data?.audio === "active" ? true : false; // ტრეკის სტატუსის ტოგგლირება
          if (data?.audio === "active") {
            setIsAudioActive(true);
          } else {
            setIsAudioActive(false);
          }
        } else {
          console.warn("No audio track found in the user stream.");
        }
        const videoTrack = userStream?.streams
          ?.getVideoTracks()
          ?.find((track: any) => track.kind === "video");
        if (videoTrack) {
          videoTrack.enabled = data?.video === "active" ? true : false; // ტრეკის სტატუსის ტოგგლირება
          if (data?.video === "active") {
            setIsVideoActive(true);
          } else {
            setIsVideoActive(false);
          }
        } else {
          console.warn("No audio track found in the user stream.");
        }
        setRemoteStreams((prevStreams: any[]) =>
          prevStreams.map((stream) => {
            if (stream.userId === data.userId) {
              const updatedStream = { ...stream };

              // Update audio tracks
              const audioTrack = updatedStream.streams
                ?.getAudioTracks()
                ?.find((track: any) => track.kind === "audio");
              if (audioTrack) {
                audioTrack.enabled = data?.audio === "active";
              }

              // Update video tracks
              const videoTrack = updatedStream.streams
                ?.getVideoTracks()
                ?.find((track: any) => track.kind === "video");
              if (videoTrack) {
                videoTrack.enabled = data?.video === "active";
              }

              return updatedStream;
            }
            return stream;
          })
        );
      }
    }
  };
  useEffect(() => {
    handleUpdateStatus(user);
  }, [userStream?.userId]);

  useEffect(() => {
    if (socket) {
      socket.on("userMediaStatusUpdated", handleUpdateStatus);
      return () => {
        socket.off("userMediaStatusUpdated", handleUpdateStatus);
      };
    }
  }, [socket, userStream]);

  /**
   * Control streeams during game
   */
  useEffect(() => {
    if (userId === currentUser?._id) {
      if (game?.value === "Dealing Cards") {
        setMicrophone("inactive");
        setVideo("inactive");
      }
      if (
        game?.value === "Getting to know mafias" &&
        currentUserRole?.includes("mafia")
      ) {
        setMicrophone("active");
        setVideo("inactive");
      }
      if (game?.value === "Day") {
        if (activePlayerToSpeech?.userId === currentUser?._id) {
          setMicrophone("active");
          setVideo("inactive");
        }
        if (activePlayerToSpeech?.userId !== currentUser?._id) {
          setMicrophone("inactive");
          setVideo("inactive");
        }
      }
      if (
        game?.value === "Personal Time Of Death" &&
        game?.options[0]?.userId === currentUser?._id
      ) {
        setMicrophone("active");
        setVideo("inactive");
      }
      if (game?.value === "Common Time") {
        setMicrophone("active");
        setVideo("inactive");
      }
      if (!voting) {
        if (game?.value === "Day" && nominations) {
          if (userId === currentUser?._id) {
            setVideo("active");
            setMicrophone("active");
          }
        }
      } else {
        setVideo("inactive");
        setMicrophone("inactive");
      }
    }
  }, [
    game?.value,
    activePlayerToSpeech,
    currentUser?._id,
    currentUserRole,
    nominations,
    voting,
  ]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(null);
    }, 1500);
  }, [user?.status, isAudioActive, isVideoActive]);

  return (
    <Pressable
      style={[
        styles.container,
        {
          transform: [
            {
              scale:
                (game?.value !== "Night" ||
                  (game?.value === "Night" &&
                    currentUserRole?.includes("mafia"))) &&
                display
                  ? 1
                  : nominations
                  ? 1
                  : 0,
            },
          ],
        },
      ]}
      onPress={() => {
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        if (userStreamURL && isVideoActive) {
          setOpenVideo({ video: userStreamURL, user });
        } else if (
          localStreamURL &&
          video === "active" &&
          userId === currentUser?._id
        ) {
          setOpenVideo({ video: localStreamURL, user });
        } else {
          setOpenUser(user);
        }
      }}
    >
      {userStream?.userId === userId && isAudioActive && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleMicrophone}
          style={{
            position: "absolute",
            zIndex: 90,
            bottom: 16,
            left: 2,
            padding: 4,
          }}
        >
          <FontAwesome
            size={18}
            color={
              (activePlayerToSpeech?.userId === userId &&
                game.value === "Day") ||
              game.value === "Common Time"
                ? theme.active
                : theme.text
            }
            name={
              userMicrophones?.find((uId: string) => uId === userId)
                ? "microphone-slash"
                : "microphone"
            }
          />
        </TouchableOpacity>
      )}

      {/* Local Stream */}
      {video === "active" && localStreamURL && currentUser?._id === userId && (
        <View
          style={[
            styles.video,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          {loadingFirstConnection && (
            <View
              style={{
                position: "absolute",
                zIndex: 60,
              }}
            >
              <ActivityIndicator size={24} color={theme.active} />
            </View>
          )}
          <RTCView
            key="local"
            streamURL={localStreamURL}
            style={[styles.video, { transform: [{ scaleX: -1 }] }]} // სარკისებური ეფექტი
            objectFit="cover"
          />
        </View>
      )}

      {/* Remote Stream */}
      {isVideoActive && userStreamURL && userStream?.userId === userId && (
        <View
          style={[
            styles.video,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          {loading === userId && (
            <View
              style={{
                position: "absolute",
                zIndex: 60,
              }}
            >
              <ActivityIndicator size={24} color={theme.active} />
            </View>
          )}
          <RTCView
            key={`remote-${userId}`}
            streamURL={userStreamURL}
            style={[styles.video, { transform: [{ scaleX: -1 }] }]} // სარკისებური ეფექტი
            objectFit="cover"
          />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    overflow: "hidden",
    position: "absolute",
    zIndex: 90,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  audioText: {
    color: "white",
    fontSize: 16,
  },
});

export default VideoComponent;

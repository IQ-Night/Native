import { RTCPeerConnection } from "react-native-webrtc";

export const createPeerConnection = (
  userId: any,
  peerConnections: any,
  socket: any,
  setRemoteStreams: any,
  localStream: any,
  currentUser: any
) => {
  // If a peer connection already exists for this user, return early
  if (peerConnections.current[userId]) {
    console.warn(`PeerConnection already exists for userId: ${userId}`);
    return;
  }

  // Create a new RTCPeerConnection with Google STUN server
  peerConnections.current[userId] = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  // Add local tracks if available
  if (localStream) {
    localStream.getTracks().forEach((track: any) => {
      peerConnections.current[userId].addTrack(track, localStream);
    });
    console.log(`Local tracks added for userId: ${userId}`);
  }

  // Handle ICE candidate events and send them to the specified user via socket
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

  // Handle incoming tracks and update the remote streams for the user
  peerConnections.current[userId].ontrack = (event: RTCTrackEvent) => {
    if (event.streams && event.streams[0]) {
      console.log("set remote stream......", currentUser?.name);
      setRemoteStreams((prev: any) => {
        // შეამოწმეთ, თუ უკვე არსებობს სთრიმი ამ userId-ით
        const existingStreamIndex = prev.findIndex(
          (stream: any) => stream.userId === userId
        );

        if (existingStreamIndex !== -1) {
          // თუ არსებობს, განაახლეთ შესაბამისი სთრიმი
          const updatedStreams = [...prev];
          updatedStreams[existingStreamIndex] = {
            ...updatedStreams[existingStreamIndex],
            streams: event.streams[0],
          };
          return updatedStreams;
        }

        // თუ არ არსებობს, დაამატეთ ახალი სთრიმი
        return [
          ...prev,
          {
            streams: event.streams[0],
            userId,
          },
        ];
      });
    }
  };
};

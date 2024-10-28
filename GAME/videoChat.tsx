// import React, { useRef, useEffect, useState } from "react";
// import { View, Button } from "react-native";
// import {
//   mediaDevices,
//   RTCPeerConnection,
//   RTCView,
//   MediaStream,
//   MediaStreamTrack,
//   RTCSessionDescription,
//   RTCIceCandidate,
// } from "react-native-webrtc";
// import io, { Socket } from "socket.io-client";

// const VideoChat: React.FC = () => {
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const peerConnection = useRef<RTCPeerConnection>(new RTCPeerConnection());
//   const socket = useRef<Socket | null>(null);

//   useEffect(() => {
//     socket.current = io("YOUR_SIGNALING_SERVER_URL");

//     socket.current.on("offer", async (sdp: RTCSessionDescription) => {
//       await peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(sdp)
//       );
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       socket.current?.emit("answer", peerConnection.current.localDescription);
//     });

//     socket.current.on("answer", (sdp: RTCSessionDescription) => {
//       peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(sdp)
//       );
//     });

//     socket.current.on("ice-candidate", (candidate: RTCIceCandidate) => {
//       peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//     });

//     const startLocalStream = async () => {
//       try {
//         const stream = await mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });
//         setLocalStream(stream);
//         stream.getTracks().forEach((track: MediaStreamTrack) => {
//           peerConnection.current.addTrack(track, stream);
//         });
//       } catch (error) {
//         console.error("Error accessing media devices.", error);
//       }
//     };

//     peerConnection.current.addEventListener("track", (event) => {
//       if (event.streams && event.streams[0]) {
//         setRemoteStream(event.streams[0]);
//       }
//     });

//     peerConnection.current.addEventListener("icecandidate", (event) => {
//       if (event.candidate) {
//         socket.current?.emit("ice-candidate", event.candidate);
//       }
//     });

//     startLocalStream();

//     return () => {
//       socket.current?.disconnect();
//       peerConnection.current.close();
//     };
//   }, []);

//   const createOffer = async () => {
//     const offer = await peerConnection.current.createOffer({});
//     await peerConnection.current.setLocalDescription(offer);
//     socket.current?.emit("offer", peerConnection.current.localDescription);
//   };

//   return (
//     <View>
//       {localStream && (
//         <RTCView
//           streamURL={localStream.toURL()}
//           style={{ width: 200, height: 200 }}
//         />
//       )}
//       {remoteStream && (
//         <RTCView
//           streamURL={remoteStream.toURL()}
//           style={{ width: 200, height: 200 }}
//         />
//       )}
//       <Button title="Start Call" onPress={createOffer} />
//     </View>
//   );
// };

// export default VideoChat;

import { updatePeerConnectionTracks } from "./updatePeerConnectionTracks";

export const toggleMediaTracks = (
  stream: MediaStream,
  type: "audio" | "video" | "both" | "none",
  peerConnections: any,
  socket: any,
  currentUserId: any
) => {
  if (!stream) {
    console.warn("Stream is not available.");
    return;
  }

  if (!stream.getAudioTracks().length && !stream.getVideoTracks().length) {
    console.warn("Stream has no tracks.");
    return;
  }

  // ტრეკების ჩართვა/გამორთვა ტიპის მიხედვით
  switch (type) {
    case "audio":
      stream.getAudioTracks().forEach((track) => (track.enabled = true));
      stream.getVideoTracks().forEach((track) => (track.enabled = false));
      break;
    case "video":
      stream.getAudioTracks().forEach((track) => (track.enabled = false));
      stream.getVideoTracks().forEach((track) => (track.enabled = true));
      break;
    case "both":
      stream.getAudioTracks().forEach((track) => (track.enabled = true));
      stream.getVideoTracks().forEach((track) => (track.enabled = true));
      break;
    case "none":
    default:
      stream.getAudioTracks().forEach((track) => (track.enabled = false));
      stream.getVideoTracks().forEach((track) => (track.enabled = false));
      break;
  }

  // ტრეკების განახლება PeerConnection-ებში
  updatePeerConnectionTracks(stream, peerConnections, socket, currentUserId);

  console.log(`Media tracks updated. Type: ${type}`);
};

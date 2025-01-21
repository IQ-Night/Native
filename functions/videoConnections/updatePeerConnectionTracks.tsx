export const updatePeerConnectionTracks = async (
  stream: MediaStream,
  peerConnections: any,
  socket: any,
  currentUserId: string
) => {
  console.log("update.....");
  if (!stream) {
    console.warn("Stream is not provided.");
    return;
  }

  if (!peerConnections?.current) {
    console.warn("PeerConnections object is not initialized.");
    return;
  }

  for (const userId in peerConnections.current) {
    const peerConnection = peerConnections.current[userId];

    if (!peerConnection) {
      console.warn(`PeerConnection for userId ${userId} is not defined.`);
      continue;
    }

    stream.getTracks().forEach((track) => {
      try {
        const existingSender = peerConnection
          .getSenders()
          .find((sender: any) => sender.track?.kind === track.kind);

        if (existingSender) {
          // თუ ტრეკი უკვე არსებობს, უბრალოდ ჩართე/გამორთე
          if (track.enabled !== existingSender.track.enabled) {
            existingSender.track.enabled = track.enabled;
            console.log(
              `Toggled ${track.kind} track for user: ${userId}. Enabled: ${track.enabled}`
            );
          } else {
            console.log(
              `${track.kind} track for user: ${userId} is already ${
                track.enabled ? "enabled" : "disabled"
              }.`
            );
          }
        } else {
          // ახალი ტრეკის დამატება
          peerConnection.addTrack(track, stream);
          console.log(
            `Added new ${track.kind} track for user: ${userId}. Track ID: ${track.id}`
          );
        }
      } catch (error) {
        console.log(
          `Error handling ${track.kind} track for user: ${userId}`,
          error
        );
      }
    });
  }

  const isAudioActive = stream
    ?.getTracks()
    .find((track: any) => track.kind === "audio");
  const isVideoActive = stream
    ?.getTracks()
    .find((track: any) => track.kind === "video");

  socket.emit("update-tracks", {
    audioTracks: isAudioActive?.enabled,
    videoTracks: isVideoActive?.enabled,
    userId: currentUserId,
  });
};

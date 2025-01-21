export const removeUserFromStream = ({
  userId,
  setRemoteStreams,
  peerConnections,
}: any) => {
  try {
    // 1. ლოკალური სტრიმებიდან იუზერის წაშლა
    setRemoteStreams((prev: any) =>
      prev?.filter((p: any) => p?.userId !== userId)
    );
    // 2. PeerConnection-ის ტრეკების შემოწმება
    if (peerConnections?.current) {
      const peerConnection = peerConnections.current[userId];
      if (peerConnection) {
        const senders = peerConnection.getSenders();
        const receivers = peerConnection.getReceivers();

        const hasLocalTracks = senders.some(
          (sender: any) => sender.track?.enabled
        );
        const hasRemoteTracks = receivers.some(
          (receiver: any) => receiver.track?.enabled
        );

        console.log("local: " + hasLocalTracks);
        console.log("remote: " + hasRemoteTracks);

        if (hasRemoteTracks && !hasLocalTracks) {
          // მხოლოდ მიღებული ტრეკებია
          console.log(`Only remote tracks found for user: ${userId}`);
          receivers.forEach((receiver: any) => {
            if (receiver.track) {
              receiver.track.stop(); // მიღებული ტრეკის გაჩერება
              console.log(`Stopped remote track: ${receiver.track.kind}`);
            }
          });

          peerConnection.close();
          delete peerConnections.current[userId];
          console.log(
            `Closed and removed PeerConnection for user (remote-only): ${userId}`
          );
        } else if (hasRemoteTracks && hasLocalTracks) {
          // ორივე მხარის ტრეკებია
          console.log(`Both local and remote tracks found for user: ${userId}`);
          receivers.forEach((receiver: any) => {
            if (receiver.track) {
              receiver.track.stop(); // მიღებული ტრეკის გაჩერება
              console.log(`Stopped remote track: ${receiver.track.kind}`);
            }
          });

          console.log(
            `Removed only remote tracks for user: ${userId}, keeping connection active.`
          );
        } else {
          // არცერთი ტრეკი არ არსებობს
          console.warn(`No tracks found for user: ${userId}`);
          peerConnection.close();
          delete peerConnections.current[userId];
          console.log(`Closed and removed empty PeerConnection: ${userId}`);
        }
      } else {
        console.warn(`No PeerConnection found for user: ${userId}`);
      }
    }
  } catch (error) {
    console.log(`Error removing user from stream: ${userId}`, error);
  }
};

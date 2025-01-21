import { createPeerConnection } from "./createPeerConnection";

export const StartConnection = async (
  stream: any,
  currentUser: any,
  peerConnections: any,
  socket: any,
  setRemoteStreams: any,
  allUsers: any
) => {
  try {
    for (const user of allUsers) {
      try {
        // Step 1: შექმენით PeerConnection
        if (!peerConnections.current[user?.userId]) {
          createPeerConnection(
            user?.userId,
            peerConnections,
            socket,
            setRemoteStreams,
            stream,
            currentUser
          );

          // Step 2: შექმენით offer
          const offer = await peerConnections.current[
            user?.userId
          ]?.createOffer();
          if (!offer) {
            console.warn(`Failed to create offer for user ${user?.userId}`);
            continue;
          }
          // Step 3: დასვით ადგილობრივი აღწერა
          await peerConnections.current[user?.userId]?.setLocalDescription(
            offer
          );
          // Step 4: გააგზავნეთ offer
          socket?.emit("send-offer", {
            signal: offer,
            creatorId: currentUser?._id,
            receiverSocket: user?.socketId,
          });
          console.log(`Offer sent to user ${user?.userId}`);
        }
      } catch (error) {
        console.log("here error...... start");
        console.log(`Error handling user ${user?.userId}:`, error);
      }
    }
  } catch (error) {
    console.log("Error starting call:", error);
  }
};

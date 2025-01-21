// კანდიდატების მიღება
export const handleReceiveCandidate = async ({
  candidate,
  userId,
  peerConnections,
}: {
  candidate: RTCIceCandidateInit;
  userId: string;
  peerConnections: any;
}) => {
  // ვამოწმებთ, არსებობს თუ არა კავშირი მოცემული `userId`-ისთვის
  if (!peerConnections.current[userId]) {
    console.warn(`PeerConnection not found for userId: ${userId}`);
    return;
  } else {
    try {
      // ვამატებთ ICE კანდიდატს კავშირის ობიექტში
      await peerConnections.current[userId].addIceCandidate(candidate);
      console.log(`ICE candidate added for userId: ${userId}`);
    } catch (error) {
      console.log(`Error adding ICE candidate for userId: ${userId}:`, error);
    }
  }
};

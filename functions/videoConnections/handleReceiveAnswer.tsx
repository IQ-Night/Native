// პასუხის მიღება
export const handleReceiveAnswer = async ({
  signal,
  userId,
  peerConnections,
  setLoading,
}: {
  signal: RTCSessionDescriptionInit;
  creatorId: string;
  userId: string;
  peerConnections: any;
  setLoading: any;
}) => {
  // თუ პასუხის გამომგზავნთან კავშირი არ არსებობს დააბრუნე ფუნქცია (იგი იქმნება შეთავაზების გაგზავნის მომენტში)
  if (!peerConnections.current[userId]) {
    console.log(`PeerConnection for userId ${userId} not found.`);
    return;
  }
  // თუ უკვე არსებობს კავშირი ვიღებთ მას კავშირებიდან
  const peerConnection = peerConnections.current[userId];

  // კავშირის სთეითი თუ არის სწორი (ლოკალური ოფერი), აბრუნებს ფუნქციას
  if (peerConnection.signalingState !== "have-local-offer") {
    console.log(
      `Cannot set remote description. Current signaling state: ${peerConnection.signalingState}`
    );
    return;
  }

  try {
    // ვანიჭებთ აღწერას "სიგნალი", რომელიც მანამდე იყო მხოლოდ "შეთავაზება"
    await peerConnection.setRemoteDescription(signal);
    setLoading(null);
  } catch (error) {
    console.log(
      `Error setting remote description for userId: ${userId}`,
      error
    );
  }
};

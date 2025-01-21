import { createPeerConnection } from "./createPeerConnection";

// შეთავაზების მიღება კავშირის დაწყებასთან დაკავშირებით
export const handleReceiveOffer = async ({
  signal,
  creatorId,
  peerConnections,
  socket,
  setRemoteStreams,
  setLoading,
  currentUser,
  localStream,
}: {
  signal: RTCSessionDescriptionInit;
  creatorId: string;
  peerConnections: any;
  socket: any;
  setRemoteStreams: any;
  setLoading: any;
  currentUser: any;
  localStream: any;
}) => {
  try {
    // თუ ამ მომხმარებელთან კავშირი არ არსებობს, შევქმნათ ახალი კავშირი
    if (!peerConnections.current[creatorId]) {
      createPeerConnection(
        creatorId,
        peerConnections,
        socket,
        setRemoteStreams,
        localStream,
        currentUser
      );
    }
    // ვრთავთ ჩატვირთვის ინდიკატორს
    setLoading(creatorId);
    // ვანიჭებთ "remote description"-ს შემოსულ სიგნალს
    await peerConnections.current[creatorId]?.setRemoteDescription(signal);
    // ვქმნით პასუხს (answer)
    const answer = await peerConnections.current[creatorId]?.createAnswer();
    // ვამატებთ "local description"
    await peerConnections.current[creatorId]?.setLocalDescription(answer);
    // ვუგზავნით შემომთავაზებელ იუზერს პასუხს
    socket.emit("send-answer", {
      signal: answer,
      creatorId,
    });

    console.log(`Answer sent to user ${creatorId}`);
  } catch (error: any) {
    console.log(error);
  }
};

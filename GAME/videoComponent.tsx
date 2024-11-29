import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { RTCView } from "react-native-webrtc";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useVideoConnectionContext } from "../context/videoConnection";

const VideoComponent = ({ userId, setOpenVideo }: any) => {
  const { localStream, remoteStreams, setLoading } =
    useVideoConnectionContext();
  const { currentUser } = useAuthContext();
  const { theme } = useAppContext();

  const userStream = remoteStreams?.find(
    (stream: any) => stream.userId === userId
  );

  console.log(userStream);
  if (userStream) {
    console.log("user stream..........");
    console.log(userStream?.streams?.toURL());
  }
  console.log(currentUser?.name);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [remoteStreams]);

  useEffect(() => {
    setLoading(false);
  }, [localStream]);

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        if (userStream) {
          setOpenVideo(userStream?.streams?.toURL());
        } else {
          setOpenVideo(localStream?.toURL());
        }
      }}
    >
      {/* ლოკალური ნაკადი */}
      {localStream && currentUser?._id === userId && (
        <RTCView
          key="local"
          streamURL={localStream.toURL()}
          style={styles.video}
          objectFit="cover"
        />
      )}

      {/* დისტანციური ნაკადი */}
      {userStream && (
        <RTCView
          key={`remote-${userId}`}
          streamURL={userStream?.streams?.toURL()}
          style={styles.video}
          objectFit="cover"
        />
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
});

export default VideoComponent;

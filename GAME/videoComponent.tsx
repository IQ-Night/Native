import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import InCallManager from "react-native-incall-manager";
import { RTCView } from "react-native-webrtc";
import { useAuthContext } from "../context/auth";
import { useVideoConnectionContext } from "../context/videoConnection";
import { useAppContext } from "../context/app";

const VideoComponent = ({
  userId,
  setOpenVideo,
  game,
  currentUserRole,
  user,
  setOpenUser,
}: any) => {
  const { localStream, remoteStreams, setLoading } =
    useVideoConnectionContext();
  const { currentUser } = useAuthContext();
  const { haptics } = useAppContext();

  const userStream = remoteStreams?.find(
    (stream: any) => stream.userId === userId
  );

  useEffect(() => {
    if (InCallManager) {
      // Start InCallManager and enable speaker on mount
      InCallManager.start({ media: "video" }); // or "audio" for audio-only
      InCallManager.setSpeakerphoneOn(true); // Enable speaker

      return () => {
        // Stop InCallManager on unmount
        InCallManager.stop();
      };
    }
  }, []);

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
      style={[
        styles.container,
        {
          display:
            game?.value !== "Night" ||
            (game?.value === "Night" && currentUserRole?.includes("mafia"))
              ? "flex"
              : "none",
        },
      ]}
      onPress={() => {
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        if (userStream) {
          setOpenVideo({ video: userStream.streams?.toURL(), user });
        } else if (localStream) {
          setOpenVideo({ video: localStream?.toURL(), user });
        } else {
          setOpenUser(user);
        }
      }}
    >
      {/* Local Stream */}
      {localStream && currentUser?._id === userId && (
        <RTCView
          key="local"
          streamURL={localStream.toURL()}
          style={styles.video}
          objectFit="cover"
        />
      )}

      {/* Remote Stream */}
      {userStream && (
        <RTCView
          key={`remote-${userId}`}
          streamURL={userStream.streams?.toURL()}
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
  audioIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 5,
  },
  audioText: {
    color: "white",
    fontSize: 16,
  },
});

export default VideoComponent;

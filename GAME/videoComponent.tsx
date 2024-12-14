import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { RTCView } from "react-native-webrtc";
import { useVideoConnectionContext } from "../context/videoConnection";
import { useAuthContext } from "../context/auth";
import InCallManager from "react-native-incall-manager";
import { Audio } from "expo-av";

const VideoComponent = ({
  userId,
  setOpenVideo,
  game,
  currentUserRole,
  user,
}: any) => {
  const { localStream, remoteStreams, setLoading } =
    useVideoConnectionContext();
  const { currentUser } = useAuthContext();

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
        if (userStream) {
          setOpenVideo({ video: userStream.streams?.toURL(), user });
        } else {
          setOpenVideo({ video: localStream?.toURL(), user });
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

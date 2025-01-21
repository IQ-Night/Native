import { BlurView } from "expo-blur";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RTCView } from "react-native-webrtc";
import { useVideoConnectionContext } from "../context/videoConnection";

const PersonalTimeOfDead = ({
  game,
  timeController,
  skip,
  skipLastTimerLoading,
}: any) => {
  /**
   * App context
   */
  const { theme, activeLanguage } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Game context
   */
  const { socket, activeRoom, gamePlayers } = useGameContext();

  /**
   * Video context
   */
  const {
    video,
    setVideo,
    microphone,
    setMicrophone,
    localStream,
    remoteStreams,
  } = useVideoConnectionContext();

  useEffect(() => {
    if (socket) {
      const skipSpeech = (data: any) => {
        if (game?.options[0]?.userId === data?.user) {
          skip();
        }
      };
      socket.on("userStatusInRoom", skipSpeech);
      return () => {
        socket.off("userStatusInRoom", skipSpeech);
      };
    }
  }, [socket, game, skip]);

  // Memoized Stream URLs
  const localStreamURL = useMemo(() => localStream?.toURL(), [localStream]);

  const [userStream, setUserStream] = useState<any>(null);
  const [userStreamURL, setUserStreamURL] = useState<any>(null);
  useEffect(() => {
    setUserStream(
      remoteStreams?.find(
        (stream: any) => stream.userId === game.options[0]?.userId
      )
    );
  }, [remoteStreams, game.options[0]?.userId]);

  useEffect(() => {
    if (userStream?.streams) {
      setUserStreamURL(userStream.streams?.toURL());
    }
  }, [userStream]);

  // /**
  //  * update user video audio status
  //  */
  const [isVideoActive, setIsVideoActive] = useState<boolean>(true);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(true);

  const handleUpdateStatus = (data: any) => {
    if (
      data?.userId !== currentUser?._id &&
      data?.userId === userStream?.userId
    ) {
      if (userStream && userStream?.streams) {
        const audioTrack = userStream?.streams
          ?.getAudioTracks()
          ?.find((track: any) => track.kind === "audio");
        if (audioTrack) {
          audioTrack.enabled = data?.audio === "active" ? true : false; // ტრეკის სტატუსის ტოგგლირება
          if (data?.audio === "active") {
            setIsAudioActive(true);
          } else {
            setIsAudioActive(false);
          }
        } else {
          console.warn("No audio track found in the user stream.");
        }
        const videoTrack = userStream?.streams
          ?.getVideoTracks()
          ?.find((track: any) => track.kind === "video");
        if (videoTrack) {
          videoTrack.enabled = data?.video === "active" ? true : false; // ტრეკის სტატუსის ტოგგლირება
          if (data?.video === "active") {
            setIsVideoActive(true);
          } else {
            setIsVideoActive(false);
          }
        } else {
          console.warn("No audio track found in the user stream.");
        }
      }
    }
  };
  useEffect(() => {
    handleUpdateStatus(game.options[0]);
  }, [userStream, game.options[0].userId, userStreamURL]);

  useEffect(() => {
    if (socket) {
      socket.on("userMediaStatusUpdated", handleUpdateStatus);
      return () => {
        socket.off("userMediaStatusUpdated", handleUpdateStatus);
      };
    }
  }, [socket, userStream]);

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        zIndex: 90,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: 24,
          marginBottom: 32,
          fontWeight: "600",
        }}
      >
        {activeLanguage?.killed}!
      </Text>
      <Text style={{ color: theme.text }}>{game.options[0]?.userName}</Text>
      {/* Local Stream */}
      {video === "active" &&
        localStreamURL &&
        currentUser?._id === game?.options[0]?.userId && (
          <View
            style={[
              styles.video,
              { alignItems: "center", justifyContent: "center" },
            ]}
          >
            <RTCView
              key="local"
              streamURL={localStreamURL}
              style={styles.video}
              objectFit="cover"
            />
          </View>
        )}
      {/* Remote Stream */}
      {isVideoActive &&
        userStreamURL &&
        userStream?.userId === game.options[0].userId && (
          <View
            style={[
              styles.video,
              { alignItems: "center", justifyContent: "center" },
            ]}
          >
            <RTCView
              key={`remote-${game.options[0].userId}`}
              streamURL={userStreamURL}
              style={styles.video}
              objectFit="cover"
            />
          </View>
        )}
      <View
        style={{
          minWidth: 64,
          height: 24,
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.05)",
          borderRadius: 50,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          justifyContent: "center",
          marginTop: 24,
        }}
      >
        <View
          style={{
            minWidth: 64,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",

            paddingHorizontal: 10,
            gap: 3,
          }}
        >
          <MaterialCommunityIcons name="timer" size={16} color={theme.active} />
          <Text
            style={{
              color: theme.text,
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            {timeController > 0 && timeController + "s."}
          </Text>
        </View>
      </View>

      {game.options[0].userId === currentUser?._id && (
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={skip}
            style={{
              width: 160,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 6,
              borderRadius: 50,
              backgroundColor: theme.active,
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.2)",
              height: 32,
            }}
          >
            <Text style={{ color: "white", fontWeight: 600 }}>
              {skipLastTimerLoading ? (
                <ActivityIndicator size={16} color="white" />
              ) : (
                activeLanguage?.skip
              )}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </BlurView>
  );
};

export default PersonalTimeOfDead;

const styles = StyleSheet.create({
  video: {
    width: 200,
    height: 200,
  },
});

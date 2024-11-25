import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";

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

  useEffect(() => {
    if (socket) {
      const handleUpdateStatus = (data: any) => {
        if (game?.options[0]?.userId === data?.user) {
          skip();
        }
      };
      socket.on("userStatusInRoom", handleUpdateStatus);
      return () => {
        socket.off("userStatusInRoom", handleUpdateStatus);
      };
    }
  }, [socket, game, skip]);

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
      <View
        style={{
          backgroundColor: "blue",
          borderRadius: 200,
          height: 200,
          width: 200,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: theme.text }}>
          Video {timeController > 0 && timeController + "s."}
        </Text>
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

const styles = StyleSheet.create({});

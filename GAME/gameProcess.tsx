import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Button from "../components/button";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";

const GameProcess = ({
  game,
  timeController,
  loading,
  setLoading,
  dayNumber,
  nightNumber,
  activePlayerToSpeech,
  speechTimer,
  SkipSpeech,
  changeSpeakerLoading,
  skipLoading,
  SkipNight,
  nightSkips,
  commonTimeSkips,
  CommonTimeSkip,
  setOpenConfirmRoles,
  StartPlay,
  skipLastWord,
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
  const { spectators, gamePlayers, socket, activeRoom, loadingSpectate } =
    useGameContext();

  /** Mark the player as ready to start */
  const ReadyToStart = async () => {
    if (socket) {
      setLoading(true);
      socket.emit("readyToStart", {
        roomId: activeRoom._id,
        userId: currentUser._id,
        status: gamePlayers.find((it: any) => it.userId === currentUser._id)
          .readyToStart
          ? false
          : true,
      });
    }
  };

  /*
   * total players to ready start game
   */
  const totalReadyPlayers = gamePlayers?.filter((p: any) => p.readyToStart);

  // Get current user type (either "spectator" or "player")
  const currentUserType =
    spectators?.find((p: any) => p?.userId === currentUser?._id)?.type ===
    "spectator"
      ? "spectator"
      : gamePlayers?.find((p: any) => p?.userId === currentUser?._id)?.type ===
        "player"
      ? "player"
      : null;

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: timeController > 1 ? 1 : 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnim, {
      toValue: timeController > 1 ? 1 : 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [timeController]);
  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: speechTimer > 1 ? 1 : 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnim, {
      toValue: speechTimer > 1 ? 1 : 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [speechTimer]);

  /**
   * current user role
   */
  const currentUserRole = gamePlayers?.find(
    (player: any) => player?.userId === currentUser?._id
  )?.role?.value;
  /**
   * current user status
   */
  const currentUserDeath = gamePlayers?.find(
    (player: any) => player?.userId === currentUser?._id
  )?.death;

  /**
   * last word speech skip
   */
  useEffect(() => {
    if (socket) {
      const skipSpeech = (data: any) => {
        if (game?.options[0]?.userId === data?.user) {
          skipLastWord();
        }
      };
      socket.on("userStatusInRoom", skipSpeech);
      return () => {
        socket.off("userStatusInRoom", skipSpeech);
      };
    }
  }, [socket, game, skipLastWord]);

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        height: 110,
        gap: 16,
      }}
    >
      {!loadingSpectate && (
        <View
          style={{
            width: "100%",
            borderRadius: 100,
            overflow: "hidden",
          }}
        >
          {game.value === "Ready to start" ? (
            <>
              {currentUserType === "player" && (
                <Button
                  loading={loading}
                  title={
                    gamePlayers.find((it: any) => it.userId === currentUser._id)
                      ?.readyToStart
                      ? activeLanguage?.not_ready_yet
                      : activeLanguage?.ready_to_start
                  }
                  style={{
                    width: "100%",
                    backgroundColor: gamePlayers.find(
                      (it: any) => it.userId === currentUser._id
                    )?.readyToStart
                      ? "rgba(255,255,255,0.05)"
                      : theme.active,
                    color: gamePlayers.find(
                      (it: any) => it.userId === currentUser._id
                    )?.readyToStart
                      ? "#888"
                      : "white",
                  }}
                  onPressFunction={ReadyToStart}
                />
              )}
            </>
          ) : (
            <Text
              style={{
                color:
                  game.value === "Users are confirming own roles.."
                    ? theme.text
                    : theme.active,
                fontSize: 20,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {game.value === "Day"
                ? activeLanguage?.day
                : game.value === "Users are confirming own roles.."
                ? activeLanguage?.users_confirming_roles
                : game.value === "Getting to know mafias"
                ? activeLanguage?.getting_to_know_mafias
                : game.value === "Night"
                ? activeLanguage?.night
                : game.value === "Common Time"
                ? activeLanguage?.common_time
                : game.value === "Personal Time Of Death"
                ? activeLanguage?.last_speech
                : " "}{" "}
              {game.value === "Day"
                ? `${dayNumber}`
                : game.value === "Night"
                ? nightNumber
                : undefined}
            </Text>
          )}
        </View>
      )}
      {activeRoom?.admin.founder?.id === currentUser?._id &&
        game.value === "Ready to start" && (
          <View
            style={{
              width: "100%",
              height: 32,
              marginTop: 16,
            }}
          >
            {game.value === "Ready to start" &&
            totalReadyPlayers.length > 3 &&
            parseInt(activeRoom.options.maxPlayers) !==
              totalReadyPlayers?.length ? (
              <Button
                title={`${activeLanguage?.start_play} (${totalReadyPlayers?.length} ${activeLanguage?.players})
              `}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: theme.active,
                }}
                onPressFunction={() =>
                  setOpenConfirmRoles({
                    active: true,
                    function: () => {
                      StartPlay();
                      setOpenConfirmRoles(null);
                    },
                  })
                }
              />
            ) : game.value === "Ready to start" &&
              totalReadyPlayers.length > 3 &&
              parseInt(activeRoom.options.maxPlayers) ===
                totalReadyPlayers?.length ? (
              <Button
                title={`${activeLanguage?.start_play}
            `}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: theme.active,
                }}
                onPressFunction={StartPlay}
              />
            ) : game.value === "Ready to start" &&
              totalReadyPlayers?.length < 4 ? (
              <Text
                style={{
                  color: "#888",
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                {activeLanguage?.start_play}
              </Text>
            ) : (
              ""
            )}
          </View>
        )}
      {game?.value !== "Ready to start" && (
        <Animated.View
          style={{
            height: 24,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
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
              <MaterialCommunityIcons
                name="timer"
                size={16}
                color={
                  game.value === "Personal Time Of Death" ? "red" : theme.active
                }
              />
              <Text
                style={{
                  color:
                    game.value === "Personal Time Of Death"
                      ? "red"
                      : theme.text,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {timeController + activeLanguage?.sec}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
      {game.value === "Day" &&
        activePlayerToSpeech?.userId === currentUser?._id && (
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={SkipSpeech}
              style={{
                width: 160,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 6,
                borderRadius: 50,
                backgroundColor: "#181818",
                borderWidth: 1,
                borderColor: theme.active,
                height: 34,
                position: "relative",
                bottom: 8,
              }}
            >
              <Text style={{ color: theme.active, fontWeight: 600 }}>
                {changeSpeakerLoading ? (
                  <ActivityIndicator size={16} color={theme.active} />
                ) : (
                  activeLanguage?.skip
                )}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      {game.value === "Night" &&
        !currentUserDeath &&
        (currentUserRole?.includes("mafia") ||
          currentUserRole === "doctor" ||
          currentUserRole === "police" ||
          (currentUserRole === "serial-killer" && nightNumber > 1)) && (
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={SkipNight}
              style={{
                width: 160,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 6,
                borderRadius: 50,
                backgroundColor: "#181818",
                borderWidth: 1,
                borderColor: nightSkips?.find(
                  (skip: any) => skip === currentUser?._id
                )
                  ? theme.text
                  : theme.active,
                height: 34,
                position: "relative",
                bottom: 8,
              }}
            >
              <Text
                style={{
                  color: nightSkips?.find(
                    (skip: any) => skip === currentUser?._id
                  )
                    ? theme.text
                    : theme.active,
                  fontWeight: 600,
                }}
              >
                {skipLoading ? (
                  <ActivityIndicator size={16} color={theme.active} />
                ) : nightSkips?.find(
                    (skip: any) => skip === currentUser?._id
                  ) ? (
                  activeLanguage?.cancel
                ) : (
                  activeLanguage?.skip
                )}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      {game.value === "Common Time" && !currentUserDeath && (
        <View style={{ alignItems: "center", marginTop: 16 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={CommonTimeSkip}
            style={{
              width: 160,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 6,
              borderRadius: 50,
              backgroundColor: "#181818",
              borderWidth: 1,
              borderColor: commonTimeSkips?.find(
                (skip: any) => skip === currentUser?._id
              )
                ? theme.text
                : theme.active,
              height: 34,
              position: "relative",
              bottom: 8,
            }}
          >
            <Text
              style={{
                color: commonTimeSkips?.find(
                  (skip: any) => skip === currentUser?._id
                )
                  ? theme.text
                  : theme.active,
                fontWeight: 600,
              }}
            >
              {skipLoading ? (
                <ActivityIndicator size={16} color={theme.active} />
              ) : commonTimeSkips?.find(
                  (skip: any) => skip === currentUser?._id
                ) ? (
                activeLanguage?.cancel
              ) : (
                activeLanguage?.skip
              )}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {game.value === "Personal Time Of Death" &&
        game.options[0].userId === currentUser?._id && (
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={skipLastWord}
              style={{
                width: 160,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 6,
                borderRadius: 50,
                backgroundColor: "#181818",
                borderWidth: 1,
                borderColor: theme.active,
                height: 34,
                position: "relative",
                bottom: 8,
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
    </View>
  );
};

export default GameProcess;

const styles = StyleSheet.create({});

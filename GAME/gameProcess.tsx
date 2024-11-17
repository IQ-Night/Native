import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import Button from "../components/button";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { BlurView } from "expo-blur";
import { roles } from "../context/rooms";

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
  setOpenConfirmRoles,
  StartPlay,
}: any) => {
  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

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
                      ? "Cancel - Not ready yet"
                      : "Ready to start"
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
                color: theme.active,
                fontSize: 20,
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {game.value}{" "}
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
                title={`Start play with ${totalReadyPlayers?.length} players
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
                title={`Start play
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
                Start play
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
                color={theme.active}
              />
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {timeController + "s."}
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
                  "Skip"
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

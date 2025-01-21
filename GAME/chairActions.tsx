import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import VideoComponent from "../components/videoComponent";
import Img from "../components/image";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ChaitActions = ({
  game,
  currentUserRole,
  timeController,
  item,
  userInPlay,
  userSpectator,
  sherifPlayer,
  findNight,
  nightNumber,
  dayNumber,
  FindSherif,
  FindMafia,
  KillPlayer,
  nightVotes,
  alreadySafedOnce,
  VoteToSafe,
  safePlayer,
  foundedMafias,
  KillPlayerBySerialKiller,
  activePlayerToSpeech,
  VoiceToLeave,
  dailyVotes,
  voteLoading,
  killBySerialKiller,
  isMafiaRevealed,
  roles,
  speechTimer,
  textColor,
  setOpenVideo,
  setOpenUser,
  appPositionStatus,
  userStatus,
}: any) => {
  const { haptics, theme, activeLanguage } = useAppContext();
  const { currentUser } = useAuthContext();
  const { gamePlayers } = useGameContext();

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

  // Define a separate scale animation for the "Video" view
  const videoScaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Only trigger the animation when specific conditions are met
    if (
      (activePlayerToSpeech?.userId === item?.userId && game.value === "Day") ||
      game.value === "Common Time"
    ) {
      // Animate to scale up
      Animated.timing(videoScaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate to scale down
      Animated.timing(videoScaleAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }
  }, [activePlayerToSpeech, game.value]);

  return (
    <Animated.View
      style={{
        // transform: [{ scale: scaleAnim }],
        // opacity: opacityAnim,
        width: (SCREEN_WIDTH * 0.9 - 72) / 4,
        aspectRatio: 1,
        borderRadius: 100,
        position: "absolute",
        zIndex: 50,
      }}
    >
      <View
        style={{
          width: (SCREEN_WIDTH * 0.9 - 72) / 4,
          height: (SCREEN_WIDTH * 0.9 - 72) / 4,
          borderRadius: 50,
          overflow: "hidden",
          borderWidth: 2,
          borderColor:
            activePlayerToSpeech?.userId === item?.userId
              ? theme.active
              : game.value === "Personal Time Of Death" &&
                game.options[0].userId === item.userId
              ? "red"
              : textColor,
        }}
      >
        <VideoComponent
          userId={item?.userId}
          user={item}
          setOpenVideo={setOpenVideo}
          game={game}
          currentUserRole={currentUserRole}
          setOpenUser={setOpenUser}
          activePlayerToSpeech={activePlayerToSpeech}
          display={
            appPositionStatus === "active" && userStatus === "online"
              ? true
              : false
          }
        />
      </View>
      {/** Mafias action */}
      {game?.value === "Night" && currentUserRole?.includes("mafia") && (
        <BlurView
          tint="dark"
          intensity={40}
          style={{
            position: "absolute",
            zIndex: 50,
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 100,
            overflow: "hidden",
            gap: 4,
          }}
        >
          {/** Don action, find police */}
          {!userInPlay?.death &&
            currentUserRole === "mafia-don" &&
            game.value === "Night" &&
            item.role.value !== "mafia" &&
            currentUser?._id !== item.userId &&
            gamePlayers?.some((user: any) => user.role.value === "police") &&
            !sherifPlayer &&
            findNight !== nightNumber && (
              <Pressable
                onPress={(e: any) => {
                  if (!userInPlay?.death && !userSpectator) {
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }

                    e.stopPropagation();
                    FindSherif();
                  }
                }}
                style={{
                  width: "70%",
                  height: "33%",
                  borderRadius: 100,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.5)",
                  flexDirection: "row",
                  gap: 4,
                }}
              >
                <MaterialIcons
                  name="local-police"
                  size={16}
                  color={theme.active}
                />
                {/* <Text style={{ color: theme.active }}>?</Text> */}
              </Pressable>
            )}
          {/** Mafia kill */}
          <Pressable
            onPress={(e) => {
              if (!userInPlay?.death && !userSpectator) {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                e.stopPropagation();
                KillPlayer();
              }
            }}
            style={{
              width: "70%",
              height: "33%",
              borderRadius: 100,
              backgroundColor: "rgba(0,0,0,0.7)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.5)",
              flexDirection: "row",
              gap: 4,
            }}
          >
            <MaterialCommunityIcons
              name="skull"
              color={
                nightVotes?.find((nv: any) => nv.killer === currentUser?._id)
                  ? "red"
                  : "white"
              }
              size={16}
            />

            {nightVotes?.length > 0 &&
              !gamePlayers?.find((p: any) => p.role.value === "mafia-don") &&
              currentUserRole?.includes("mafia") &&
              game.value === "Night" && (
                <Pressable
                  style={{
                    alignItems: "center",
                    justifyContent: "center",

                    zIndex: 60,
                  }}
                >
                  <Text
                    style={{
                      color: "red",
                      fontWeight: 600,
                      fontSize: 14,
                      position: "relative",
                      bottom: 0.5,
                    }}
                  >
                    {nightVotes?.length}
                  </Text>
                </Pressable>
              )}
          </Pressable>
        </BlurView>
      )}
      {/** Doctor action, safe player */}
      {game?.value === "Night" &&
        currentUserRole === "doctor" &&
        !alreadySafedOnce?.find(
          (sf: any) => sf.safePlayer?.playerId === item?.userId
        ) && (
          <BlurView
            tint="dark"
            intensity={40}
            style={{
              position: "absolute",
              zIndex: 50,
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 100,
              overflow: "hidden",
              gap: 4,
            }}
          >
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                VoteToSafe(
                  safePlayer === item?.userId ? undefined : item?.userId
                );
              }}
              style={{
                width: "70%",
                height: "33%",
                borderRadius: 100,
                backgroundColor: "rgba(0,0,0,0.7)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.5)",
                flexDirection: "row",
                gap: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "red",
                }}
              >
                {safePlayer === item?.userId ? "-" : "+"}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.text,
                }}
              >
                {safePlayer === item?.userId ? "" : "Safe"}
              </Text>
            </Pressable>
          </BlurView>
        )}
      {/** Police action, find mafia */}
      {!userInPlay?.death &&
        currentUserRole === "police" &&
        game.value === "Night" &&
        currentUser?._id !== item.userId &&
        findNight !== nightNumber &&
        !foundedMafias?.find((m: any) => m === item?.userId) &&
        foundedMafias?.length <
          gamePlayers?.filter((gp: any) => gp?.role?.value?.includes("mafia"))
            ?.length && (
          <BlurView
            tint="dark"
            intensity={40}
            style={{
              position: "absolute",
              zIndex: 50,
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 100,
              overflow: "hidden",
            }}
          >
            <Pressable
              onPress={() => {
                if (!userInPlay?.death && !userSpectator) {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  FindMafia();
                }
              }}
              style={{
                width: "90%",
                height: "35%",
                borderRadius: 100,
                backgroundColor: "rgba(0,0,0,0.7)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.5)",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Text
                style={{
                  color: theme.active,
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {activeLanguage?.mafia}?
              </Text>
              {dailyVotes > 0 && (
                <Pressable
                  style={{
                    alignItems: "center",
                    justifyContent: "center",

                    zIndex: 60,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: 600,
                      fontSize: 12,
                      position: "relative",
                      bottom: 0.5,
                    }}
                  >
                    {dailyVotes}
                  </Text>
                </Pressable>
              )}
            </Pressable>
          </BlurView>
        )}
      {/** Serial killer action, kill player */}
      {game?.value === "Night" &&
        nightNumber > 1 &&
        currentUserRole?.includes("serial") &&
        !item?.role?.value.includes("serial") &&
        userInPlay?.role?.totalKills > 0 &&
        !userInPlay?.death && (
          <BlurView
            tint="dark"
            intensity={40}
            style={{
              position: "absolute",
              zIndex: 50,
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 100,
              overflow: "hidden",
            }}
          >
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (!userInPlay?.death && !userSpectator) {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }

                  KillPlayerBySerialKiller();
                }
              }}
              style={{
                width: "90%",
                height: "30%",
                borderRadius: 100,
                backgroundColor: "rgba(0,0,0,0.7)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.5)",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <MaterialCommunityIcons name="skull" color="red" size={12} />
              <Text
                style={{
                  color: "red",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                Kill
              </Text>
            </Pressable>
          </BlurView>
        )}
      {/** Day nomination action */}
      {game?.value === "Day" &&
        dayNumber > 1 &&
        activePlayerToSpeech?.userId !== item?.userId &&
        activePlayerToSpeech?.userId === currentUser?._id &&
        speechTimer > 1 && (
          <BlurView
            tint="dark"
            intensity={40}
            style={{
              position: "absolute",
              zIndex: 90,
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 100,
              overflow: "hidden",
            }}
          >
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (activePlayerToSpeech?.userId === currentUser?._id) {
                  if (!userInPlay?.death && !userSpectator) {
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                    if (game.value === "Day" && game.options.length === 0) {
                      VoiceToLeave();
                    }
                  }
                }
              }}
              style={{
                width: "90%",
                height: "35%",
                borderRadius: 100,
                backgroundColor: "rgba(0,0,0,0.7)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.5)",
                flexDirection: "row",
                gap: 4,
              }}
            >
              <Text
                style={{
                  color:
                    activePlayerToSpeech?.userId === currentUser?._id
                      ? theme.active
                      : "#999",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {activeLanguage?.vote}
              </Text>
              {dailyVotes > 0 && (
                <Pressable
                  style={{
                    alignItems: "center",
                    justifyContent: "center",

                    zIndex: 60,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: 600,
                      fontSize: 12,
                      position: "relative",
                      bottom: 0.5,
                    }}
                  >
                    {voteLoading ? (
                      <ActivityIndicator size={12} color={theme.active} />
                    ) : (
                      dailyVotes
                    )}
                  </Text>
                </Pressable>
              )}
            </Pressable>
          </BlurView>
        )}
      {/** Serial killer killed player */}
      {killBySerialKiller === item?.userId &&
        currentUserRole === "serial-killer" &&
        game.value === "Night" && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              if (!userInPlay?.death && !userSpectator) {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }

                KillPlayerBySerialKiller();
              }
            }}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "black",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              zIndex: 60,
              borderRadius: 50,
              overflow: "hidden",
            }}
          >
            <Text style={{ color: "red", fontSize: 40, fontWeight: 700 }}>
              X
            </Text>
          </Pressable>
        )}

      {/* {((isMafiaRevealed && item?.role?.value?.includes("mafia")) ||
        (game.value === "Night" &&
          item?.role?.value?.includes("mafia") &&
          currentUserRole?.includes("mafia"))) && (
        <View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            zIndex: 20,
            borderRadius: 50,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 10,
            }}
          >
            {roles?.find((r: any) => r.value === item?.role?.value)?.value ===
            "mafia"
              ? activeLanguage?.mafia
              : roles?.find((r: any) => r.value === item?.role?.value)
                  ?.value === "citizen"
              ? activeLanguage?.citizen
              : roles?.find((r: any) => r.value === item?.role?.value)
                  ?.value === "doctor"
              ? activeLanguage?.doctor
              : roles?.find((r: any) => r.value === item?.role?.value)
                  ?.value === "police"
              ? activeLanguage?.police
              : roles?.find((r: any) => r.value === item?.role?.value)
                  ?.value === "serial-killer"
              ? activeLanguage?.serialKiller
              : activeLanguage?.mafiaDon}
          </Text>
        </View>
      )} */}
    </Animated.View>
  );
};

export default ChaitActions;

const styles = StyleSheet.create({});

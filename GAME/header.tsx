import {
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import Button from "../components/button";
import Img from "../components/image";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import { roles } from "../context/rooms";
import { Badge } from "react-native-elements";
import { useVideoConnectionContext } from "../context/videoConnection";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Header = ({
  setAttention,
  setOpenLogs,
  game,
  setOpenSpectators,
  setOpenChat,
  openChat,
  unreadMessages,
}: any) => {
  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();
  const { currentUser } = useAuthContext();
  const {
    activeRoom,
    setActiveRoom,
    gamePlayers,
    spectators,
    socket,
    message,
    setMessage,
    setGamePlayers,
    setSpectators,
  } = useGameContext();
  const { startCall, video, setVideo } = useVideoConnectionContext();

  // Store fade animations for each item
  const [fadeAnims, setFadeAnims] = useState<Animated.Value[]>([]);

  useEffect(() => {
    if (message?.type === "User Left Game") {
      // Create a fade animation for each item in message.data
      const animations = message.data.map(() => new Animated.Value(0));
      setFadeAnims(animations);

      // Trigger fade in for each item
      animations.forEach((fadeAnim: any, index: any) => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250, // 500ms for fade-in
          useNativeDriver: true,
          delay: index * 200, // Slight delay between items
        }).start(() => {
          // Trigger fade out after a delay for each item
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 250, // 500ms for fade-out
              useNativeDriver: true,
            }).start();
          }, 1500); // Delay of 2 seconds before fading out
          setTimeout(() => {
            setMessage({ active: false, type: "", data: [] });
          }, 5000);
        });
      });
    }
  }, [message]);

  // Left room
  const [confirm, setConfirm] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const leaveRoom = (roomId: any, userId: any) => {
    if (socket) {
      setLeaveLoading(true);

      socket.emit("leaveRoom", roomId, userId);
    }
  };

  useEffect(() => {
    if (socket) {
      const leftRoom = (data: any) => {
        if (data?.userId === currentUser?._id) {
          if (data?.type === "Room closed") {
            if (activeRoom?.admin?.founder?.id === currentUser?._id) {
              setAttention({ active: false, value: "" });
              setActiveRoom(null);
              setGamePlayers([]);
              setSpectators([]);
              setLeaveLoading(false);
              setConfirm(false);
            } else {
              setAttention({ active: true, value: "Room closed" });
              setTimeout(() => {
                setAttention({ active: false, value: "" });
                setActiveRoom(null);
                setGamePlayers([]);
                setSpectators([]);
                setLeaveLoading(false);
                setConfirm(false);
              }, 2000);
            }
          } else {
            setAttention({ active: false, value: "" });
            setActiveRoom(null);
            setGamePlayers([]);
            setSpectators([]);
            setLeaveLoading(false);
            setConfirm(false);
          }
        }
        // Emit to notify the server
        socket.emit("off-video", {
          roomId: activeRoom?._id,
          userId: currentUser?._id,
        });
      };

      // Handle receiving all users when joining the room
      socket.on("userLeft", leftRoom);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("userLeft", leftRoom);
      };
    }
  }, [socket, activeRoom]);

  // disable voice & video
  const [voice, setVoice] = useState(true);

  // switch to spectator
  const changeToSpectator = async () => {
    socket.emit("changeType", {
      roomId: activeRoom?._id,
      userId: currentUser?._id,
      newType: "spectator",
    });
    setConfirm(false); // Close the confirmation modal or prompt
  };

  // switch to player
  const changeToPlayer = async () => {
    socket.emit("changeType", {
      roomId: activeRoom?._id,
      userId: currentUser?._id,
      newType: "player",
    });
    setConfirm(false); // Close the confirmation modal or prompt
  };

  // Get current user type (either "spectator" or "player")
  const currentUserType =
    spectators?.find((p: any) => p?.userId === currentUser?._id)?.type ===
    "spectator"
      ? "spectator"
      : gamePlayers?.find((p: any) => p?.userId === currentUser?._id)?.type ===
        "player"
      ? "player"
      : null;

  // current use role
  const currentUserRole = gamePlayers.find(
    (player: any) => player.userId === currentUser._id
  )?.role;
  const roleLabel =
    currentUserRole?.value === "mafia"
      ? activeLanguage?.mafia
      : currentUserRole?.value === "citizen"
      ? activeLanguage?.citizen
      : currentUserRole?.value === "doctor"
      ? activeLanguage?.doctor
      : currentUserRole?.value === "police"
      ? activeLanguage?.police
      : currentUserRole?.value === "serial-killer"
      ? activeLanguage?.serialKiller
      : currentUserRole?.value === "mafia-don"
      ? activeLanguage?.mafiaDon
      : "";
  return (
    <>
      <View
        style={{
          width: "100%",
          position: "absolute",
          zIndex: 40,
          top: 56,
          left: 0,
          gap: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable style={{ position: "absolute", top: 8, right: 64 }}>
          <MaterialIcons
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              setOpenLogs(true);
            }}
            name="format-list-bulleted"
            size={28}
            color={theme.text}
          />
        </Pressable>

        <Pressable
          style={{ position: "absolute", top: 0, right: 16, zIndex: 0 }}
          onPress={() => {
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }

            setConfirm(true);
          }}
        >
          <FontAwesome name="close" size={40} color={theme.active} />
        </Pressable>

        <View
          style={{
            height: 40,
            width: 40,
            borderRadius: 8,
            overflow: "hidden",
            marginLeft: 16,
          }}
        >
          <Img uri={activeRoom.cover} />
        </View>

        <Text style={{ color: theme.active, fontWeight: 600, fontSize: 18 }}>
          {activeRoom?.title}
        </Text>
      </View>
      {activeRoom?.spectatorMode ? (
        <View
          style={{
            position: "absolute",
            top: 112,
            left: 16,
          }}
        >
          <Pressable
            onPress={() => {
              if (spectators?.length > 0) {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setOpenSpectators(true);
              }
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="eye" size={18} color={theme.text} />
            <Text style={{ color: theme.text }}>{spectators?.length}</Text>
          </Pressable>
          {game?.value === "Ready to start" && (
            <View style={{ marginTop: 12, position: "relative", right: 8 }}>
              <Switch
                trackColor={{ false: theme.background2, true: theme.active }}
                value={currentUserType === "player" ? true : false}
                style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                onValueChange={async () => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  if (currentUserType === "player") {
                    changeToSpectator();
                  } else {
                    changeToPlayer();
                  }
                }}
              />
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            position: "absolute",
            top: 112,
            left: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="eye-off" size={18} color={theme.text} />
        </View>
      )}
      <View style={{ height: 20, position: "absolute", top: 112 }}>
        {gamePlayers.find((player: any) => player.userId === currentUser._id)
          ?.death ? (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>
              {activeLanguage?.your_role_is_death}!
            </Text>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>
              {activeLanguage?.spectator_mode}!
            </Text>
          </View>
        ) : (
          <>
            {roleLabel && (
              <View style={{ alignItems: "center", gap: 8 }}>
                <Text
                  style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}
                >
                  <Text
                    style={{
                      color: theme.active,
                    }}
                  >
                    {roleLabel}
                  </Text>{" "}
                  {currentUserRole?.value === "police" && (
                    <MaterialCommunityIcons
                      color={theme.active}
                      name="account-tie-hat"
                      size={16}
                    />
                  )}
                  {currentUserRole?.value?.includes("mafia") && (
                    <MaterialCommunityIcons
                      color={theme.active}
                      name="redhat"
                      size={16}
                    />
                  )}
                  {currentUserRole?.value === "doctor" && (
                    <FontAwesome6
                      color={theme.active}
                      name="user-doctor"
                      size={16}
                    />
                  )}
                  {currentUserRole?.value === "serial-killer" && (
                    <FontAwesome6
                      color={theme.active}
                      name="person-rifle"
                      size={16}
                    />
                  )}
                  {currentUserRole?.value === "citizen" && (
                    <FontAwesome6
                      color={theme.active}
                      name="person"
                      size={16}
                    />
                  )}
                </Text>
                {currentUserRole?.value === "serial-killer" && (
                  <Text
                    style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
                  >
                    {activeLanguage?.kills_left}:{" "}
                    <Text
                      style={{
                        color:
                          currentUserRole?.totalKills > 0
                            ? theme.active
                            : "red",
                      }}
                    >
                      {currentUserRole?.totalKills}
                    </Text>
                  </Text>
                )}
              </View>
            )}
            {spectators.find(
              (player: any) => player.userId === currentUser._id
            ) && (
              <View>
                <Text
                  style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
                >
                  {activeLanguage?.you_are_in_spectator_mode}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      <View
        style={{
          position: "absolute",
          top: 110,
          right: 18,
          zIndex: 70,
          gap: 16,
        }}
      >
        {currentUserType === "player" && (
          <Pressable>
            <MaterialCommunityIcons
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setVoice((prev: any) => !prev);
              }}
              name={voice ? "volume-high" : "volume-off"}
              size={26}
              color={theme.text}
            />
          </Pressable>
        )}

        {currentUserType === "player" && (
          <Pressable>
            <MaterialCommunityIcons
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                if (video) {
                  startCall(false);
                  setVideo(false);
                } else {
                  startCall(true);
                  setVideo(true);
                }
              }}
              name={video ? "video" : "video-off"}
              size={26}
              color={theme.text}
            />
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
            setOpenChat(true);
          }}
        >
          {unreadMessages && unreadMessages !== "empty" && (
            <Badge
              status="success"
              badgeStyle={{
                backgroundColor: theme.active,
                position: "absolute",
                zIndex: 50,
                right: -2,
                top: -2,
              }}
            />
          )}

          <MaterialCommunityIcons
            name="chat"
            size={26}
            color={openChat ? theme.active : theme.text}
          />
        </Pressable>
      </View>

      {message?.type === "User Left Game" && (
        <View
          style={{
            position: "absolute",
            bottom: 80,
            right: 16,
            zIndex: 40,
            gap: 4,
          }}
        >
          {message?.data?.map((u: any, index: number) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnims[index] || new Animated.Value(0), // Bind opacity to the individual fade animation
              }}
            >
              <Pressable
                style={{
                  padding: 6,
                  paddingHorizontal: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
                onPress={() => {
                  setActiveRoom(null);
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
              >
                <FontAwesome5 name="door-open" size={12} color={theme.text} />
                <Text style={{ color: theme.text, fontSize: 12 }}>
                  {u} {activeLanguage?.left_the_game}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}
      {confirm && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            width: "100%",
            height: SCREEN_HEIGHT,
            position: "absolute",
            top: 0,
            zIndex: 70,
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            paddingHorizontal: 16,
          }}
        >
          <View style={{ gap: 24 }}>
            <Text
              style={{
                color: theme.text,
                textAlign: "center",
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              {activeLanguage?.close_room_confirmation}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Button
                title={activeLanguage?.cancel}
                style={{
                  backgroundColor: theme.text,
                  color: "white",
                  width: "48%",
                }}
                onPressFunction={() => setConfirm(false)}
              />

              <Button
                loading={leaveLoading}
                title={
                  currentUser?._id === activeRoom?.admin?.founder?.id
                    ? activeLanguage?.close_room
                    : activeLanguage?.leaveRoom
                }
                style={{
                  backgroundColor:
                    currentUser?._id === activeRoom?.admin?.founder?.id
                      ? "red"
                      : theme.active,
                  color: "white",
                  width: "48%",
                }}
                icon={
                  currentUser?._id === activeRoom?.admin?.founder?.id ? (
                    <MaterialIcons name="close" color="white" size={24} />
                  ) : (
                    <MaterialIcons name="logout" size={24} color="white" />
                  )
                }
                onPressFunction={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }

                  leaveRoom(activeRoom._id, currentUser?._id);
                }}
              />
            </View>
          </View>
        </BlurView>
      )}
    </>
  );
};

export default Header;

const styles = StyleSheet.create({});

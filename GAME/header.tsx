import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Switch,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Button from "../components/button";
import Img from "../components/image";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import { roles } from "../context/rooms";
import { Badge } from "react-native-elements";
import { useVideoConnectionContext } from "../context/videoConnection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-paper";
import NominationDesk from "./nominationDesk";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Header = ({
  setAttention,
  setOpenLogs,
  setOpenBlackList,
  game,
  setOpenSpectators,
  setOpenChat,
  openChat,
  unreadMessages,
  setEditRoom,
  setGame,
  activePlayerToSpeech,
  setActivePlayerToSpeech,
  setDayNumber,
  setCurrentSpeechData,
  setOpenNominationsWindow,
  setNightNumber,
  setNightSkips,
  setCommonTimeSkips,
  setNights,
  setDays,
  setLastWordData,
  days,
  dayNumber,
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
    currentUserRadio,
  } = useGameContext();
  const { video, setVideo, microphone, setMicrophone, loadingFirstConnection } =
    useVideoConnectionContext();

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
  const [closeLoading, setCloseLoading] = useState(false);
  const leaveRoom = (roomId: any, userId: any, by: string) => {
    if (socket) {
      if (by === "host") {
        setLeaveLoading(true);
      }
      socket.emit("leaveRoom", roomId, userId, by);
    }
  };

  useEffect(() => {
    if (socket) {
      const leftRoom = (data: any) => {
        if (data?.userId === currentUser?._id) {
          setMicrophone("inactive");
          setVideo("inactive");
          if (data?.type?.includes("Room closed")) {
            if (activeRoom?.admin?.founder?.id === currentUser?._id) {
              if (data?.by === "host") {
                setAttention({ active: false, value: "" });
                setActiveRoom(null);
                setGamePlayers([]);
                setSpectators([]);
                setLeaveLoading(false);
                setCloseLoading(false);
                setConfirm(false);
              } else {
                setAttention({
                  active: true,
                  value: "Room closed by " + data?.by,
                });
                setTimeout(() => {
                  setActiveRoom(null);
                  setGamePlayers([]);
                  setSpectators([]);
                  setLeaveLoading(false);
                  setCloseLoading(false);
                  setConfirm(false);
                }, 1500);
              }
            } else {
              if (data?.by !== "admin") {
                setAttention({
                  active: true,
                  value: "Room closed by " + data?.by,
                });
                setTimeout(() => {
                  setAttention({ active: false, value: "" });
                  setActiveRoom(null);
                  setGamePlayers([]);
                  setSpectators([]);
                  setLeaveLoading(false);
                  setCloseLoading(false);
                  setConfirm(false);
                }, 1500);
              } else {
                setAttention({ active: false, value: "" });
                setActiveRoom(null);
                setGamePlayers([]);
                setSpectators([]);
                setLeaveLoading(false);
                setCloseLoading(false);
                setConfirm(false);
              }
            }
          } else {
            setAttention({ active: false, value: "" });
            setActiveRoom(null);
            setGamePlayers([]);
            setSpectators([]);
            setLeaveLoading(false);
            setCloseLoading(false);
            setConfirm(false);
          }
        }
      };

      // Handle receiving all users when joining the room
      socket.on("userLeft", leftRoom);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("userLeft", leftRoom);
      };
    }
  }, [socket, activeRoom]);

  // switch to spectator
  const changeToSpectator = async () => {
    socket.emit("changeType", {
      roomId: activeRoom?._id,
      userId: currentUser?._id,
      newType: "spectator",
    });
    setConfirm(false); // Close the confirmation modal or prompt
    if (video === "active" || microphone === "active") {
      setVideo("inactive");
      setMicrophone("inactive");
    }
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

  /// open lists
  const [openListMenu, setOpenListMenu] = useState(false);
  const [openListMenuIcon, setOpenListMenuIcon] = useState(false);
  const scaleAnimLists = useRef(new Animated.Value(0)).current;

  // Animation to slide the popup in and out
  useEffect(() => {
    if (openListMenu) {
      setOpenListMenuIcon(true);
      Animated.timing(scaleAnimLists, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [openListMenu]);

  const closeLists = () => {
    setOpenListMenuIcon(false);
    Animated.timing(scaleAnimLists, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setOpenListMenu(false));
  };

  /**
   * current game finish control
   */
  const [openCurrentGameFinishConfirm, setOpenCurrentGameFinishConfirm] =
    useState(false);

  const RequestFinishGame = () => {
    socket.emit("finishCurrentGame", { roomId: activeRoom?._id });
  };

  useEffect(() => {
    if (socket) {
      socket.on("currentGameFinished", FinishCurrentGame);

      return () => {
        socket.off("currentGameFinished", FinishCurrentGame);
      };
    }
  }, [socket]);

  const FinishCurrentGame = () => {
    setAttention({ active: true, value: "current game finished by admin" });
    setTimeout(() => {
      setGame({
        value: "Ready to start",
        options: [],
      });
      setGamePlayers((prev: any) => {
        return prev?.map((p: any) => {
          return {
            ...p,
            role: undefined,
            readyToStart: false,
            death: undefined,
            playerNumber: undefined,
          };
        });
      });
      setActivePlayerToSpeech(null);
      setAttention({ active: false, value: "" });
      setDayNumber(1);
      setCurrentSpeechData(null);
      setOpenNominationsWindow(null);
      setNightNumber(1);
      setNightSkips([]);
      setCommonTimeSkips([]);
      setNights([]);
      setDays([]);
      setLastWordData(null);
    }, 3000);
  };

  /**
   * Daily votes for player
   */
  const [dailyVotes, setDailyVotes] = useState([]);
  useEffect(() => {
    const day = days?.find((day: any) => day.number === dayNumber);

    if (day) {
      setDailyVotes(day.votes);
    }

    if (game?.value !== "Day") {
      setDailyVotes([]);
    }
  }, [days, dayNumber, game]);

  // open nomination desk
  const [openNominationDesk, setOpenNominationDesk] = useState(false);

  /**
   * disable video and micropohne switchers in some game stage
   */
  const [disableVideo, setDisableVideo] = useState(true);
  const [disableMicrophone, setDisableMicrophone] = useState(true);

  useEffect(() => {
    const donInGame = gamePlayers?.find(
      (p: any) => p?.role?.value === "mafia-don"
    );
    const totalMafias = gamePlayers?.filter(
      (p: any) => p?.role?.value === "mafia"
    );

    if (game?.value === "Ready to start" || game?.value === "Common Time") {
      setDisableVideo(false);
      setDisableMicrophone(false);
    } else {
      if (
        game?.value === "Day" &&
        currentUser?._id === activePlayerToSpeech?.userId
      ) {
        setDisableVideo(false);
        setDisableMicrophone(false);
      } else if (game?.value === "Getting to know mafias") {
        if (currentUserRole?.value?.includes("mafia")) {
          setDisableVideo(false);
          setDisableMicrophone(false);
        } else {
          setDisableVideo(true);
          setDisableMicrophone(true);
        }
      } else if (game?.value === "Night") {
        setDisableVideo(true);
        if (!donInGame) {
          if (currentUserRole?.value === "mafia" && totalMafias?.length > 1) {
            setDisableMicrophone(false);
          } else {
            setDisableMicrophone(true);
          }
        } else {
          setDisableMicrophone(true);
        }
      } else if (
        game?.value === "Personal Time Of Death" &&
        game?.options[0]?.userId === currentUser?._id
      ) {
        setDisableVideo(false);
        setDisableMicrophone(false);
      } else {
        setDisableVideo(true);
        setDisableMicrophone(true);
      }
    }
  }, [
    game?.value,
    activePlayerToSpeech,
    currentUser?._id,
    gamePlayers,
    currentUserRole,
  ]);

  return (
    <>
      <View
        style={{
          width: "100%",
          position: "absolute",
          zIndex: 70,
          top: 56,
          left: 0,
          gap: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <TouchableOpacity activeOpacity={0.7}>
            <AntDesign
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                if (!openListMenu) {
                  setOpenListMenu(true);
                } else {
                  closeLists();
                }
              }}
              name="menu-fold"
              size={24}
              color={openListMenuIcon ? theme.active : theme.text}
            />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7}>
            <MaterialIcons
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setEditRoom(true);
              }}
              name="settings"
              size={26}
              color={theme.text}
            />
          </TouchableOpacity>
          {(activeRoom?.admin?.founder?.id === currentUser?._id ||
            currentUser?.admin?.active) &&
            game?.value !== "Ready to start" && (
              <TouchableOpacity activeOpacity={0.7}>
                <MaterialCommunityIcons
                  onPress={() => {
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                    setOpenCurrentGameFinishConfirm(true);
                  }}
                  name="contain-end"
                  size={26}
                  color={theme.text}
                />
              </TouchableOpacity>
            )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }

              setConfirm(true);
            }}
          >
            <FontAwesome name="close" size={40} color={theme.active} />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={{
            position: "absolute",
            top: 40,
            right: 108,
            zIndex: 90,
            borderRadius: 8,
            overflow: "hidden",
            transform: [{ scale: scaleAnimLists }],
            opacity: scaleAnimLists,
            backgroundColor: "black",
          }}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              gap: 12,
              padding: 12,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setOpenLogs(true);
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <MaterialIcons
                name="format-list-bulleted"
                size={20}
                color={theme.text}
              />
              <Text style={{ color: theme.text, fontWeight: 500 }}>
                {activeLanguage?.game_logs}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setOpenBlackList(true);
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <FontAwesome6 name="users-slash" size={16} color="red" />
              <Text style={{ color: theme.text, fontWeight: 500 }}>
                {activeLanguage?.blacklist}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

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
            zIndex: 80,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
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
          </TouchableOpacity>
          {game?.value === "Ready to start" && (
            <View
              style={{
                marginTop: 12,
                position: "relative",
                right: 8,
              }}
            >
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
      <View style={{ height: 20, position: "absolute", top: 112, zIndex: 50 }}>
        {gamePlayers.find((player: any) => player.userId === currentUser._id)
          ?.death ? (
          <View style={{ alignItems: "center", gap: 8 }}>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>
              {activeLanguage?.your_role_is_death}!
            </Text>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}>
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
                <FontAwesome6 color={theme.active} name="person" size={16} />
              )}
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
                  {activeLanguage?.spectator_mode}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      <View
        style={{
          position: "absolute",
          top: 106,
          right: 14,
          zIndex: 70,
          gap: 6,
        }}
      >
        {currentUserType === "player" && !disableVideo && (
          <Pressable
            style={{ padding: 4, opacity: loadingFirstConnection ? 0.3 : 1 }}
            onPress={() => {
              if (!loadingFirstConnection) {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                if (video === "active") {
                  setVideo("inactive");
                } else {
                  setVideo("active");
                }
              }
            }}
          >
            <MaterialCommunityIcons
              name={video === "active" ? "video" : "video-off"}
              size={26}
              color={theme.text}
            />
          </Pressable>
        )}
        {currentUserType === "player" && !disableMicrophone && (
          <View
            style={{
              alignItems: "center",
              opacity: loadingFirstConnection ? 0.3 : 1,
            }}
          >
            {game?.value === "Night" && !currentUserRadio ? (
              <View></View>
            ) : (
              <Pressable
                style={{
                  padding: 4,
                }}
                onPress={() => {
                  if (!loadingFirstConnection) {
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                    if (microphone === "active") {
                      setMicrophone("inactive");
                    } else {
                      setMicrophone("active");
                    }
                  }
                }}
              >
                <FontAwesome
                  name={
                    microphone === "active" ? "microphone" : "microphone-slash"
                  }
                  size={26}
                  color={theme.text}
                />
              </Pressable>
            )}
          </View>
        )}
        {(game?.value === "Ready to start" ||
          spectators?.find((s: any) => s?.userId === currentUser?._id) ||
          gamePlayers.find((player: any) => player.userId === currentUser._id)
            ?.death) && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ padding: 4 }}
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
          </TouchableOpacity>
        )}
        {game?.value === "Day" && dailyVotes?.length > 0 && (
          <View
            style={{
              alignItems: "center",
              gap: 4,
              position: "relative",
              bottom: 10,
            }}
          >
            <View>
              <Pressable
                onPress={() => setOpenNominationDesk((prev: any) => !prev)}
              >
                <Badge
                  value={dailyVotes?.length}
                  status="success"
                  badgeStyle={{
                    backgroundColor: theme.active,
                    position: "relative",
                    left: 10,
                    top: 10,
                  }}
                />
                <MaterialCommunityIcons
                  name="vote"
                  size={26}
                  color={openNominationDesk ? theme.active : theme.text}
                />
              </Pressable>
            </View>
            {openNominationDesk && <NominationDesk dailyVotes={dailyVotes} />}
          </View>
        )}
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
              <TouchableOpacity
                activeOpacity={0.7}
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
              </TouchableOpacity>
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
            zIndex: 90,
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
                  leaveRoom(activeRoom._id, currentUser?._id, "host");
                }}
              />
            </View>
          </View>
          {currentUser?.admin?.active &&
            currentUser?._id !== activeRoom?.admin?.founder?.id && (
              <Button
                title={activeLanguage?.close_room}
                loading={closeLoading}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  width: "100%",
                }}
                onPressFunction={() => {
                  setCloseLoading(true);
                  leaveRoom(
                    activeRoom._id,
                    activeRoom?.admin?.founder?.id,
                    "admin"
                  );
                }}
                icon={<MaterialIcons name="close" color="white" size={24} />}
              />
            )}
        </BlurView>
      )}
      {openCurrentGameFinishConfirm && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            width: "100%",
            height: SCREEN_HEIGHT,
            position: "absolute",
            top: 0,
            zIndex: 90,
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
              Finish current game?
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
                onPressFunction={() => setOpenCurrentGameFinishConfirm(false)}
              />

              <Button
                loading={leaveLoading}
                title="Finish"
                style={{
                  backgroundColor: theme.active,
                  color: "white",
                  width: "48%",
                }}
                icon={
                  <MaterialCommunityIcons
                    name="contain-end"
                    color="white"
                    size={24}
                  />
                }
                onPressFunction={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  RequestFinishGame();
                  setOpenCurrentGameFinishConfirm(false);
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

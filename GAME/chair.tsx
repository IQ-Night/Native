import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Img from "../components/image";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Chair = ({
  item,
  index,
  game,
  activePlayerToSpeech,
  dayNumber,
  days,
  nightNumber,
  nights,
  speechTimer,
  findingNight,
  setFindingNight,
  safePlayer,
  setSafePlayer,
  setOpenUser,
}: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Game context
   */
  const { activeRoom, gamePlayers, socket, spectators, setGamePlayers } =
    useGameContext();

  const userInPlay = gamePlayers.find(
    (player: any) => player.userId === currentUser._id
  );
  const currentUserRole = userInPlay?.role?.value;

  // define if current user is spectator
  const userSpectator = spectators?.find(
    (s: any) => s.userId === currentUser._id
  );

  const isMafiaRevealed =
    game.value === "Getting to know mafias" &&
    currentUserRole?.includes("mafia");

  // user connection status
  const [userStatus, setUserStatus] = useState("online");

  const textColor = item?.readyToStart
    ? item?.role?.confirm
      ? "#222"
      : theme.active
    : theme.text;

  useEffect(() => {
    if (socket) {
      const handleUpdateStatus = (data: any) => {
        if (item?.userId === data?.user) {
          setUserStatus(data?.status);
          setGamePlayers((prev: any) => {
            return prev.map((p: any) => {
              if (p?.userId === data?.user) {
                return { ...p, status: data?.status };
              } else {
                return p;
              }
            });
          });
        }
      };
      socket.on("userStatusInRoom", handleUpdateStatus);
      return () => {
        socket.off("userStatusInRoom", handleUpdateStatus);
      };
    }
  }, [socket, item]);

  /**
   * Night votes for player by mafias
   */
  const [nightVotes, setNightVotes] = useState(0);

  useEffect(() => {
    const night = nights?.find((night: any) => night.number === nightNumber);

    if (night) {
      const votesForPlayer =
        night?.votes
          ?.filter((vote: any) => vote.killer)
          .filter((vote: any) => vote.victim === item?.userId).length || 0;

      setNightVotes(votesForPlayer);
    } else {
      setNightVotes(0); // If the night is not found, set votes to 0
    }
  }, [nights, nightNumber, item?.userId]);

  /**
   * Kill player by mafia during night
   */

  const KillPlayer = () => {
    if (game.value !== "Night") {
      return;
    }

    if (!currentUserRole.includes("mafia")) {
      return;
    }

    if (socket) {
      socket.emit("voiceToKill", {
        roomId: activeRoom._id,
        victimId: item?.userId,
        killerId: currentUser._id,
      });
    }
  };

  /**
   * Serial killer kill during night
   */
  // first defines if serial killer can to kill
  const serialKillerKill =
    activeRoom?.totalGames > 0 &&
    activeRoom?.lastGame?.players?.find(
      (player: any) => player?.role?.value === "serial-killer"
    );

  const [killBySerialKiller, setKillBySerialKiller] = useState(false);

  const KillPlayerBySerialKiller = async () => {
    if (game.value !== "Night") {
      return;
    }

    if (currentUserRole !== "serial-killer") {
      return;
    }

    if (serialKillerKill.totalKills < 1) {
      return;
    }

    setKillBySerialKiller((prev: boolean) => !prev);

    let rating = 0;

    if (item?.role?.value === "citizen") {
      rating = 5;
    } else if (item?.role?.value === "police") {
      rating = 7;
    } else if (item?.role?.value === "doctor") {
      rating = 7;
    } else if (item?.role?.value?.includes("mafia")) {
      rating = 10;
    }

    const response = await axios.patch(
      apiUrl + "/api/v1/rooms/" + activeRoom._id + "/serialKillerKill",
      {
        value: killBySerialKiller ? false : true,
        playerId: item?.userId,
        rating: rating,
      }
    );
    if (response.data.status !== "success") {
      setKillBySerialKiller(killBySerialKiller);
    }
  };

  /**
   * Daily votes for player
   */
  const [dailyVotes, setDailyVotes] = useState(0);
  useEffect(() => {
    const day = days?.find((day: any) => day.number === dayNumber);

    if (day) {
      const votesForPlayer =
        day?.votes?.filter((vote: any) => vote.victim === item?.userId)
          .length || 0;

      setDailyVotes(votesForPlayer);
    } else {
      setDailyVotes(0); // If the day is not found, set votes to 0
    }
  }, [days, dayNumber, item?.userId]);

  /**
   * Voice to player by any player during speech
   */
  const VoiceToLeave = () => {
    if (game.value !== "Day") {
      return;
    }

    if (game.value === "Day" && game.options.includes("No Vote")) {
      return;
    }

    if (item?.userId === currentUser?._id) {
      return;
    }

    if (activePlayerToSpeech.userId === currentUser._id) {
      if (socket) {
        socket.emit("voiceToLeave", {
          roomId: activeRoom._id,
          victimId: item?.userId,
          killerId: currentUser._id,
          dayNumber: dayNumber,
        });
      }
      /**
       * Add rating
       */
      const day = days?.find((day: any) => day.number === dayNumber);

      const vote = day?.votes?.find(
        (vote: any) => vote.killer === currentUser?._id
      );

      let requestType: any;
      if (vote?.victim === item?.userId) {
        requestType = "cancel";
      } else if (vote && vote?.victim !== item?.userId) {
        requestType = "vote to another player";
      } else {
        requestType = "vote";
      }

      if (requestType?.includes("vote")) {
        const victimRole = item?.role?.value;
        if (victimRole.includes("mafia")) {
          if (!currentUserRole?.includes("mafia")) {
            AddRating({
              points: 7,
              scenario: "Vote to Mafia",
              removeOld:
                requestType === "vote to another player" ? true : false,
            });
          } else if (requestType === "vote to another player") {
            AddRating({
              points: 0,
              scenario: "Cancel",
              removeOld: true,
            });
          }
        } else if (victimRole.includes("killer")) {
          AddRating({
            points: 5,
            scenario: "Vote to Killer",
            removeOld: requestType === "vote to another player" ? true : false,
          });
        } else if (victimRole.includes("doctor")) {
          if (currentUserRole !== "citizen" && currentUserRole !== "police") {
            AddRating({
              points: currentUserRole?.includes("mafia")
                ? 6
                : currentUserRole?.includes("killer")
                ? 3
                : 0,
              scenario: "Vote to Doctor",
              removeOld:
                requestType === "vote to another player" ? true : false,
            });
          } else {
            if (requestType === "vote to another player") {
              AddRating({
                points: 0,
                scenario: "Cancel",
                removeOld: true,
              });
            }
          }
        } else if (victimRole.includes("police")) {
          if (currentUserRole !== "citizen" && currentUserRole !== "doctor") {
            AddRating({
              points: currentUserRole?.includes("mafia")
                ? 6
                : currentUserRole?.includes("killer")
                ? 3
                : 0,
              scenario: "Vote to Police",
              removeOld:
                requestType === "vote to another player" ? true : false,
            });
          } else {
            if (requestType === "vote to another player") {
              AddRating({
                points: 0,
                scenario: "Cancel",
                removeOld: true,
              });
            }
          }
        } else if (victimRole.includes("citizen")) {
          if (currentUserRole === "serial-killer") {
            AddRating({
              points: 1,
              scenario: "Vote to Police",
              removeOld:
                requestType === "vote to another player" ? true : false,
            });
          } else {
            if (requestType === "vote to another player") {
              AddRating({
                points: 0,
                scenario: "Cancel",
                removeOld: true,
              });
            }
          }
        }
      } else {
        AddRating({
          points: 0,
          scenario: "Cancel",
          removeOld: true,
        });
      }
    }
  };

  const alreadySafedOnce =
    activeRoom?.totalGames > 0 &&
    activeRoom?.lastGame?.nights?.some(
      (night: any) =>
        night?.safePlayer?.playerId === item?.userId &&
        night?.safePlayer?.status
    );

  const VoteToSafe = async (userId: any) => {
    if (currentUserRole === "doctor" && !alreadySafedOnce) {
      setSafePlayer(userId);

      const response = await axios.patch(
        apiUrl + "/api/v1/rooms/" + activeRoom._id + "/doctorAction",
        {
          safePlayer: safePlayer ? false : true,
          playerId: userId,
        }
      );
      if (response.data.status !== "success") {
        setSafePlayer(safePlayer);
      }
    }
  };
  // clean safe state after night
  useEffect(() => {
    if (safePlayer && game.value !== "Night") {
      setSafePlayer(false);
    }
  }, [game]);

  // clean states if game end
  useEffect(() => {
    if (game.value === "Ready to start") {
      setSafePlayer(false);
      setDailyVotes(0);
      setNightVotes(0);
      setKillBySerialKiller(false);
    }
  }, [game]);

  /**
   * Find sherif by don
   */

  const FindSherif = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    if (currentUserRole === "mafia-don") {
      if (findingNight !== nightNumber) {
        alert(item.role.value === "police" ? "Sherif - Yes" : "Sherif - No");
        const SaveFinding = async () => {
          try {
            await axios.patch(
              apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/findSherif",
              {
                findUser: item?.userId,
                findResult:
                  item.role.value === "police" ? "Sherif - Yes" : "Sherif - No",
              }
            );
          } catch (error: any) {
            console.log(error.response.data.message);
          }
        };
        SaveFinding();
        if (item.role.value === "police") {
          AddRating({
            points: 15,
            scenario: "Found Police",
          });
        }
        setFindingNight(nightNumber);
      }
    }
  };
  /**
   * Find mafia by sherif
   */

  const FindMafia = () => {
    if (currentUserRole === "police") {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      if (findingNight !== nightNumber) {
        if (
          gamePlayers
            ?.filter((u: any) => !u.death)
            ?.find((user: any) => user.role.value.includes("mafia"))
        ) {
          alert(
            item.role.value.includes("mafia") ? "Yes - Mafia" : "No - Mafia"
          );
          if (item.role.value.includes("mafia")) {
            AddRating({
              points: 12,
              scenario: item.role.value.includes("don")
                ? "Found Mafia-Don"
                : "Found Mafia",
            });
          }
          const SaveFinding = async () => {
            try {
              await axios.patch(
                apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/findMafia",
                {
                  findUser: item?.userId,
                  findResult: item.role.value.includes("mafia")
                    ? "Yes - Mafia"
                    : "No - Mafia",
                }
              );
            } catch (error: any) {
              console.log(error.response.data.message);
            }
          };
          SaveFinding();
        } else {
          if (item.role.value === "serial-killer") {
            const SaveFinding = async () => {
              try {
                await axios.patch(
                  apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/findMafia",
                  {
                    findUser: item?.userId,
                    findResult: "Serial-Killer",
                  }
                );
              } catch (error: any) {
                console.log(error.response.data.message);
              }
            };
            SaveFinding();
            alert("Serial-Killer");
            AddRating({
              points: 15,
              scenario: "Found Serial-Killer",
            });
          } else {
            alert("No - Mafia");
          }
        }
        setFindingNight(nightNumber);
      }
    }
  };

  /**
   * Add rating
   */
  const AddRating = async ({ points, scenario, removeOld }: any) => {
    try {
      await axios.patch(
        apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/addRating",
        {
          userId: currentUser?._id,
          points,
          scenario,
          cretedAt: new Date(),
          removeOld,
          gameStage: game.value,
          stageNumber:
            game?.value === "Day"
              ? dayNumber
              : game?.value === "Night"
              ? nightNumber
              : undefined,
        }
      );
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  return (
    <Pressable
      onPress={() => setOpenUser(item)}
      style={[
        {
          position: "relative",
          zIndex: 50,
          alignItems: "center",
          justifyContent: "center",
          // overflow: "hidden",
          gap: 6,
          opacity:
            isMafiaRevealed && !item?.role.value.includes("mafia") ? 0.5 : 1,
        },
      ]}
    >
      {item?.userId === currentUser._id && !currentUser?.admin.active && (
        <View
          style={{
            borderRadius: 50,
            overflow: "hidden",
            position: "absolute",
            top: 4,
            right: -10,
            zIndex: 50,
          }}
        >
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              padding: 3,
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontWeight: "600",
                fontSize: 10,
                textAlign: "center",
              }}
            >
              You
            </Text>
          </BlurView>
        </View>
      )}

      {(item?.userId === activeRoom?.admin?.founder?._id ||
        item?.userId === activeRoom?.admin?.founder) && (
        <View
          style={{
            borderRadius: 50,
            overflow: "hidden",
            position: "absolute",
            top: 0,
            right: -10,
            zIndex: 50,
          }}
        >
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              padding: 3,
              paddingHorizontal: 6,
            }}
          >
            <Text
              style={{
                color: theme.active,
                fontWeight: "600",
                fontSize: 10,
                textAlign: "center",
              }}
            >
              Host{" "}
              <Text style={{ color: theme.text }}>
                {item?.userId === currentUser._id && "(You)"}
              </Text>
            </Text>
          </BlurView>
        </View>
      )}
      {item?.admin?.active && (
        <View
          style={{
            borderRadius: 50,
            overflow: "hidden",
            position: "absolute",
            top: 0,
            right: -10,
            zIndex: 50,
          }}
        >
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              padding: 3,
              paddingHorizontal: 6,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: theme.active,
                fontWeight: "600",
                fontSize: 10,
                textAlign: "center",
              }}
            >
              Admin{" "}
              <Text style={{ color: theme.text }}>
                {item?.userId === currentUser._id && "(You)"}
              </Text>
            </Text>
          </BlurView>
        </View>
      )}
      {((activePlayerToSpeech?.userId === item?.userId &&
        game.value === "Day") ||
        game.value === "Common Time") && (
        <MaterialIcons
          style={{
            position: "absolute",
            zIndex: 50,
            bottom: 20,
            left: 0,
          }}
          size={24}
          color={theme.active}
          name="keyboard-voice"
        />
      )}

      {item ? (
        <>
          <View
            style={{
              width: (SCREEN_WIDTH * 0.9 - 72) / 4,
              aspectRatio: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                zIndex: 70,
                width: 12,
                height: 12,
                borderRadius: 50,
                backgroundColor: userStatus === "online" ? "green" : "red",
                borderWidth: 1.5,
                borderColor: "#111",
              }}
            />
            {game?.value === "Night" &&
              currentUserRole?.includes("mafia") &&
              !item?.role?.value.includes("mafia") && (
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
                  {!userInPlay?.death &&
                    currentUserRole === "mafia-don" &&
                    game.value === "Night" &&
                    item.role.value !== "mafia" &&
                    currentUser?._id !== item.userId &&
                    gamePlayers?.some(
                      (user: any) => user.role.value === "police"
                    ) &&
                    findingNight !== nightNumber && (
                      <Pressable
                        onPress={(e: any) => {
                          if (!userInPlay?.death && !userSpectator) {
                            if (haptics) {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Soft
                              );
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
                      color="white"
                      size={16}
                    />

                    {nightVotes > 0 &&
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
                            {nightVotes}
                          </Text>
                        </Pressable>
                      )}
                  </Pressable>
                </BlurView>
              )}
            {game?.value === "Night" &&
              currentUserRole === "doctor" &&
              !alreadySafedOnce && (
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
            {!userInPlay?.death &&
              currentUserRole === "police" &&
              findingNight !== nightNumber &&
              game.value === "Night" &&
              currentUser?._id !== item.userId && (
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
                      Mafia?
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
            {game?.value === "Night" &&
              currentUserRole?.includes("serial") &&
              !item?.role?.value.includes("serial") && (
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
                    <MaterialCommunityIcons
                      name="skull"
                      color="red"
                      size={12}
                    />
                    <Text
                      style={{
                        color: "red",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      Kill
                    </Text>
                    {nightVotes > 0 &&
                      currentUserRole?.includes("mafia") &&
                      game.value === "Night" && (
                        <View
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
                            {nightVotes}
                          </Text>
                        </View>
                      )}
                  </Pressable>
                </BlurView>
              )}

            {game?.value === "Day" &&
              dayNumber > 1 &&
              activePlayerToSpeech?.userId !== item?.userId && (
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
                      if (activePlayerToSpeech?.userId === currentUser?._id) {
                        if (!userInPlay?.death && !userSpectator) {
                          if (haptics) {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Soft
                            );
                          }
                          if (
                            game.value === "Day" &&
                            game.options.length === 0
                          ) {
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
                      Vote
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
            {((activePlayerToSpeech?.userId === item?.userId &&
              game.value === "Day") ||
              game.value === "Common Time") && (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "blue",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  zIndex: 60,
                  borderRadius: 50,
                }}
              >
                <Text style={{ color: theme.text }}>Video</Text>
              </View>
            )}

            {killBySerialKiller &&
              currentUserRole === "serial-killer" &&
              game.value === "Night" && (
                <View
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
                </View>
              )}

            {((isMafiaRevealed && item?.role?.value?.includes("mafia")) ||
              (game.value === "Night" &&
                item?.role?.value?.includes("mafia") &&
                currentUserRole?.includes("mafia"))) && (
              <View
                style={{
                  backgroundColor: "black",
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
                    fontSize: 12,
                  }}
                >
                  {item.role.label}
                </Text>
              </View>
            )}
            <View
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 50,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: textColor,
              }}
            >
              <Img uri={item.userCover} />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            {item?.playerNumber && (
              <Text
                style={{
                  color: theme.text,
                  fontWeight: 600,
                  fontSize: 14,
                  overflow: "hidden",
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                N{item?.playerNumber}.
              </Text>
            )}
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              width: (SCREEN_WIDTH * 0.9 - 72) / 4,
              aspectRatio: 1,
              borderRadius: 50,
              overflow: "hidden",
              // borderWidth: 1.5,
              // borderColor: "#555",
              backgroundColor: "#333",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#666", fontSize: 12, fontWeight: 500 }}>
              Empty
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
};

export default Chair;

const styles = StyleSheet.create({});

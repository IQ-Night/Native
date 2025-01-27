import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Img from "../components/image";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import { roles } from "../context/rooms";
import ChairActions from "./chairActions";
import VideoComponent from "../components/videoComponent";
import { useVideoConnectionContext } from "../context/videoConnection";
import { ActivityIndicator } from "react-native-paper";

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
  setNights,
  safePlayer,
  setSafePlayer,
  setOpenUser,
  sherifPlayer,
  setSherifPlayer,
  findNight,
  setFindNight,
  foundedMafias,
  setFoundedMafias,
  killBySerialKiller,
  setKillBySerialKiller,
  timeController,
  speechTimer,
  setNightSkips,
}: any) => {
  if (item) {
    // console.log({
    //   name: item?.userName,
    //   video: item?.video,
    //   audio: item?.audio,
    // });
  }
  /**
   * App context
   */
  const { apiUrl, theme, haptics, activeLanguage, setAlert } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Game context
   */
  const {
    activeRoom,
    gamePlayers,
    socket,
    spectators,
    setGamePlayers,
    setActiveRoom,
  } = useGameContext();

  /**
   * Video context
   */
  const { setOpenVideo, loading } = useVideoConnectionContext();

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

  const [appPositionStatus, setAppPositionStatus] = useState("active");
  useEffect(() => {
    if (socket) {
      const handleUpdateStatus = (data: any) => {
        if (item?.userId === data?.user) {
          setAppPositionStatus(data?.status);
        }
      };
      socket.on("positionedApp", handleUpdateStatus);
      return () => {
        socket.off("positionedApp", handleUpdateStatus);
      };
    }
  }, [socket, item]);

  /**
   * Night votes for player by mafias
   */
  const [nightVotes, setNightVotes] = useState([]);

  useEffect(() => {
    const night = nights?.find((night: any) => night.number === nightNumber);

    if (night) {
      const votesForPlayer =
        night?.votes
          ?.filter((vote: any) => vote.killer)
          .filter((vote: any) => vote.victim === item?.userId) || [];

      setNightVotes(votesForPlayer);
    } else {
      setNightVotes([]); // If the night is not found, set votes to 0
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
      // სერვერზე ცვლილებების გაგზავნა
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

  const KillPlayerBySerialKiller = async () => {
    try {
      if (item?.userId === killBySerialKiller) {
        setKillBySerialKiller(null);

        await axios.patch(
          apiUrl + "/api/v1/rooms/" + activeRoom._id + "/serialKillerKill",
          {
            value: false,
          }
        );
      } else {
        setKillBySerialKiller(item?.userId);
        await axios.patch(
          apiUrl + "/api/v1/rooms/" + activeRoom._id + "/serialKillerKill",
          {
            value: true,
            playerId: item?.userId,
          }
        );
      }
    } catch (error: any) {
      console.log(error.response.data.message);
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
  const [voteLoading, setVoteLoading] = useState(false);
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

    setVoteLoading(true);

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
    setTimeout(() => {
      setVoteLoading(false);
    }, 200);
  };

  let alreadySafedOnce;
  if (activeRoom?.totalGames > 0) {
    alreadySafedOnce =
      activeRoom?.lastGame?.nights?.filter(
        (night: any) => night?.safePlayer?.status
      ) || [];
  }

  const VoteToSafe = async (userId: any) => {
    setSafePlayer(userId);

    const response = await axios.patch(
      apiUrl + "/api/v1/rooms/" + activeRoom._id + "/doctorAction",
      {
        safePlayer: safePlayer === userId ? false : true,
        playerId: userId,
      }
    );
    if (response.data.status !== "success") {
      setSafePlayer(safePlayer);
    }
  };
  // clean safe state after night
  useEffect(() => {
    if (safePlayer && game.value !== "Night") {
      setSafePlayer(false);
    }
    if (killBySerialKiller && game?.value !== "Night") {
      setKillBySerialKiller(null);
    }
    setFindNight(null);
  }, [game]);

  // clean states if game end
  useEffect(() => {
    if (game.value === "Ready to start") {
      setDailyVotes(0);
      setNightVotes([]);
    }
  }, [game]);

  const FindSherif = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }

    setFindNight(nightNumber);
    if (item.role.value === "police") {
      setAlert({
        active: true,
        text: activeLanguage?.yes_sheriff,
        type: "success",
      });
    } else {
      setAlert({
        active: true,
        text: activeLanguage?.no_sheriff,
        type: "error",
      });
    }
    const SaveFinding = async () => {
      try {
        const response = await axios.patch(
          apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/findSherif",
          {
            findUser: item?.userId,
            findResult:
              item.role.value === "police" ? "Sherif - Yes" : "Sherif - No",
          }
        );
        if (response.data.status === "success") {
          if (item.role.value === "police") {
            setSherifPlayer(item);
          }
        }
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
  };
  /**
   * Find mafia by sherif
   */
  const FindMafia = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    setFindNight(nightNumber);
    if (
      gamePlayers
        ?.filter((u: any) => !u.death)
        ?.find((user: any) => user.role.value.includes("mafia"))
    ) {
      if (item.role.value.includes("mafia")) {
        setAlert({
          active: true,
          text: activeLanguage?.yes_mafia,
          type: "success",
        });
      } else {
        setAlert({
          active: true,
          text: activeLanguage?.no_mafia,
          type: "error",
        });
      }
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
          const response = await axios.patch(
            apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/findMafia",
            {
              findUser: item?.userId,
              findResult: item.role.value.includes("mafia")
                ? "Yes - Mafia"
                : "No - Mafia",
            }
          );
          if (response?.data?.status === "success") {
            if (item.role.value.includes("mafia")) {
              setFoundedMafias((prev: any) => {
                const newId = item?.userId;
                if (newId && !prev.includes(newId)) {
                  return [...prev, newId];
                }
                return prev;
              });
            }
          }
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
        setAlert({
          active: true,
          text: activeLanguage?.serialKiller,
          type: "success",
        });
        AddRating({
          points: 15,
          scenario: "Found Serial-Killer",
        });
      } else {
        setAlert({
          active: true,
          text: activeLanguage?.no_mafia,
          type: "error",
        });
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
    <View
      style={[
        {
          position: "relative",
          zIndex: 50,
          alignItems: "center",
          justifyContent: "center",
          // overflow: "hidden",
          gap: 6,
          opacity:
            isMafiaRevealed && !item?.role.value.includes("mafia")
              ? 0.2
              : game.value === "Personal Time Of Death" &&
                game.options[0].userId !== item.userId
              ? 0.5
              : game?.value === "Day" &&
                activePlayerToSpeech?.userId !== item?.userId &&
                activePlayerToSpeech?.userId !== currentUser?._id
              ? 0.5
              : 1,
        },
      ]}
    >
      {item?.userId === currentUser._id &&
        activeRoom?.admin.founder.id !== currentUser?._id && (
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
                {activeLanguage?.you}
              </Text>
            </BlurView>
          </View>
        )}

      {item && item?.userId === activeRoom?.admin?.founder?.id && (
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
              {activeLanguage?.host}{" "}
              <Text style={{ color: theme.text }}>
                {item?.userId === currentUser._id && `(${activeLanguage?.you})`}
              </Text>
            </Text>
          </BlurView>
        </View>
      )}

      {item ? (
        <>
          <View
            style={{
              width: (SCREEN_WIDTH * 0.9 - 80) / 4,
              height: (SCREEN_WIDTH * 0.9 - 80) / 4,
              overflow: "hidden",
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
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
                backgroundColor:
                  userStatus === "online" && appPositionStatus === "active"
                    ? "green"
                    : userStatus === "online" &&
                      appPositionStatus === "inactive"
                    ? theme.active
                    : userStatus === "online" &&
                      appPositionStatus === "background"
                    ? theme.active
                    : "red",
                borderWidth: 1.5,
                borderColor: "#111",
              }}
            />
            <ChairActions
              game={game}
              currentUserRole={currentUserRole}
              timeController={timeController}
              item={item}
              userInPlay={userInPlay}
              userSpectator={userSpectator}
              sherifPlayer={sherifPlayer}
              findNight={findNight}
              nightNumber={nightNumber}
              dayNumber={dayNumber}
              FindSherif={FindSherif}
              FindMafia={FindMafia}
              KillPlayer={KillPlayer}
              nightVotes={nightVotes}
              alreadySafedOnce={alreadySafedOnce}
              VoteToSafe={VoteToSafe}
              safePlayer={safePlayer}
              foundedMafias={foundedMafias}
              KillPlayerBySerialKiller={KillPlayerBySerialKiller}
              activePlayerToSpeech={activePlayerToSpeech}
              VoiceToLeave={VoiceToLeave}
              dailyVotes={dailyVotes}
              voteLoading={voteLoading}
              killBySerialKiller={killBySerialKiller}
              isMafiaRevealed={isMafiaRevealed}
              roles={roles}
              speechTimer={speechTimer}
              textColor={textColor}
              setOpenVideo={setOpenVideo}
              setOpenUser={setOpenUser}
              appPositionStatus={appPositionStatus}
              userStatus={userStatus}
            />
            <View
              style={{
                width: (SCREEN_WIDTH * 0.9 - 80) / 4,
                height: (SCREEN_WIDTH * 0.9 - 80) / 4,
                borderRadius: 50,
                overflow: "hidden",
                borderWidth: 2,
                borderColor:
                  activePlayerToSpeech?.userId === item?.userId
                    ? theme.active
                    : textColor,
              }}
            >
              <Img uri={item.userCover} />
            </View>
          </View>
          {item?.playerNumber ? (
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setOpenUser(item);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                maxWidth: "90%",
                height: 14,
              }}
            >
              <Text
                style={{
                  color:
                    (isMafiaRevealed && item?.role?.value?.includes("mafia")) ||
                    (game.value === "Night" &&
                      item?.role?.value?.includes("mafia") &&
                      currentUserRole?.includes("mafia")) ||
                    (game?.value === "Day" &&
                      activePlayerToSpeech?.userId === item?.userId)
                      ? theme.active
                      : game.value === "Personal Time Of Death" &&
                        game.options[0].userId === item.userId
                      ? "red"
                      : theme.text,
                  fontWeight: 600,
                  fontSize: 12,
                  overflow: "hidden",
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.playerNumber}. {item?.userName}
              </Text>
              {/* {sherifPlayer &&
                currentUserRole === "mafia-don" &&
                item?.role?.value === sherifPlayer?.role?.value && (
                  <MaterialIcons
                    name="local-police"
                    size={14}
                    color={theme.active}
                  />
                )} */}
              {/* {alreadySafedOnce?.find(
                (sf: any) => sf.safePlayer?.playerId === item?.userId
              ) &&
                currentUserRole === "doctor" && (
                  <MaterialIcons
                    name="health-and-safety"
                    size={14}
                    color="red"
                  />
                )} */}
              {/* {currentUserRole === "police" &&
                foundedMafias?.find((m: any) => m === item?.userId) && (
                  <MaterialCommunityIcons
                    name="redhat"
                    size={16}
                    color={theme.active}
                  />
                )} */}
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setOpenUser(item);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                maxWidth: "90%",
                maxHeight: 14,
              }}
            >
              <Text
                style={{
                  color:
                    (isMafiaRevealed && item?.role?.value?.includes("mafia")) ||
                    (game.value === "Night" &&
                      item?.role?.value?.includes("mafia") &&
                      currentUserRole?.includes("mafia")) ||
                    (game?.value === "Day" &&
                      activePlayerToSpeech?.userId === item?.userId)
                      ? theme.active
                      : game.value === "Personal Time Of Death" &&
                        game.options[0].userId === item.userId
                      ? "red"
                      : theme.text,
                  fontWeight: 600,
                  fontSize: 12,
                  overflow: "hidden",
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {index + 1}. {item?.userName}
              </Text>
            </Pressable>
          )}
        </>
      ) : (
        <>
          <View
            style={{
              width: (SCREEN_WIDTH * 0.9 - 80) / 4,
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
              {activeLanguage?.empty}
            </Text>
          </View>
          <View style={{ height: 10 }}></View>
        </>
      )}
    </View>
  );
};

export default Chair;

const styles = StyleSheet.create({});

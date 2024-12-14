import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import Block from "../admin/users/block-user";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import { roles } from "../context/rooms";
import LogsModal from "../screens/screen-logs/logs-modal";
import AttentionWindow from "./attentionWindow";
import Chat from "./chat/main";
import ConfirmRoles from "./confirmRoles";
import DealingCards from "./dealingCards";
import GameProcess from "./gameProcess";
import Header from "./header";
import { findMostFrequentVictim } from "./mostVictims";
import NominationWindow from "./nominationWindow";
import PersonalTimeOfDead from "./personalTimeOfDead";
import Ban from "./room-ban";
import Spectators from "./spectators";
import Table from "./table";
import CommonTimer from "./timers/commonTimer";
import useDealingCardsTimer from "./timers/dealingCardsTimer";
import useGettingKnowsMafias from "./timers/gettingKnowsMafiasTimer";
import LastWordTimer from "./timers/lastWordTimer";
import NightTimer from "./timers/nightTimer";
import SpeechTimer from "./timers/speechTimer";
import UserPopup from "./userPopup";
import VideoComponent from "./videoComponent";
import OpenVideo from "./openedVideo";
import { useVideoConnectionContext } from "../context/videoConnection";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Game = () => {
  /**
   * App context
   */
  const { theme, haptics, apiUrl } = useAppContext();

  /**
   * Game context
   */
  const {
    activeRoom,
    setActiveRoom,
    socket,
    setSpectators,
    gamePlayers,
    setGamePlayers,
    message,
    setMessage,
    setLoadingSpectate,
    currentUserRadio,
  } = useGameContext();
  /**
   * Video context
   */
  const { setVideo, startCall, setMicrophone } = useVideoConnectionContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   *
   * თამაშის სივრცე
   *
   */
  const [game, setGame] = useState<any>({
    value: "Ready to start",
    options: [],
  });

  /**
   * loading
   */
  const [loading, setLoading] = useState(false);

  // update room users, iclude spectators
  useEffect(() => {
    if (socket) {
      const handleAllUsers = (data: any) => {
        if (data?.usersInRoom) {
          setSpectators(
            data?.usersInRoom?.filter((u: any) => u.type === "spectator")
          );
          setGamePlayers(
            data?.usersInRoom?.filter((u: any) => u.type === "player")
          );
          if (data?.message) {
            setMessage({
              type: data.message.type,
              active: true,
              data: [data.message.user],
            });
          }
        } else if (data?.message !== null) {
          if (message?.data?.length > 0) {
            setMessage({
              type: data.message.type,
              active: true,
              data: [data.message.user, , ...message.data],
            });
          } else {
            setMessage({
              type: data.message.type,
              active: true,
              data: [data.message.user],
            });
          }
        }
      };

      // Handle receiving all users when joining the room
      socket.on("allUsers", handleAllUsers);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("allUsers", handleAllUsers);
      };
    }
  }, [socket]);

  // update players
  // loading role confirm button
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  useEffect(() => {
    if (socket) {
      const updateGamePlayers = (players: any[]) => {
        setGamePlayers(players);
        setLoading(false);
        setLoadingConfirm(false);
      };

      // Handle receiving all users when joining the room
      socket.on("updatePlayers", updateGamePlayers);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("updatePlayers", updateGamePlayers);
      };
    }
  }, [socket]);

  /**
   * თამაში
   */

  /**
   * Start play with less users than provided in room mac players
   */
  // confirm roles by host before starting playing if less players in room than maximum
  const [openConfirmRoles, setOpenConfirmRoles] = useState<any>(false);
  const [confirmedRoles, setConfirmedRoles] = useState<any>([]);
  const [loadingStarting, setLoadingStarting] = useState(false);

  const StartPlay = () => {
    setLoadingStarting(true);
    if (socket) {
      let roles = [];
      const maxPlayers = activeRoom?.options.maxPlayers;
      const maxMafias = activeRoom?.options.maxMafias;

      // Step 1: Add unique roles (like doctor, police, etc.) if specified
      const specialRoles =
        activeRoom?.roles?.filter(
          (role: any) =>
            role.value !== "mafia" &&
            role.value !== "mafia-don" &&
            role.value !== "citizen"
        ) || [];
      roles.push(...specialRoles);

      // Step 2: Add the specified number of "mafia" roles
      const mafiaRoles = Array.from({ length: maxMafias }, () => ({
        value: "mafia",
      }));

      // Step 3: If "mafia-don" is specified, replace one "mafia" with "mafia-don"
      if (activeRoom.roles?.some((role: any) => role.value === "mafia-don")) {
        mafiaRoles[0] = { value: "mafia-don" };
      }
      roles.push(...mafiaRoles);

      // Step 4: Fill remaining slots with "citizen" until roles reach maxPlayers
      const remainingSlots = maxPlayers - roles.length;
      const citizenRoles = Array.from({ length: remainingSlots }, () => ({
        value: "citizen",
      }));
      roles.push(...citizenRoles);

      // Emit the startPlay event with the fully constructed roles array
      socket.emit("startPlay", {
        roomId: activeRoom?._id,
        confirmedRoles: confirmedRoles?.length > 0 ? confirmedRoles : roles,
      });

      // Resetting states
      setTimeout(() => {
        setConfirmedRoles([]);
        setOpenConfirmRoles(false);
        setLoadingStarting(false);
      }, 1000);
    }
  };

  // თამაშის დაწყება
  const { dealingCardsTimer } = useDealingCardsTimer({ socket });
  const { gettingKnowsMafiasTimer } = useGettingKnowsMafias({ socket });
  useEffect(() => {
    if (socket) {
      const handleGameStarted = (data: any) => {
        // Determine the virtual host of the game
        const host = data?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];
        // Update the list of players
        setGamePlayers(data?.players);

        // Set game state to "Dealing Cards"
        setGame({ value: "Dealing Cards", options: [] });
        // Start the role selection process - initiate timer if current user is the host
        if (currentUser?._id === host?.userId) {
          socket?.emit("DealingCardsTimerStart", {
            roomId: host?.roomId,
          });
        }
      };

      // Attach the event listener
      socket.on("gameStarted", handleGameStarted);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("gameStarted", handleGameStarted);
      };
    }
  }, [socket]);

  // End of role distribution
  useEffect(() => {
    if (socket) {
      const handleDealingCardsTimerEnd = async (data: any) => {
        // Determine the host (first alive player)

        // Update the list of players
        setGamePlayers(data?.players);
        const host = data?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];
        // Start the mafia introduction phase
        setGame({ value: "Getting to know mafias", options: [] });
        // Initiate the mafia introduction timer if the current user is the host
        if (currentUser?._id === host?.userId) {
          socket?.emit("GettingKnowMafiasTimerStart", {
            roomId: host?.roomId,
          });
        }
      };

      // Attach the event listener
      socket.on("DealingCardsTimerEnd", handleDealingCardsTimerEnd);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("DealingCardsTimerEnd", handleDealingCardsTimerEnd);
      };
    }
  }, [socket, currentUser?._id]);

  // როლის მიღება მექანიკურად, მაშინ როდესაც ღილაკით ვადასტურებთ და არ ველოდებით წამოზომის ამოწურვას
  useEffect(() => {
    if (socket) {
      const handleRoleConfirmed = (data: any) => {
        const host = data?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];
        // Start the mafia introduction phase
        if (data.value === "Getting to know mafias") {
          setGame(data);

          if (currentUser?._id === host?.userId) {
            socket?.emit("GettingKnowMafiasTimerStart", {
              roomId: host?.roomId,
            });
          }
        } else {
          setGame(data);
        }
      };

      // Attach the event listener
      socket.on("roleConfirmed", handleRoleConfirmed);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("roleConfirmed", handleRoleConfirmed);
      };
    }
  }, [socket]);

  /**
   * Attention
   */
  const [attention, setAttention] = useState({ active: false, value: "" });

  // End of mafia introduction
  useEffect(() => {
    if (socket) {
      const handleGettingKnowMafiasTimerEnd = (data: any) => {
        // When mafias get to know each other, it becomes day.
        setGame({
          value: "Day",
          options: ["No Vote"],
          players: data?.players,
        });
        setLoadingConfirm(false);
      };

      // Attach the event listener
      socket.on("GettingKnowMafiasTimerEnd", handleGettingKnowMafiasTimerEnd);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off(
          "GettingKnowMafiasTimerEnd",
          handleGettingKnowMafiasTimerEnd
        );
      };
    }
  }, [socket]);

  /**
   * დღე
   */
  const [dayNumber, setDayNumber] = useState(1);

  // მოთამაშის სივრცე რომელიც გამოდის სიტყვით
  const [activePlayerToSpeech, setActivePlayerToSpeech] = useState<any>(null);
  // End of the day
  const [currentSpeechData, setCurrentSpeechData] = useState<any>(null);
  const [changeSpeakerLoading, setChangeSpeakerLoading] = useState(false);

  // სიტყვის გამოსვლის თაიმერი
  const { speechTimer } = SpeechTimer({ socket });

  // Start of the day
  useEffect(() => {
    if (game.value === "Day") {
      const host = game?.players.filter((u: any) => u.status !== "offline")[0];
      setLoadingSpectate(false);
      // Determine virtual host for the single request
      if (!game?.reJoin) {
        setAttention({ active: true, value: "Start of the day" });

        // List of active alive players

        setTimeout(() => {
          setAttention({ active: false, value: "" });

          const createNewDay = async () => {
            try {
              await axios.patch(
                `${apiUrl}/api/v1/rooms/${host?.roomId}/createDay`,
                {
                  number: dayNumber,
                  votes: [],
                }
              );
            } catch (error: any) {
              console.log(error.response?.data?.message);
            }
          };

          const handleFirstPlayerToSpeech = async () => {
            // Only the host creates the new day
            if (currentUser?._id === host?.userId) {
              await createNewDay();
            }
          };

          // Initiating first player selection
          handleFirstPlayerToSpeech();
        }, 2500);
      }
    }
  }, [game, socket]);

  // ეს ფუნქცია რთავს თაიმერს და მოთამაშეს აძლევს სიტყვით გამოსვლის უფლებას
  const handleSpeech = ({
    gameStage,
    currentPlayerToSpeech,
    firstSpeecher,
    host,
  }: any) => {
    socket.emit("SpeechTimerStart", {
      roomId: host?.roomId,
      gameStage: gameStage,
      currentPlayerToSpeech: currentPlayerToSpeech,
      firstSpeecher: firstSpeecher,
    });
  };

  // Handle speech player for all players
  useEffect(() => {
    if (socket) {
      const handleFirstPlayerToSpeech = (data: any) => {
        // Determine virtual host for the single request
        const host = data?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];

        // If host has determined the first player to speak
        if (data) {
          setCurrentSpeechData({
            roomId: host?.roomId,
            gameStage: {
              value: "Player Speech",
              options: dayNumber === 1 ? ["No Vote"] : [],
            },
            currentPlayerToSpeech: data.player,
            firstSpeecher: data.player,
          });
          // Set up speech for the current stage
          if (currentUser?._id === host?.userId) {
            handleSpeech({
              gameStage: {
                value: "Player Speech",
                options: dayNumber === 1 ? ["No Vote"] : [],
              },
              currentPlayerToSpeech: data.player,
              firstSpeecher: data.player,
              host: host,
            });
          }
          setActivePlayerToSpeech(data.player);
        }
      };

      // Attach the event listener
      socket.on("getFirstPlayerToSpeech", handleFirstPlayerToSpeech);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("getFirstPlayerToSpeech", handleFirstPlayerToSpeech);
      };
    }
  }, [socket, currentUser?._id, dayNumber]);

  /**
   * ნომინაციიის შედეგები და ხმის მიცემა
   */
  const [openNominationsWindow, setOpenNominationsWindow] = useState<any>(null);

  // save data in db for app close scenarions
  const SaveAfterLeaveDataInDB = async (passData: any, roomId: any) => {
    if (roomId) {
      try {
        await axios.patch(
          apiUrl + "/api/v1/rooms/" + roomId + "/afterLeaveData",
          passData
        );
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    }
  };

  /**
   * Add rating
   */
  const AddRating = async ({ points, scenario, removeOld, userId }: any) => {
    try {
      await axios.patch(
        apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/addRating",
        {
          userId,
          points,
          scenario,
          cretedAt: new Date(),
          removeOld,
        }
      );
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    const handleSpeechTimerEnd = (data: any) => {
      const host = data?.players.filter((u: any) => u.status !== "offline")[0];
      setChangeSpeakerLoading(false);
      // List of active alive players
      const totalAlivePlayers = data.players.filter(
        (player: any) => !player.death
      );

      // Determine the next player's index
      const nextPlayer = data.nextPlayerToSpeech;
      setCurrentSpeechData({
        roomId: host?.roomId,
        gameStage: data.gameStage,
        currentPlayerToSpeech: nextPlayer,
        firstSpeecher: data.firstSpeecher,
      });

      if (data.speechEnd) {
        setActivePlayerToSpeech(null);

        // Count occurrences of each victim
        const victimCounts = data.votes.reduce((acc: any, vote: any) => {
          acc[vote.victim] = (acc[vote.victim] || 0) + 1;
          return acc;
        }, {});

        // Extract unique victims and their counts into an array of objects
        const justifyUsers = Object.entries(victimCounts).map(
          ([victim, count]) => ({ victim, count })
        );

        if (justifyUsers.length > 1) {
          setAttention({ active: true, value: "Candidates to vote" });
          setOpenNominationsWindow({
            active: false,
            nominantes: justifyUsers,
            nominationsNumber: 1,
            players: data?.players,
          });
          if (host?.userId === currentUser?._id) {
            const saveData = { value: "Nomination Speech", data: {} };
            SaveAfterLeaveDataInDB(saveData, host?.roomId);
          }

          setTimeout(() => {
            setOpenNominationsWindow((prev: any) => ({
              ...prev,
              active: true,
            }));
            setAttention({ active: false, value: "" });
          }, 3000);
        } else {
          let result = findMostFrequentVictim(data.votes || []);
          const mostFrequentVictimId = result.mostFrequentVictims;

          result = {
            ...result,
            mostFrequentVictims: mostFrequentVictimId
              ? totalAlivePlayers.find(
                  (player: any) => player.userId === mostFrequentVictimId
                ) || null
              : null,
          };

          if (result.allEqual) {
            // If all votes are equal, switch to the Night phase
            setGame({
              value: "Night",
              options: [],
              players: data.players,
            });
            setDayNumber(data?.nextDayNumber);
          } else {
            // If there's a player with the most votes, they are targeted
            if (data.gameStage.options[0] === "No Vote") {
              setGame({
                value: "Night",
                options: [],
                players: data.players,
              });
              setDayNumber(data?.nextDayNumber);
            } else {
              if (currentUser._id === host?.userId) {
                socket.emit("exitPlayer", {
                  roomId: data.players[0].roomId,
                  exitPlayers: [result.mostFrequentVictims],
                  result: result,
                  nextDayNumber: data.nextDayNumber,
                  after: "Night",
                });
              }
            }
          }
        }
      } else {
        // Move to the next player's speech
        if (currentUser._id === host?.userId) {
          handleSpeech({
            gameStage: data.gameStage,
            currentPlayerToSpeech: nextPlayer,
            firstSpeecher: data.firstSpeecher,
            host: host,
          });
        }
        setActivePlayerToSpeech(nextPlayer);
      }
    };
    if (socket) {
      // Attach the event listener
      socket.on("SpeechTimerEnd", handleSpeechTimerEnd);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("SpeechTimerEnd", handleSpeechTimerEnd);
      };
    }
  }, [socket]);

  /**
   * ღამე
   */
  const [nightNumber, setNightNumber] = useState(1);

  // ღამის თაიმერი
  const { nightTimer } = NightTimer({ socket });

  // Start of the night
  useEffect(() => {
    if (game.value === "Night") {
      setMicrophone(currentUserRadio);
    }
    if (game.value === "Night" && !game?.reJoin) {
      const host = game?.players.filter((u: any) => u.status !== "offline")[0];

      setLoadingSpectate(false);

      setAttention({ active: true, value: "Start of the night" });

      setTimeout(() => {
        setAttention({ active: false, value: "" });
      }, 2500);

      // Create a new night
      const createNewNight = async () => {
        socket.emit("NightTimerStart", {
          roomId: activeRoom?._id,
        });
        try {
          const response = await axios.patch(
            `${apiUrl}/api/v1/rooms/${activeRoom?._id}/createNight`,
            {
              number: nightNumber,
            }
          );
          if (response.data.data.room) {
            // Update the active room
            setActiveRoom(response.data.data.room);
          }
        } catch (error: any) {
          console.log(error.response?.data?.message);
        }
      };

      if (currentUser._id === host?.userId) {
        createNewNight();
      }
    }
  }, [game, socket, activeRoom?._id]);

  // End of the night
  useEffect(() => {
    if (socket) {
      const handleTimerEnd = (data: any) => {
        setGamePlayers(data?.players);
        // List of active alive players
        const totalAlivePlayers = data.players.filter(
          (player: any) => !player.death
        );

        setActiveRoom((prev: any) => ({
          ...prev,
          lastGame: data?.room?.lastGame,
          reJoin: false,
        }));

        // Determine the most frequent victim
        let result = findMostFrequentVictim(data.votes || []);
        const mostFrequentVictimId = result.mostFrequentVictims;

        result = {
          ...result,
          mostFrequentVictims: mostFrequentVictimId
            ? totalAlivePlayers.find(
                (player: any) => player.userId === mostFrequentVictimId
              ) || null
            : null,
        };

        // Get the current game and night
        const currentGame = data.room?.lastGame;
        const currentNightBase =
          currentGame?.nights[currentGame?.nights.length - 1];

        // Check if serial killer killed during the night
        let deathPlayer = data.players.find(
          (user: any) =>
            user.userId === currentNightBase?.killedBySerialKiller?.playerId
        );

        // Define the list of deaths
        let deaths: any;

        if (
          (deathPlayer?.userId &&
            result?.mostFrequentVictims?.userId &&
            deathPlayer?.userId === result?.mostFrequentVictims?.userId) ||
          (deathPlayer?.userId && !result?.mostFrequentVictims?.userId)
        ) {
          deaths = [deathPlayer];
        } else if (
          deathPlayer?.userId &&
          result?.mostFrequentVictims?.userId &&
          deathPlayer?.userId !== result?.mostFrequentVictims?.userId
        ) {
          deaths = [deathPlayer, result?.mostFrequentVictims];
        } else if (
          !deathPlayer?.userId &&
          result?.mostFrequentVictims?.userId
        ) {
          deaths = [result?.mostFrequentVictims];
        }

        // Shuffle deaths if there is more than one
        if (deaths?.length > 1) {
          deaths = deaths.sort(() => Math.random() - 0.5);
        }

        // Check if any player was saved by the doctor

        let playerSaved: any;
        if (deaths?.length > 0) {
          playerSaved = deaths.find(
            (death: any) =>
              death?.userId === currentNightBase?.safePlayer?.playerId
          );
        }

        // if player saved by doctor add rating to doctor
        if (playerSaved) {
          deaths = deaths.filter(
            (death: any) => death?.userId !== playerSaved.userId
          );

          let doctor = data?.players.find(
            (p: any) => p.role.value === "doctor"
          );
          const host = data?.players.filter(
            (u: any) => u.status !== "offline"
          )[0];
          if (host?.userId === currentUser?._id) {
            if (playerSaved?.role?.value === "doctor") {
              AddRating({
                points: 12,
                scenario: "Doctor saved by Doctor",
                userId: doctor?.userId,
              });
            } else if (playerSaved?.role?.value === "police") {
              AddRating({
                points: 12,
                scenario: "Police saved by Doctor",
                userId: doctor?.userId,
              });
            } else if (playerSaved?.role?.value === "citizen") {
              AddRating({
                points: 7,
                scenario: "Citizen saved by Doctor",
                userId: doctor?.userId,
              });
            } else if (playerSaved?.role?.value === "serial-killer") {
              AddRating({
                points: 2,
                scenario: "Serial-Killer saved by Doctor",
                userId: doctor?.userId,
              });
            }
          }
        }

        // if player killed by mafia add rating to mafias
        if (deaths) {
          let victim = deaths?.find(
            (p: any) => p.userId === mostFrequentVictimId
          );

          let mafias = data?.players?.filter(
            (p: any) => !p.death && p.role.value?.includes("mafia")
          );

          const host = data?.players.filter(
            (u: any) => u.status !== "offline"
          )[0];
          if (host?.userId === currentUser?._id) {
            if (victim?.role?.value === "police") {
              mafias?.map((m: any) =>
                AddRating({
                  points: 10,
                  scenario: "Police Killed by Mafia",
                  userId: m?.userId,
                })
              );
            } else if (victim?.role?.value === "doctor") {
              mafias?.map((m: any) =>
                AddRating({
                  points: 10,
                  scenario: "Doctor Killed by Mafia",
                  userId: m?.userId,
                })
              );
            } else if (victim?.role?.value === "serial-killer") {
              mafias?.map((m: any) =>
                AddRating({
                  points: 8,
                  scenario: "Serial-Killer Killed by Mafia",
                  userId: m?.userId,
                })
              );
            }
          }
        }

        // if player killed by serial killer add rating to killer
        const host = data?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];
        if (host?.userId === currentUser?._id) {
          if (deaths) {
            let killer = data?.players.find(
              (p: any) => p.role.value === "serial-killer"
            );
            let serialKillerKilled = deaths?.find(
              (d: any) => d?.userId === deathPlayer?.userId
            );

            if (serialKillerKilled?.role?.value === "citizen") {
              AddRating({
                points: 5,
                scenario: "Citizen killed by Serial-Killer",
                userId: killer?.userId,
              });
            } else if (serialKillerKilled?.role?.value === "police") {
              AddRating({
                points: 7,
                scenario: "Police killed by Serial-Killer",
                userId: killer?.userId,
              });
            } else if (serialKillerKilled?.role?.value === "doctor") {
              AddRating({
                points: 7,
                scenario: "Doctor killed by Serial-Killer",
                userId: killer?.userId,
              });
            } else if (serialKillerKilled?.role?.value?.includes("mafia")) {
              AddRating({
                points: 10,
                scenario: "Mafia killed by Serial-Killer",
                userId: killer?.userId,
              });
            }
          }
        }

        if (deaths?.length > 0) {
          if (currentUser._id === host?.userId) {
            socket.emit("exitPlayer", {
              roomId: data.players[0].roomId,
              exitPlayers: deaths,
              nextNightNumber: data.nextNightNumber,
              after: "Day",
            });
          }
        } else {
          if (currentUser._id === host?.userId) {
            socket.emit("CommonTimerStart", {
              roomId: data.players[0]?.roomId,
            });
          }
          setGame({
            value: "Common Time",
            options: [],
            players: data.players,
          });
          setLoadingSpectate(false);
          setNightNumber(data?.nextNightNumber);
        }
      };

      if (socket) {
        socket.on("NightTimerEnd", handleTimerEnd);

        // Clean up the socket listener on component unmount or when `socket` changes
        return () => {
          socket.off("NightTimerEnd", handleTimerEnd);
        };
      }
    }
  }, [socket]);

  /**
   * Night Votes
   */
  const [nights, setNights] = useState([]);
  /**
   * Day Votes
   */
  const [days, setDays] = useState([]);

  // last word data
  const [lastWordData, setLastWordData] = useState<any>(null);

  // Update room and votes
  useEffect(() => {
    if (socket) {
      const handleUpdateRoom = (data: any) => {
        console.log("update");
        setActiveRoom(data?.room);
        setDays(data?.room?.lastGame?.days || []);
        setNights(data?.room?.lastGame?.nights || []);
      };

      // Handle room updates
      socket.on("updateRoom", handleUpdateRoom);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("updateRoom", handleUpdateRoom);
      };
    }
  }, [socket]);

  // საერთო დროის დასასრული
  const { commonTimer } = CommonTimer({ socket });

  useEffect(() => {
    if (socket) {
      const handleCommonTimerEnd = (data: any) => {
        setGame({
          value: "Day",
          options: [],
          players: data?.players,
        });
      };

      // Attach the event listener
      socket.on("CommonTimerEnd", handleCommonTimerEnd);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("CommonTimerEnd", handleCommonTimerEnd);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      const handleExitPlayers = (exitData: any) => {
        setGamePlayers(exitData?.players);

        const host = exitData?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];

        setOpenNominationsWindow(null);

        if (exitData?.gameOver) {
          setAttention({
            active: true,
            value: "Game over - Winners -" + `${exitData.gameOver.winners}`,
          });

          const UpdateRating = async () => {
            try {
              await axios.patch(apiUrl + "/api/v1/ratings/" + host?.roomId);
            } catch (error: any) {
              console.log(error.response.data.message);
            }
          };
          if (currentUser?._id === host?.userId) {
            UpdateRating();
          }
          setTimeout(() => {
            // End the game and return to the initial stage
            setGame({ value: "Ready to start", options: [] });
            setDayNumber(1);
            setNightNumber(1);
            setAttention({ active: false, value: "" });
          }, 7000);
        } else {
          if (exitData?.playerOff) {
            setAttention({
              active: true,
              value: `Player ${exitData?.exitPlayers[0]?.playerNumber} has left the game by itself. Starting Night...`,
            });
          } else {
            setAttention({
              active: true,
              value: `Player ${exitData?.exitPlayers[0]?.playerNumber} has left the game. Starting Last speech...`,
            });
          }

          setTimeout(() => {
            setAttention({ active: false, value: "" });
            if (exitData?.playerOff) {
              if (exitData?.nextDayNumber) {
                setDayNumber(exitData?.nextDayNumber);
              } else if (exitData?.nextNightNumber) {
                setNightNumber(exitData?.nextNightNumber);
              }
              return setGame({
                value: "Night",
                options: [],
                players: exitData.players,
              });
            }
            setGame({
              value: "Personal Time Of Death",
              options: exitData?.nextDayNumber
                ? [exitData?.exitPlayers[0], "After Day"]
                : [exitData?.exitPlayers[0], "After Night"], // Target the player
            });

            setLastWordData({
              roomId: host?.roomId,
              gameStage: {
                value: "Personal Time Of Death",
                options: [exitData?.exitPlayers[0], exitData?.after],
              },
              nextDeath: exitData?.exitPlayers[1]
                ? [exitData?.exitPlayers[1], exitData?.after]
                : null,
              deaths: exitData.exitPlayers,
            });

            if (currentUser?._id === host?.userId) {
              socket.emit("LastWordTimerStart", {
                roomId: host?.roomId,
                gameStage: {
                  value: "Personal Time Of Death",
                  options: [exitData?.exitPlayers[0], exitData?.after],
                },
                nextDeath: exitData?.exitPlayers[1]
                  ? [exitData?.exitPlayers[1], exitData?.after]
                  : null,
                deaths: exitData.exitPlayers,
                nextDayNumber: exitData?.nextDayNumber,
                nextNightNumber: exitData?.nextNightNumber,
              });
            }

            if (exitData?.nextDayNumber) {
              setDayNumber(exitData?.nextDayNumber);
            } else if (exitData?.nextNightNumber) {
              setNightNumber(exitData?.nextNightNumber);
            }
          }, 3000);
        }
      };

      // Attach the event listener
      socket.on("exitPlayers", handleExitPlayers);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("exitPlayers", handleExitPlayers);
      };
    }
  }, [socket, currentUser?._id]);

  /**
   * ბოლო სიტყვა გავარდნის შემდგომ
   */
  // ბოლო სიტყვის თაიმერი
  const { lastWordTimer } = LastWordTimer({ socket });
  const [skipLastTimerLoading, setSkipLastTimerLoading] = useState(false);

  const handleLastWordTimerEnd = (data: any) => {
    if (!data?.nextDeath) {
      if (data?.gameStage?.options[1] === "After Night") {
        setGame({
          value: "Night",
          options: [],
          players: data.players,
        });
      } else if (data?.gameStage?.options[1] === "After Day") {
        setGame({
          value: "Day",
          options: [],
          players: data.players,
        });
      }
    } else {
      setGame((prev: any) => ({
        ...prev,
        value: "Personal Time Of Death",
        options: data?.nextDeath,
      }));

      const currentDeath = data.nextDeath;
      const nextDeathPlayerIndex = data.deaths.findIndex(
        (player: any) => player.index === currentDeath + 1
      );
      const nextDeathPlayer =
        nextDeathPlayerIndex !== -1 ? data.deaths[nextDeathPlayerIndex] : null;

      const host = data?.players.filter((u: any) => u.status !== "offline")[0];
      if (currentUser?._id === host?.userId) {
        socket?.emit("LastWordTimerStart", {
          roomId: host?.roomId,
          gameStage: {
            value: "Personal Time Of Death",
            options: data?.nextDeath,
          },
          nextDeath: nextDeathPlayer,
        });
      }
      setLastWordData({
        roomId: host?.roomId,
        gameStage: {
          value: "Personal Time Of Death",
          options: data?.nextDeath,
        },
        nextDeath: nextDeathPlayer,
      });
    }
  };

  useEffect(() => {
    if (socket) {
      // Attach the event listener
      socket.on("LastWordTimerEnd", handleLastWordTimerEnd);

      // Clean up the socket listener on component unmount or changes to `socket`
      return () => {
        socket.off("LastWordTimerEnd", handleLastWordTimerEnd);
      };
    }
  }, [socket, currentUser?._id]);

  /**
   * ოთახის ფონის დაბნელება და გაღიავება შესაბამის ეტაპზე
   */

  // animation background to darker in some game stage
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Determine the end value based on the game state
    let toValue;
    if (
      game.value === "Getting to know mafias" &&
      gamePlayers
        .find((player: any) => player.userId === currentUser._id)
        ?.role?.value?.includes("mafia")
    ) {
      toValue = 1;
    } else if (game.value === "Night") {
      toValue = 1;
    } else {
      toValue = 0;
    }

    // Animate the background color
    Animated.timing(backgroundColorAnim, {
      toValue,
      duration: 1000, // Adjust the duration to your preference
      useNativeDriver: false, // `backgroundColor` doesn't support native driver
    }).start();
  }, [game, gamePlayers]);

  // Interpolate the animated value to transition between transparent and black
  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "black"],
  });

  useEffect(() => {
    let data: any;
    const host = gamePlayers.filter((u: any) => u.status !== "offline")[0];
    if (
      game.value === "Day" &&
      activePlayerToSpeech?.userId === currentUser?._id
    ) {
      data = {
        value: "speechToNextPlayer",
        data: currentSpeechData,
      };
      SaveAfterLeaveDataInDB(data, host?.roomId);
    } else if (game.value !== "Day") {
      if (host === currentUser?._id) {
        data = { value: "", data: {} };
        SaveAfterLeaveDataInDB(data, host?.roomId);
      }
    }
  }, [game.value, activePlayerToSpeech, gamePlayers, currentUser]);

  /**
   * Rejoin in game
   */
  const [loadingReJoin, setLoadingReJoin] = useState(false);
  useEffect(() => {
    const GetGamePosition = async () => {
      console.log("game position....");
      setVideo(false);
      startCall(false);
      try {
        setLoadingReJoin(true);
        const response = await axios.get(
          apiUrl + "/api/v1/rooms/" + activeRoom?._id
        );
        if (response.data.status === "success") {
          const lastGame = response.data.data.room?.lastGame;
          const gameLevel = response.data.data.room?.lastGame?.gameLevel;
          if (gameLevel?.level === "Day") {
            setGame({
              value: "Day",
              options: lastGame?.number === 1 ? ["No Vote"] : [],
              players: lastGame?.players,
              reJoin: true,
            });
            setDayNumber(lastGame?.days[lastGame?.days?.length - 1].number);
            if (!gameLevel?.subLevel) {
              setActivePlayerToSpeech(gameLevel?.data?.currentPlayerToSpeech);
              setCurrentSpeechData({
                roomId: activeRoom?._id,
                gameStage: {
                  value: "Player Speech",
                  options: lastGame?.number === 1 ? ["No Vote"] : [],
                },
                currentPlayerToSpeech: gameLevel?.data?.currentPlayerToSpeech,
                firstSpeecher: gameLevel?.data?.firstSpeecher,
              });
            } else {
              setOpenNominationsWindow({
                active: true,
                nominantes: gameLevel?.data?.list,
                nominationsNumber: gameLevel?.data?.nominationNumber,
                players: gameLevel?.data?.players,
                reJoin: true,
                activePlayer: gameLevel?.data?.player,
                voting: gameLevel?.voting
                  ? "voting1"
                  : gameLevel?.voting2
                  ? "voting2"
                  : "",
                votes: gameLevel?.voting
                  ? lastGame?.days[lastGame?.days?.length - 1]?.lastVotes
                  : gameLevel?.voting2
                  ? lastGame?.days[lastGame?.days?.length - 1].lastVotes2
                  : gameLevel?.subLevel === "People Decide"
                  ? lastGame?.days[lastGame?.days?.length - 1].lastVotes2
                  : undefined,
                decideVotes:
                  lastGame?.days[lastGame?.days?.length - 1].peopleDecide,
                subLevel: gameLevel?.subLevel,
              });
            }
            setLoadingReJoin(false);
          } else if (gameLevel?.level === "Night") {
            setGame({
              value: "Night",
              options: [],
              players: lastGame?.players,
              reJoin: true,
            });
            setNightNumber(
              lastGame?.nights[lastGame?.nights?.length - 1].number
            );
            setLoadingReJoin(false);
          } else if (gameLevel?.level === "Common Time") {
            setGame({
              value: "Common Time",
              options: [],
              players: lastGame?.players,
              reJoin: true,
            });
            setNightNumber(
              lastGame?.nights[lastGame?.nights?.length - 1].number
            );
            setLoadingReJoin(false);
          } else {
            setLoadingReJoin(false);
          }
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    if (activeRoom?.reJoin) {
      GetGamePosition();
    }
  }, [activeRoom]);

  /**
   * Game over
   */
  useEffect(() => {
    if (socket) {
      socket.on("gameOver", (overData: any) => {
        if (overData?.usersInRoom?.length >= 2) {
          setAttention({
            active: true,
            value:
              "Game over - Winners " +
              `${"'" + overData.gameOver.winners + "'"}`,
          });
        }
        setTimeout(() => {
          // End the game and return to the initial stage
          setGame({ value: "Ready to start", options: [] });
          setDayNumber(1);
          setNightNumber(1);
          setAttention({ active: false, value: "" });
        }, 7000);
      });
      return () => {
        socket.off("gameOver", handleLastWordTimerEnd);
      };
    }
  }, [socket]);

  /**
   * Logs
   */
  const [openLogs, setOpenLogs] = useState(false);
  /**
   * User
   */
  const [openUser, setOpenUser] = useState<any>(null);

  /**
   * Open / close spectators
   */
  const [openSpectators, setOpenSpectators] = useState(false);

  // open ban to user
  const [openBan, setOpenBan] = useState<any>(null);

  /**
   * Block user
   */
  const [openBlock, setOpenBlock] = useState<any>(null);

  /**
   * chat
   */
  const [openChat, setOpenChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(false);

  /**
   * messages state
   */
  const [loadingChat, setLoadingChat] = useState(true);
  const [messages, setMessages] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState<any>(null);

  useEffect(() => {
    const GetChat = async () => {
      try {
        const response = await axios(
          apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/chat?page=1"
        );
        if (response?.data.status === "success") {
          setTotalMessages(response.data.totalMessages);
          setMessages(response?.data?.data?.messages);
          if (
            !response?.data?.data?.lastMessagesSeen?.find(
              (i: any) => i === currentUser?._id
            )
          ) {
            setUnreadMessages(true);
          }
          setTimeout(() => {
            setLoadingChat(false);
          }, 1000);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
        setLoading(false);
      }
    };
    GetChat();
  }, []);

  useEffect(() => {
    // Define the event handler
    const handleSendMessage = (data: any) => {
      if (data?.message?.sender?.userId !== currentUser?._id) {
        setMessages((prev: any) => [data?.message, ...prev]);
        setUnreadMessages(true);
      }
    };
    if (socket) {
      // Attach the event listener
      socket.on("sendGameChatMessage", handleSendMessage);

      // Clean up by removing the event listener
      return () => {
        socket.off("sendGameChatMessage", handleSendMessage);
      };
    }
  }, [socket, currentUser?._id]); // Add currentUser._id as a dependency

  /**
   * open video to big screen
   */
  const { openVideo, setOpenVideo } = useVideoConnectionContext();
  return (
    <BlurView
      intensity={50}
      tint="dark"
      style={{
        flex: 1,
        width: "100%",
      }}
    >
      {openSpectators && (
        <Spectators
          setOpenSpectators={setOpenSpectators}
          setOpenUser={setOpenUser}
        />
      )}
      {openBan && (
        <Ban
          setOpenBan={setOpenBan}
          openUser={openUser}
          setOpenUser={setOpenUser}
        />
      )}
      {attention.active && (
        <AttentionWindow attention={attention} data={openNominationsWindow} />
      )}
      <Animated.View
        style={[styles.container, { backgroundColor: backgroundColor }]}
      >
        <Header
          game={game}
          setAttention={setAttention}
          setOpenLogs={setOpenLogs}
          openConfirmRoles={openConfirmRoles}
          setOpenSpectators={setOpenSpectators}
          setOpenChat={setOpenChat}
          openChat={openChat}
          unreadMessages={unreadMessages}
        />
        {openVideo && (
          <OpenVideo
            streamUrl={openVideo?.video}
            user={openVideo?.user}
            setOpenVideo={setOpenVideo}
            setOpenUser={setOpenUser}
          />
        )}
        {game.value === "Dealing Cards" && (
          <DealingCards
            timeController={dealingCardsTimer}
            loading={loadingConfirm}
            setLoading={setLoadingConfirm}
          />
        )}
        {game.value === "Personal Time Of Death" && (
          <PersonalTimeOfDead
            game={game}
            setGame={setGame}
            timeController={lastWordTimer}
            skipLastTimerLoading={skipLastTimerLoading}
            skip={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }

              setSkipLastTimerLoading(true);
              socket.emit("skipLastTimer", {
                ...lastWordData,
                roomId: activeRoom?._id,
              });
            }}
          />
        )}
        {openNominationsWindow?.active && (
          <NominationWindow
            data={openNominationsWindow}
            setOpenNominationsWindow={setOpenNominationsWindow}
            dayNumber={dayNumber}
            setDayNumber={setDayNumber}
            game={game}
            setGame={setGame}
            setDays={setDays}
            setAttention={setAttention}
            SaveAfterLeaveDataInDB={SaveAfterLeaveDataInDB}
          />
        )}
        <Table
          setLoading={setLoading}
          game={game}
          setGame={setGame}
          timeController={
            game.value === "Day"
              ? speechTimer
              : game.value === "Users are confirming own roles.."
              ? dealingCardsTimer
              : game.value === "Getting to know mafias"
              ? gettingKnowsMafiasTimer
              : game.value === "Night"
              ? nightTimer
              : game.value === "Common Time"
              ? commonTimer
              : 0
          }
          activePlayerToSpeech={activePlayerToSpeech}
          dayNumber={dayNumber}
          days={days}
          nights={nights}
          setNights={setNights}
          nightNumber={nightNumber}
          speechTimer={speechTimer}
          loadingReJoin={loadingReJoin}
          setOpenUser={setOpenUser}
        />

        {/**
         * თამაშის პერიოდის აღწერა და დღის თაიმერი
         */}
        <View style={styles.review}>
          <GameProcess
            game={game}
            setGame={setGame}
            timeController={
              game.value === "Day"
                ? speechTimer
                : game.value === "Users are confirming own roles.."
                ? dealingCardsTimer
                : game.value === "Getting to know mafias"
                ? gettingKnowsMafiasTimer
                : game.value === "Night"
                ? nightTimer
                : game.value === "Common Time"
                ? commonTimer
                : 0
            }
            dayNumber={dayNumber}
            nightNumber={nightNumber}
            speecher={activePlayerToSpeech}
            loading={loading}
            setLoading={setLoading}
            activePlayerToSpeech={activePlayerToSpeech}
            speechTimer={speechTimer}
            StartPlay={StartPlay}
            changeSpeakerLoading={
              game?.value === "Personal Time Of Death"
                ? skipLastTimerLoading
                : changeSpeakerLoading
            }
            SkipSpeech={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }

              setChangeSpeakerLoading(true);

              socket.emit("changeSpeaker", currentSpeechData);
            }}
            setOpenConfirmRoles={setOpenConfirmRoles}
            confirmedRoles={confirmedRoles}
            setConfirmedRoles={setConfirmedRoles}
          />
        </View>
      </Animated.View>
      <LogsModal openLogs={openLogs} setOpenLogs={setOpenLogs} />
      {openUser && (
        <UserPopup
          openUser={openUser}
          setOpenBan={setOpenBan}
          setOpenBlock={setOpenBlock}
          setOpenUser={setOpenUser}
        />
      )}

      {openConfirmRoles && (
        <ConfirmRoles
          setOpenConfirmRoles={setOpenConfirmRoles}
          setConfirmedRoles={setConfirmedRoles}
          roles={roles}
          confirmedRoles={confirmedRoles}
          StartPlay={StartPlay}
          loadingStarting={loadingStarting}
        />
      )}

      {openBlock && (
        <Block
          userId={openUser?.userId}
          userName={openUser?.userName}
          setOpenBlock={setOpenBlock}
          setOpenUser={setOpenUser}
          from={{ state: "room", stateId: activeRoom?._id }}
        />
      )}
      {openChat && (
        <Chat
          loading={loadingChat}
          setLoading={setLoadingChat}
          page={page}
          setPage={setPage}
          setTotalMessages={setTotalMessages}
          totalMessages={totalMessages}
          messages={messages}
          setMessages={setMessages}
          setOpenChat={setOpenChat}
          setUnreadMessages={setUnreadMessages}
        />
      )}
    </BlurView>
  );
};

export default Game;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: SCREEN_HEIGHT,
    gap: 40,
  },
  review: {
    position: "absolute",
    bottom: 48,
    width: "90%",
    alignItems: "center",
    gap: 4,
  },
});

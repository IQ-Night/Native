import axios from "axios";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Img from "../components/image";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import JustifyTimer from "./timers/justifyTimer";
import JustifyTimer2 from "./timers/justifyTimer2";
import PeopleDecide from "./timers/peopleDecide";
import VotingTimer from "./timers/votingTimer";
import VotingTimer2 from "./timers/votingTimer2";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import * as Haptics from "expo-haptics";
import VideoComponent from "../components/videoComponent";

const NominationWindow = ({
  data,
  setOpenNominationsWindow,
  setGame,
  dayNumber,
  setDayNumber,
  setDays,
  setAttention,
  SaveAfterLeaveDataInDB,
  game,
  setOpenUser,
  setOpenVideo,
}: any) => {
  /**
   * App context
   */
  const { theme, apiUrl, haptics, activeLanguage } = useAppContext();

  /**
   * Game Context
   */
  const { activeRoom, socket, gamePlayers } = useGameContext();

  /**
   * Auth Context
   */
  const { currentUser } = useAuthContext();
  const currentPlayerInRoom = gamePlayers?.find(
    (u: any) => u?.userId === currentUser?._id
  );

  const [sortedNominantes, setSortedNominantes] = useState<any>([]);

  /**
   * Start speech for first user
   */

  const [speecher, setSpeecher] = useState<any>(null);
  const [speecherData, setSpeecherData] = useState<any>(null);
  const [changeSpeakerLoading, setChangeSpeakerLoading] = useState(false);

  // vote opening
  const [voting, setVoting] = useState<any>(null);
  // votes
  const [votes, setVotes] = useState([]);

  /**
   * People decide if draw in re-vote state
   */
  const [openDecideVoting, setOpenDecideVoting] = useState<any>(null);
  const [decideVotes, setDecideVotes] = useState([]);

  useEffect(() => {
    if (data?.subLevel === "People Decide") {
      setOpenDecideVoting(true);
      setVotes(data?.votes);
      setDecideVotes(data?.decideVotes);
      setDays([]);
      return;
    }
    // maped
    const mapedList = data?.reJoin
      ? data?.nominantes
      : data?.nominantes.map((nom: any, index: number) => {
          let user = data?.players.find(
            (user: any) => user.userId === nom.victim
          );
          return { ...user, count: nom.count };
        });
    // Sort users by playerNumber
    const sortedUsers = mapedList.sort(
      (a: any, b: any) => a.playerNumber - b.playerNumber
    );
    // Sort nominates by count in descending order
    setSortedNominantes(
      sortedUsers.sort((a: any, b: any) => b.count - a.count)
    );

    if (sortedUsers?.length > 0) {
      let firstPlayer = sortedUsers[0];
      const host = data?.players.filter((u: any) => u.status !== "offline")[0];
      if (data?.reJoin) {
        if (data?.voting === "voting1" || data?.voting === "voting2") {
          setVotes(data?.votes);
          if (data?.voting === "voting1") {
            setVoting(1);
          } else if (data?.voting === "voting2") {
            setVoting(2);
          }
          return;
        } else {
          setSpeecher(data?.activePlayer);
          setSpeecherData({
            nominationNumber: data?.subLevel === "JustifyTimer2" ? "2" : "",
            roomId: host.roomId,
            player: data?.activePlayer,
            list: sortedUsers,
          });
        }
      } else {
        setSpeecher(firstPlayer);
      }
      setVoting(null);
      if (!data?.reJoin) {
        if (host?.userId === currentUser?._id) {
          socket.emit("JustifyTimerStart", {
            roomId: host.roomId,
            player: firstPlayer,
            list: sortedUsers,
            nominationNumber: data?.nominationsNumber,
          });
          if (host?.userId === currentUser?._id) {
            const saveData = {
              value: "Nomination Speech",
            };
            SaveAfterLeaveDataInDB(saveData, host?.roomId);
          }
        }
      }
      if (!data?.reJoin) {
        setSpeecherData({
          nominationNumber: "",
          roomId: host.roomId,
          player: firstPlayer,
          list: sortedUsers,
        });
      }
    }

    setDays([]);
  }, [data.nominantes, data.players]);

  // სიტყვის გამოსვლის თაიმერი
  const { justifyTimer, setJustifyTimer } = JustifyTimer({ socket });
  // მეორედ სიტყვის გამოსვლის თაიმერი
  const { justifyTimer2, setJustifyTimer2 } = JustifyTimer2({ socket });
  // ხმის მიცემის თაიმერი
  const { votingTimer } = VotingTimer({ socket });
  // მერეჯერ ხმის მიცემის თაიმერი
  const { votingTimer2 } = VotingTimer2({ socket });
  // ხალხის გადაწყვეტის თაიმერ
  const { peopleDecide } = PeopleDecide({ socket });

  useEffect(() => {
    if (socket) {
      socket.on("JustifyTimerEnd", (newData: any) => {
        setJustifyTimer(0);
        setChangeSpeakerLoading(false);
        const currentPlayer = newData.player;
        let nominantes = newData.list; // assuming you meant to access `newData.nominantes`
        // Find the index of the current player in the nominantes list

        nominantes = nominantes.sort(
          (a: any, b: any) => a.playerNumber - b.playerNumber
        );

        // Find the current player in the sorted list
        // Find the current player's playerNumber
        const currentPlayerNumber = currentPlayer.playerNumber;

        // Find the next player with a greater playerNumber
        const nextPlayer = nominantes.find(
          (p: any) => p.playerNumber > currentPlayerNumber
        );

        const host = newData?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];

        setSpeecherData({
          nominationNumber: "",
          roomId: activeRoom._id,
          player: nextPlayer, // Emit the next player
          list: nominantes,
        });

        setSortedNominantes(nominantes);

        if (nextPlayer) {
          setSpeecher(nextPlayer); // Set the next player as the speaker
          if (host?.userId === currentUser?._id) {
            socket.emit("JustifyTimerStart", {
              roomId: activeRoom._id,
              player: nextPlayer, // Emit the next player
              list: nominantes,
            });
          }
        } else {
          setVoting(1);
          setSpeecher(null);
          if (host?.userId === currentUser?._id) {
            socket.emit("VotingTimerStart", {
              roomId: activeRoom._id,
            });
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("JustifyTimerEnd");
      }
    };
  }, [socket, data, activeRoom]);

  const GiveVote = async ({ playerId }: any) => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    const alreadyVoted = votes?.find(
      (v: any) => v.votedBy === currentUser?._id && v.voteFor === playerId
    );
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/rooms/" + activeRoom._id + "/lastVote",
        {
          vote: {
            votedBy: currentUser._id,
            voteFor: alreadyVoted ? undefined : playerId,
          },
        }
      );
      if (response.data.status === "success") {
        let voted: any;
        if (alreadyVoted) {
          voted = "Cancel";
        } else if (
          votes?.find(
            (v: any) => v.votedBy === currentUser?._id && v.voteFor !== playerId
          )
        ) {
          voted = "Already voted to another player";
        } else if (!votes?.find((v: any) => v.votedBy === currentUser?._id)) {
          voted = "No";
        }

        let victim = gamePlayers?.find((p: any) => p.userId === playerId).role
          ?.value;
        let currentUserRole = gamePlayers?.find(
          (p: any) => p.userId === currentUser?._id
        ).role?.value;

        if (voted === "Cancel") {
          AddRating({ points: 0, scenario: "Cancel", removeOld: true });
        } else if (voted === "Already voted to another player") {
          if (currentUserRole === "serial-killer") {
            if (victim === "citizen") {
              AddRating({
                points: 1,
                scenario:
                  "Vote to citizen by serial-killer to leave in first nomination",
                removeOld: true,
              });
            } else if (victim === "doctor") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to doctor by serial-killer to leave in first nomination",
                removeOld: true,
              });
            } else if (victim === "police") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to police by serial-killer to leave in first nomination",
                removeOld: true,
              });
            } else if (victim?.includes("mafia")) {
              AddRating({
                points: 4,
                scenario:
                  "Vote to mafia by serial-killer to leave in first nomination",
                removeOld: true,
              });
            }
          } else if (currentUserRole === "doctor") {
            if (victim === "serial-killer") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to serial-killer by doctor to leave in first nomination",
                removeOld: true,
              });
            } else if (victim?.includes("don")) {
              AddRating({
                points: 2,
                scenario: "Vote to don by doctor to leave in first nomination",
                removeOld: true,
              });
            } else if (victim?.includes("mafia") && !victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario:
                  "Vote to mafia by doctor to leave in first nomination",
                removeOld: true,
              });
            }
          } else if (currentUserRole === "police") {
            if (victim === "serial-killer") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to serial-killer by police to leave in first nomination",
                removeOld: true,
              });
            } else if (victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario: "Vote to don by police to leave in first nomination",
                removeOld: true,
              });
            } else if (victim?.includes("mafia") && !victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario:
                  "Vote to mafia by police to leave in first nomination",
                removeOld: true,
              });
            }
          } else if (currentUserRole?.includes("mafia")) {
            if (victim === "serial-killer") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to serial-killer by mafia to leave in first nomination",
                removeOld: true,
              });
            } else if (victim === "police") {
              AddRating({
                points: 4,
                scenario:
                  "Vote to police by mafia to leave in first nomination",
                removeOld: true,
              });
            } else if (victim === "doctor") {
              AddRating({
                points: 4,
                scenario:
                  "Vote to doctor by mafia to leave in first nomination",
                removeOld: true,
              });
            }
          } else if (currentUserRole === "citizen") {
            if (victim === "serial-killer") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to serial-killer by citizen to leave in first nomination",
                removeOld: true,
              });
            } else if (victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario: "Vote to don by citizen to leave in first nomination",
                removeOld: true,
              });
            } else if (victim?.includes("mafia") && !victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario:
                  "Vote to mafia by citizen to leave in first nomination",
                removeOld: true,
              });
            }
          }
        } else if (voted === "No") {
          if (currentUserRole === "serial-killer") {
            if (victim === "citizen") {
              AddRating({
                points: 1,
                scenario:
                  "Vote to citizen by serial-killer to leave in first nomination",
              });
            } else if (victim === "doctor") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to doctor by serial-killer to leave in first nomination",
              });
            } else if (victim === "police") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to police by serial-killer to leave in first nomination",
              });
            } else if (victim?.includes("mafia")) {
              AddRating({
                points: 4,
                scenario:
                  "Vote to mafia by serial-killer to leave in first nomination",
              });
            }
          } else if (currentUserRole === "doctor") {
            if (victim === "serial-killer") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to serial-killer by doctor to leave in first nomination",
              });
            } else if (victim?.includes("don")) {
              AddRating({
                points: 2,
                scenario: "Vote to don by doctor to leave in first nomination",
              });
            } else if (victim?.includes("mafia") && !victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario:
                  "Vote to mafia by doctor to leave in first nomination",
              });
            }
          } else if (currentUserRole === "police") {
            if (victim === "serial-killer") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to serial-killer by police to leave in first nomination",
              });
            } else if (victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario: "Vote to don by police to leave in first nomination",
              });
            } else if (victim?.includes("mafia") && !victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario:
                  "Vote to mafia by police to leave in first nomination",
              });
            }
          } else if (currentUserRole?.includes("mafia")) {
            if (victim === "serial-killer") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to serial-killer by mafia to leave in first nomination",
              });
            } else if (victim === "police") {
              AddRating({
                points: 4,
                scenario:
                  "Vote to police by mafia to leave in first nomination",
              });
            } else if (victim === "doctor") {
              AddRating({
                points: 4,
                scenario:
                  "Vote to doctor by mafia to leave in first nomination",
              });
            }
          } else if (currentUserRole === "citizen") {
            if (victim === "serial-killer") {
              AddRating({
                points: 2,
                scenario:
                  "Vote to serial-killer by citizen to leave in first nomination",
              });
            } else if (victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario: "Vote to don by citizen to leave in first nomination",
              });
            } else if (victim?.includes("mafia") && !victim?.includes("don")) {
              AddRating({
                points: 4,
                scenario:
                  "Vote to mafia by citizen to leave in first nomination",
              });
            }
          }
        }
      }
    } catch (error: any) {
      console.log(error.response);
    }
  };

  // if 2nd nomination and only 2 nominates are, the nominantes cannot vote
  // save first nomination votes
  const [firstNominationVotes, setFirstNominationVotes] = useState([]);

  // 1. დათვალე ნომინანტების ხმები
  const nominantesCount = firstNominationVotes?.reduce(
    (acc: any, vote: any) => {
      acc[vote.voteFor] = (acc[vote.voteFor] || 0) + 1; // თითოეულ ნომინანტს დაუმატოს ხმა
      return acc;
    },
    {}
  );

  // 2. გადაამოწმე ნომინანტების რაოდენობა
  const uniqueNominantes = Object.keys(nominantesCount); // უნიკალური ნომინანტები
  let currentUserCanVote = true; // ხმის მიცემის ნებართვის საწყისი მნიშვნელობა

  // 3. თუ ნომინანტების რაოდენობა არის 2 და ხმის მიცემა მეორე რაუნდშია
  if (uniqueNominantes.length === 2 && voting === 2) {
    // 4. შეამოწმე, არის თუ არა მომხმარებელი ნომინანტებში
    if (uniqueNominantes.includes(currentUser?._id)) {
      currentUserCanVote = false; // ნომინირებულს არ შეუძლია ხმის მიცემა
    }
  }

  const GiveVote2 = async ({ playerId }: any) => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    const alreadyVoted = votes?.find(
      (v: any) => v.votedBy === currentUser?._id && v.voteFor === playerId
    );
    try {
      await axios.patch(
        apiUrl + "/api/v1/rooms/" + activeRoom._id + "/lastVote2",
        {
          vote: {
            votedBy: currentUser._id,
            voteFor: alreadyVoted ? undefined : playerId,
          },
        }
      );

      let voted: any;
      if (alreadyVoted) {
        voted = "Cancel";
      } else if (
        votes?.find(
          (v: any) => v.votedBy === currentUser?._id && v.voteFor !== playerId
        )
      ) {
        voted = "Already voted to another player";
      } else if (!votes?.find((v: any) => v.votedBy === currentUser?._id)) {
        voted = "No";
      }

      let victim = gamePlayers?.find((p: any) => p.userId === playerId).role
        ?.value;
      let currentUserRole = gamePlayers?.find(
        (p: any) => p.userId === currentUser?._id
      ).role?.value;

      if (voted === "Cancel") {
        AddRating({ points: 0, scenario: "Cancel", removeOld: true });
      } else if (voted === "Already voted to another player") {
        if (currentUserRole === "serial-killer") {
          if (victim === "citizen") {
            AddRating({
              points: 1,
              scenario:
                "Vote to citizen by serial-killer to leave in second nomination",
              removeOld: true,
            });
          } else if (victim === "doctor") {
            AddRating({
              points: 2,
              scenario:
                "Vote to doctor by serial-killer to leave in second nomination",
              removeOld: true,
            });
          } else if (victim === "police") {
            AddRating({
              points: 2,
              scenario:
                "Vote to police by serial-killer to leave in second nomination",
              removeOld: true,
            });
          } else if (victim?.includes("mafia")) {
            AddRating({
              points: 4,
              scenario:
                "Vote to mafia by serial-killer to leave in second nomination",
              removeOld: true,
            });
          }
        } else if (currentUserRole === "doctor") {
          if (victim === "serial-killer") {
            AddRating({
              points: 2,
              scenario:
                "Vote to serial-killer by doctor to leave in second nomination",
              removeOld: true,
            });
          } else if (victim?.includes("don")) {
            AddRating({
              points: 2,
              scenario: "Vote to don by doctor to leave in second nomination",
              removeOld: true,
            });
          } else if (victim?.includes("mafia") && !victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario: "Vote to mafia by doctor to leave in second nomination",
              removeOld: true,
            });
          }
        } else if (currentUserRole === "police") {
          if (victim === "serial-killer") {
            AddRating({
              points: 2,
              scenario:
                "Vote to serial-killer by police to leave in second nomination",
              removeOld: true,
            });
          } else if (victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario: "Vote to don by police to leave in second nomination",
              removeOld: true,
            });
          } else if (victim?.includes("mafia") && !victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario: "Vote to mafia by police to leave in second nomination",
              removeOld: true,
            });
          }
        } else if (currentUserRole?.includes("mafia")) {
          if (victim === "serial-killer") {
            AddRating({
              points: 2,
              scenario:
                "Vote to serial-killer by mafia to leave in second nomination",
              removeOld: true,
            });
          } else if (victim === "police") {
            AddRating({
              points: 4,
              scenario: "Vote to police by mafia to leave in second nomination",
              removeOld: true,
            });
          } else if (victim === "doctor") {
            AddRating({
              points: 4,
              scenario: "Vote to doctor by mafia to leave in second nomination",
              removeOld: true,
            });
          }
        } else if (currentUserRole === "citizen") {
          if (victim === "serial-killer") {
            AddRating({
              points: 2,
              scenario:
                "Vote to serial-killer by citizen to leave in second nomination",
              removeOld: true,
            });
          } else if (victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario: "Vote to don by citizen to leave in second nomination",
              removeOld: true,
            });
          } else if (victim?.includes("mafia") && !victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario:
                "Vote to mafia by citizen to leave in second nomination",
              removeOld: true,
            });
          }
        }
      } else if (voted === "No") {
        if (currentUserRole === "serial-killer") {
          if (victim === "citizen") {
            AddRating({
              points: 1,
              scenario:
                "Vote to citizen by serial-killer to leave in second nomination",
            });
          } else if (victim === "doctor") {
            AddRating({
              points: 2,
              scenario:
                "Vote to doctor by serial-killer to leave in second nomination",
            });
          } else if (victim === "police") {
            AddRating({
              points: 2,
              scenario:
                "Vote to police by serial-killer to leave in second nomination",
            });
          } else if (victim?.includes("mafia")) {
            AddRating({
              points: 4,
              scenario:
                "Vote to mafia by serial-killer to leave in second nomination",
            });
          }
        } else if (currentUserRole === "doctor") {
          if (victim === "serial-killer") {
            AddRating({
              points: 2,
              scenario:
                "Vote to serial-killer by doctor to leave in second nomination",
            });
          } else if (victim?.includes("don")) {
            AddRating({
              points: 2,
              scenario: "Vote to don by doctor to leave in second nomination",
            });
          } else if (victim?.includes("mafia") && !victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario: "Vote to mafia by doctor to leave in second nomination",
            });
          }
        } else if (currentUserRole === "police") {
          if (victim === "serial-killer") {
            AddRating({
              points: 2,
              scenario:
                "Vote to serial-killer by police to leave in second nomination",
            });
          } else if (victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario: "Vote to don by police to leave in second nomination",
            });
          } else if (victim?.includes("mafia") && !victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario: "Vote to mafia by police to leave in second nomination",
            });
          }
        } else if (currentUserRole?.includes("mafia")) {
          if (victim === "serial-killer") {
            AddRating({
              points: 2,
              scenario:
                "Vote to serial-killer by mafia to leave in second nomination",
            });
          } else if (victim === "police") {
            AddRating({
              points: 4,
              scenario: "Vote to police by mafia to leave in second nomination",
            });
          } else if (victim === "doctor") {
            AddRating({
              points: 4,
              scenario: "Vote to doctor by mafia to leave in second nomination",
            });
          }
        } else if (currentUserRole === "citizen") {
          if (victim === "serial-killer") {
            AddRating({
              points: 2,
              scenario:
                "Vote to serial-killer by citizen to leave in second nomination",
            });
          } else if (victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario: "Vote to don by citizen to leave in second nomination",
            });
          } else if (victim?.includes("mafia") && !victim?.includes("don")) {
            AddRating({
              points: 4,
              scenario:
                "Vote to mafia by citizen to leave in second nomination",
            });
          }
        }
      }
    } catch (error: any) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    if (!socket) return; // Ensure the socket is defined

    const handleLastVotes = (data: any) => {
      setVotes(data.votes);
    };

    // Set up the socket listener
    socket.on("lastVotes", handleLastVotes);

    // Clean up the socket listener on unmount or when socket changes
    return () => {
      socket.off("lastVotes", handleLastVotes);
    };
  }, [socket]);

  // last votes timer end
  useEffect(() => {
    if (socket) {
      socket.on("VotingTimerEnd", (newData: any) => {
        const host = newData?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];
        let firstSpeecher = newData.lastVotes[0];
        if (newData.lastVotes.length === 0) {
          setVoting(null);
          setOpenNominationsWindow(null);
          setGame({
            value: "Night",
            options: [], // Target the player
            players: newData?.players,
          });
          setDayNumber(dayNumber + 1);
        } else if (newData.lastVotes.length > 1) {
          setOpenNominationsWindow((prev: any) => ({
            ...prev,
            nominationsNumber: 2,
          }));
          setAttention({
            active: true,
            value: `Voting Draw`,
          });
          setTimeout(() => {
            setAttention({
              active: false,
              value: ``,
            });
            setVoting(null);
            let player = newData.players.find(
              (pl: any) => pl.userId === firstSpeecher.voteFor
            );
            let list = newData.lastVotes.map((vt: any) => {
              let user = newData.players.find(
                (nom: any) => nom.userId === vt.voteFor
              );
              return { ...user, count: vt.count, votedBy: vt.votedBy };
            });

            setSortedNominantes(list);
            setSpeecher(player);

            if (currentUser._id === host?.userId) {
              socket.emit("JustifyTimer2Start", {
                roomId: activeRoom._id,
                player: player,
                list,
              });
              if (host?.userId === currentUser?._id) {
                const saveData = {
                  value: "Nomination Speech",
                  playerToSpeech: null,
                  level: 2,
                  nominantes: list,
                  totalNominantes: list?.length,
                };
                SaveAfterLeaveDataInDB(saveData, host?.roomId);
              }
            }
            setSpeecherData({
              nominationNumber: "2",
              roomId: activeRoom._id,
              player: player,
              list,
            });
          }, 3000);
        } else {
          if (currentUser._id === host?.userId) {
            let player = newData.players?.find(
              (p: any) => p.userId === firstSpeecher.voteFor
            );

            player = {
              ...player,
              userId: player.userId,
              userCover: player.userCover,
              userName: player.userName,
            };
            if (socket) {
              socket.emit("exitPlayer", {
                roomId: newData.players[0].roomId,
                exitPlayers: [player],
                nextDayNumber: dayNumber + 1,
                after: "Night",
              });
            }
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("VotingTimerEnd");
      }
    };
  }, [socket, dayNumber, activeRoom]);

  useEffect(() => {
    if (socket) {
      socket.on("JustifyTimer2End", (newData: any) => {
        const host = newData?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];
        setJustifyTimer2(0);
        const currentPlayer = newData.player;
        const nominantes = newData.list; // assuming you meant to access `newData.nominantes`

        // Find the index of the current player in the nominantes list
        const currentIndex = nominantes.findIndex(
          (p: any) => p.userId === currentPlayer.userId
        );

        // Calculate the next player's object or return undefined if the current player is the last in the list
        const nextPlayer = nominantes[currentIndex + 1]; // Return undefined if the current player is the last in the list

        if (nextPlayer) {
          setSpeecher(nextPlayer); // Set the next player as the speaker
          if (host?.userId === currentUser?._id) {
            socket.emit("JustifyTimer2Start", {
              roomId: activeRoom._id,
              player: nextPlayer, // Emit the next player
              list: nominantes,
              nominationNumber: data?.nominationsNumber,
            });
          }
          setSpeecherData({
            nominationNumber: "2",
            roomId: activeRoom._id,
            player: nextPlayer, // Emit the next player
            list: nominantes,
          });
        } else {
          setAttention({
            active: true,
            value: `Starting Voting`,
            players: nominantes,
          });
          setTimeout(() => {
            setAttention({
              active: false,
              value: ``,
            });
            setVoting(2);
            setSpeecher(null);
            setFirstNominationVotes(votes);
            setVotes([]);
            if (host?.userId === currentUser?._id) {
              socket.emit("VotingTimer2Start", {
                roomId: activeRoom._id,
              });
            }
          }, 3000);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("JustifyTimer2End");
      }
    };
  }, [socket, data, sortedNominantes, activeRoom]);

  // update votes
  useEffect(() => {
    if (!socket) return; // Ensure socket is defined

    const handleDecideVotes = (data: any) => {
      setDecideVotes(data.votes);
    };

    // Set up the socket listener
    socket.on("decideVotes", handleDecideVotes);

    // Clean up the socket listener on unmount or when socket changes
    return () => {
      socket.off("decideVotes", handleDecideVotes);
    };
  }, [socket]);

  const DecideVote = async ({ value }: any) => {
    try {
      await axios.patch(
        apiUrl + "/api/v1/rooms/" + activeRoom._id + "/peopleDecide",
        {
          vote: { value, player: currentUser._id },
        }
      );
    } catch (error: any) {
      console.log(error.response);
    }
  };

  // last votes 2 timer end
  useEffect(() => {
    if (socket) {
      socket.on("VotingTimer2End", (newData: any) => {
        const host = newData?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];
        // if in rules leave both players or stay.
        const drawInReVote = activeRoom?.drawInReVote;
        if (newData.lastVotes.length > 2 || newData.lastVotes.length === 0) {
          setVoting(null);
          setOpenNominationsWindow(null);
          setGame({
            value: "Night",
            options: [], // Target the player
            players: newData?.players,
          });
          setDayNumber(dayNumber + 1);
        } else if (newData.lastVotes.length === 2) {
          if (drawInReVote === "Release all") {
            setVoting(null);
            setOpenNominationsWindow(null);
            setGame({
              value: "Night",
              options: [], // Target the player
              players: newData?.players,
            });
            setDayNumber(dayNumber + 1);
          } else if (drawInReVote === "Jail all") {
            if (currentUser._id === host?.userId) {
              let players = newData.lastVotes?.map((vote: any) => {
                let player = newData?.players?.find(
                  (p: any) => p.userId === vote.voteFor
                );
                player = {
                  ...player,
                  userId: player.userId,
                  userCover: player.userCover,
                  userName: player.userName,
                };
                return player;
              });
              if (socket) {
                socket.emit("exitPlayer", {
                  roomId: newData.players[0].roomId,
                  exitPlayers: players,
                  nextDayNumber: dayNumber + 1,
                  after: "Night",
                });
              }
            }
          } else {
            setOpenDecideVoting(true);
            if (currentUser._id === host?.userId) {
              if (socket) {
                socket.emit("PeopleDecideTimerStart", {
                  roomId: activeRoom._id,
                });
              }
            }
          }
        } else {
          let player = newData?.players?.find(
            (p: any) => p.userId === newData.lastVotes[0].voteFor
          );
          player = {
            ...player,
            userId: player.userId,
            userCover: player.userCover,
            userName: player.userName,
          };
          if (currentUser._id === host?.userId) {
            if (socket) {
              socket.emit("exitPlayer", {
                roomId: newData.players[0].roomId,
                exitPlayers: [player],
                nextDayNumber: dayNumber + 1,
                after: "Night",
              });
            }
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("VotingTimerEnd");
      }
    };
  }, [socket, dayNumber, activeRoom]);

  // People decide en
  useEffect(() => {
    if (socket) {
      socket.on("PeopleDecideTimerEnd", (newData: any) => {
        const host = newData?.players.filter(
          (u: any) => u.status !== "offline"
        )[0];
        // Count the number of "Release all" and "Jail all" votes
        const releaseVotesCount = decideVotes.filter(
          (vote: any) => vote.value === "Release all"
        ).length;
        const jailVotesCount = decideVotes.filter(
          (vote: any) => vote.value === "Jail all"
        ).length;

        // Compare the counts and alert accordingly
        if (releaseVotesCount > jailVotesCount) {
          setVoting(null);
          setOpenNominationsWindow(null);
          setGame({
            value: "Night",
            options: [], // Target the player
            players: newData?.players,
          });
          setDayNumber(dayNumber + 1);
          setOpenDecideVoting(null);
          setDecideVotes([]);
        } else if (jailVotesCount > releaseVotesCount) {
          if (currentUser._id === host?.userId) {
            let players = newData.votes?.map((vote: any) => {
              let player = newData?.players?.find(
                (p: any) => p.userId === vote.voteFor
              );
              player = {
                ...player,
                userId: player.userId,
                userCover: player.userCover,
                userName: player.userName,
              };
              return player;
            });
            if (socket) {
              socket.emit("exitPlayer", {
                roomId: newData.players[0].roomId,
                exitPlayers: players,
                nextDayNumber: dayNumber + 1,
                after: "Night",
              });
            }
          }
        } else {
          setVoting(null);
          setOpenNominationsWindow(null);
          setGame({
            value: "Night",
            options: [], // Target the player
            players: newData?.players,
          });
          setDayNumber(dayNumber + 1);
          setOpenDecideVoting(null);
          setDecideVotes([]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("PeopleDecideTimerEnd");
      }
    };
  }, [socket, decideVotes, dayNumber, activeRoom]);

  /**
   * Skip speech
   */
  const SkipSpeech = async () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    setChangeSpeakerLoading(true);
    socket.emit("SkipNominationSpeech", speecherData);
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
        }
      );
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  /**
   * Skip voting stage
   */
  const [skipLoading, setSkipLoading] = useState(false);
  const [skips, setSkips] = useState([]);

  const SkipVoting = () => {
    setSkipLoading(true);
    const mapedList = data?.reJoin
      ? data?.nominantes
      : data?.nominantes.map((nom: any, index: number) => {
          let user = data?.players.find(
            (user: any) => user.userId === nom.victim
          );
          return { ...user, count: nom.count };
        });
    // Sort users by playerNumber
    const sortedUsers = mapedList.sort(
      (a: any, b: any) => a.playerNumber - b.playerNumber
    );
    // Players who can vote
    const skipPlayers = gamePlayers?.filter((p: any) => {
      return !mapedList?.some((m: any) => m.userId === p.userId);
    });

    socket.emit("skipVoting", {
      roomId: activeRoom?._id,
      userId: currentUser?._id,
      unskip: skips?.find((skip: any) =>
        skip === currentUser?._id ? true : false
      ),
      votingStage: voting,
    });
  };

  useEffect(() => {
    if (socket) {
      const updateVotingSkips = (data: any) => {
        setSkips(data?.skips);
        setSkipLoading(false);
      };
      socket.on("votingSkipsUpdated", updateVotingSkips);
      return () => {
        socket.off("votingSkipsUpdated", updateVotingSkips);
      };
    }
  }, [socket]);

  // clean skips when start second time voting
  useEffect(() => {
    if (voting === 2) {
      setSkips([]);
    }
  }, [voting]);

  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        zIndex: 80,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "30%",
        gap: 32,
      }}
    >
      {openDecideVoting && (
        <View
          style={{
            alignItems: "center",
            gap: 48,
            width: "100%",
            height: "70%",
          }}
        >
          <View>
            {[
              ...new Map(
                votes.map((vote: any) => [vote.voteFor, vote])
              ).values(),
            ].map((vote: any, index: number) => {
              let user = gamePlayers?.find(
                (user: any) => user.userId === vote.voteFor
              );
              return (
                <View key={index}>
                  <Text style={{ color: theme.text }}>
                    N{user?.playerNumber} / {user?.userName}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              paddingHorizontal: 48,
              textAlign: "center",
            }}
          >
            {activeLanguage?.choice_release_or_jail_players}
          </Text>
          {!currentPlayerInRoom?.death && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
              }}
            >
              <Pressable
                onPress={() => DecideVote({ value: "Release all" })}
                style={{
                  width: "40%",
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                  backgroundColor: decideVotes?.find(
                    (v: any) =>
                      v.player === currentUser?._id && v.value === "Release all"
                  )
                    ? "#888"
                    : theme.active,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text style={{ color: "white" }}>
                  {activeLanguage?.releaseAll}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => DecideVote({ value: "Jail all" })}
                style={{
                  width: "40%",
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                  backgroundColor: decideVotes?.find(
                    (v: any) =>
                      v.player === currentUser?._id && v.value === "Jail all"
                  )
                    ? "#888"
                    : theme.active,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text style={{ color: "white" }}>
                  {activeLanguage?.jailAll}
                </Text>
              </Pressable>
            </View>
          )}

          <View
            style={{
              minWidth: 64,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 10,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 50,
              padding: 4,
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
              {peopleDecide}
              s.
            </Text>
          </View>
        </View>
      )}
      {!openDecideVoting && (
        <>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: theme.text,
              textAlign: "center",
            }}
          >
            {voting === 1 || voting === 2
              ? activeLanguage?.give_a_vote
              : activeLanguage?.players_to_speech}
          </Text>
          <View
            style={{
              width: "100%",
              height: "100%",
              // flexDirection: "row",
              // flexWrap: "wrap", // Allow wrapping to create columns
              alignItems: "center",
              // justifyContent: "center",
              gap: 4,
            }}
          >
            {sortedNominantes?.map((player: any, index: number) => {
              return (
                <Pressable
                  onPress={() => setOpenUser(player)}
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 16,
                    position: "relative",
                    transform: [
                      {
                        scale: player?.userId === speecher?.userId ? 1.1 : 1,
                      },
                    ],
                  }}
                >
                  {speecher?.userId === player?.userId && (
                    <View
                      style={{
                        borderRadius: 200,
                        width: 55,
                        height: 55,
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        zIndex: 90,
                      }}
                    >
                      <VideoComponent
                        userId={speecher?.userId}
                        game={game}
                        user={speecher}
                        setOpenUser={setOpenUser}
                        setOpenVideo={setOpenVideo}
                        nominations={data}
                        voting={voting}
                      />
                    </View>
                  )}

                  <View
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 50,
                      overflow: "hidden",

                      borderColor: "green",
                      transform: [
                        {
                          scale: player?.userId === speecher?.userId ? 1.1 : 1,
                        },
                      ],
                    }}
                  >
                    <Img uri={player?.userCover} />
                  </View>
                  <Text style={{ color: theme.active, fontWeight: 500 }}>
                    N{player?.playerNumber}
                  </Text>
                  {((voting === 1 && votingTimer > 1) ||
                    (voting === 2 && votingTimer2 > 1)) &&
                    currentPlayerInRoom?.type === "player" &&
                    !currentPlayerInRoom?.death &&
                    currentUserCanVote && (
                      <Pressable
                        onPress={
                          voting === 1 && !currentPlayerInRoom?.death
                            ? () => GiveVote({ playerId: player.userId })
                            : voting === 2 && !currentPlayerInRoom?.death
                            ? () => GiveVote2({ playerId: player.userId })
                            : () => alert("You can't voice")
                        }
                        style={{
                          backgroundColor: votes?.find(
                            (v: any) =>
                              v.votedBy === currentUser?._id &&
                              v.voteFor === player?.userId
                          )
                            ? "#888"
                            : theme.active,
                          borderRadius: 50,
                          padding: 4,
                          paddingHorizontal: 24,
                          borderStartColor: "green",
                        }}
                      >
                        {votes?.find(
                          (v: any) =>
                            v.votedBy === currentUser?._id &&
                            v.voteFor === player?.userId
                        ) ? (
                          <Text
                            style={{
                              color: "white",
                              fontWeight: 600,
                              minWidth: 50,
                              textAlign: "center",
                            }}
                          >
                            {activeLanguage?.cancel}
                          </Text>
                        ) : (
                          <Text
                            style={{
                              color: "white",
                              fontWeight: 600,
                              minWidth: 50,
                              textAlign: "center",
                            }}
                          >
                            {activeLanguage?.vote}
                          </Text>
                        )}
                      </Pressable>
                    )}
                </Pressable>
              );
            })}
            {voting === 1 && votingTimer > 0 && (
              <View
                style={{
                  minWidth: 64,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 50,
                  padding: 4,
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
                  {votingTimer}
                  {activeLanguage?.sec}
                </Text>
              </View>
            )}
            {voting === 2 && votingTimer2 > 0 && (
              <View
                style={{
                  minWidth: 64,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 50,
                  padding: 4,
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
                  {votingTimer2}
                  {activeLanguage?.sec}
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      <View
        style={{
          alignItems: "center",
          marginTop: 16,
          position: "absolute",
          zIndex: 50,
          bottom: 120,
          gap: 16,
        }}
      >
        {data.nominationsNumber === 2 && justifyTimer2 > 0 && (
          <View
            style={{
              minWidth: 64,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 10,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 50,
              padding: 4,
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
              {justifyTimer2}
              {activeLanguage?.sec}
            </Text>
          </View>
        )}
        {data.nominationsNumber === 1 && justifyTimer > 0 && (
          <View
            style={{
              minWidth: 64,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 10,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 50,
              padding: 4,
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
              {justifyTimer}
              {activeLanguage?.sec}
            </Text>
          </View>
        )}
        {(justifyTimer > 0 || justifyTimer2 > 0) &&
          speecher?.userId === currentUser?._id && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={SkipSpeech}
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
                {changeSpeakerLoading ? (
                  <ActivityIndicator size={16} color="white" />
                ) : (
                  activeLanguage?.skip
                )}
              </Text>
            </TouchableOpacity>
          )}
        {voting && currentUserCanVote && (
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={SkipVoting}
              style={{
                width: 160,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 6,
                borderRadius: 50,
                backgroundColor: "#181818",
                borderWidth: 1,
                borderColor: skips?.find(
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
                  color: skips?.find((skip: any) => skip === currentUser?._id)
                    ? theme.text
                    : theme.active,
                  fontWeight: 600,
                }}
              >
                {skipLoading ? (
                  <ActivityIndicator size={16} color={theme.active} />
                ) : skips?.find((skip: any) => skip === currentUser?._id) ? (
                  activeLanguage?.cancel
                ) : (
                  activeLanguage?.skip
                )}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BlurView>
  );
};

export default NominationWindow;

const styles = StyleSheet.create({});

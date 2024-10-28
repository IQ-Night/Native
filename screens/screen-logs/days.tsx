import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useAppContext } from "../../context/app";
import {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { roles } from "../../context/rooms";
import { findMostFrequentVictim } from "../../GAME/mostVictims";

const Days = ({ data, players }: any) => {
  const { theme } = useAppContext();
  const [openDay, setOpenDay] = useState<any>(null);
  return (
    <View style={{ gap: 4 }}>
      {data?.map((day: any, index: number) => {
        return (
          <Pressable
            onPress={
              openDay === day?.number
                ? () => setOpenDay(null)
                : () => setOpenDay(day?.number)
            }
            key={index}
            style={{
              padding: 12,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: theme.active, fontWeight: 600 }}>
                N{day?.number}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "500",
                  }}
                >
                  Result:
                </Text>
                {(() => {
                  // Determine the most frequent victim
                  let result = findMostFrequentVictim(day.votes || []);
                  const mostFrequentVictimId = result.mostFrequentVictims;

                  result = {
                    ...result,
                    mostFrequentVictims: mostFrequentVictimId
                      ? players.find(
                          (player: any) =>
                            player.userId === mostFrequentVictimId
                        ) || null
                      : null,
                  };

                  const currentDayBase = data;

                  // Check if serial killer killed during the day
                  let deathPlayer = players.find(
                    (user: any) =>
                      user.userId ===
                      currentDayBase?.killedBySerialKiller?.playerId
                  );

                  // Define the list of deaths
                  let deaths: any;

                  if (
                    (deathPlayer?.userId &&
                      result?.mostFrequentVictims?.userId &&
                      deathPlayer?.userId ===
                        result?.mostFrequentVictims?.userId) ||
                    (deathPlayer?.userId &&
                      !result?.mostFrequentVictims?.userId)
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
                        death?.userId === currentDayBase?.safePlayer?.playerId
                    );
                  }

                  if (playerSaved) {
                    deaths = deaths.filter(
                      (death: any) => death?.userId !== playerSaved.userId
                    );
                  }

                  if (deaths?.length > 0) {
                    return (
                      <View style={{ marginLeft: 8 }}>
                        {deaths?.map((d: any, x: number) => {
                          return (
                            <Text
                              key={x}
                              style={{
                                color: theme.text,
                                fontWeight: 500,
                                marginLeft: 8,
                              }}
                            >
                              <Text
                                style={{
                                  color: "red",
                                  fontSize: 16,
                                  fontWeight: 600,
                                }}
                              >
                                X{" "}
                              </Text>
                              N{d?.playerNumber}
                            </Text>
                          );
                        })}
                      </View>
                    );
                  } else {
                    return (
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: 500,
                          marginLeft: 8,
                        }}
                      >
                        No Players have left the game
                      </Text>
                    );
                  }
                })()}
              </View>
              <MaterialIcons
                size={18}
                name={
                  openDay === day?.number ? "arrow-drop-down" : "arrow-drop-up"
                }
                color={theme.active}
              />
            </View>
            {openDay === day?.number && (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: theme.active,
                    fontWeight: "500",
                    fontSize: 18,
                  }}
                >
                  Actions:
                </Text>
                <View style={{ gap: 8, marginTop: 16, marginLeft: 8 }}>
                  <Text style={{ color: theme.active, fontWeight: 500 }}>
                    Nomination:
                  </Text>

                  {day?.votes?.length > 0 && (
                    <View style={{ gap: 2 }}>
                      {day?.votes?.map((v: any, x: number) => {
                        const killer = players?.find(
                          (p: any) => p.userId === v.killer
                        );
                        const victim = players?.find(
                          (p: any) => p.userId === v.victim
                        );
                        const killerRoleLabel = roles?.find(
                          (r: any) => r.value === killer?.role?.value
                        )?.label;
                        const victimRoleLabel = roles?.find(
                          (r: any) => r.value === victim?.role?.value
                        )?.label;

                        return (
                          <View
                            key={x}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Text
                              style={{ color: theme.text, fontWeight: "500" }}
                            >
                              N{killer?.playerNumber} {killerRoleLabel}
                            </Text>
                            <Text
                              style={{
                                color: theme.active,
                                fontWeight: "500",
                              }}
                            >
                              to
                            </Text>
                            <Text
                              style={{ color: theme.text, fontWeight: "500" }}
                            >
                              N{victim?.playerNumber} {victimRoleLabel}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
                <View style={{ gap: 8, marginTop: 16, marginLeft: 8 }}>
                  <Text style={{ color: theme.active, fontWeight: 500 }}>
                    Voting:
                  </Text>

                  {day?.lastVotes?.length > 0 && (
                    <View style={{ gap: 2 }}>
                      {day?.lastVotes?.map((v: any, x: number) => {
                        const votedBy = players?.find(
                          (p: any) => p.userId === v.votedBy
                        );
                        const voteFor = players?.find(
                          (p: any) => p.userId === v.voteFor
                        );
                        const votedByRoleLabel = roles?.find(
                          (r: any) => r.value === votedBy?.role?.value
                        )?.label;
                        const voteForRoleLabel = roles?.find(
                          (r: any) => r.value === voteFor?.role?.value
                        )?.label;

                        return (
                          <View
                            key={x}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Text
                              style={{ color: theme.text, fontWeight: "500" }}
                            >
                              N{votedBy?.playerNumber} {votedByRoleLabel}
                            </Text>
                            <Text
                              style={{
                                color: theme.active,
                                fontWeight: "500",
                              }}
                            >
                              to
                            </Text>
                            <Text
                              style={{ color: theme.text, fontWeight: "500" }}
                            >
                              N{voteFor?.playerNumber} {voteForRoleLabel}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
                <View style={{ gap: 8, marginTop: 16, marginLeft: 8 }}>
                  <Text style={{ color: theme.active, fontWeight: 500 }}>
                    Decisive Voting:
                  </Text>

                  {day?.lastVotes2?.length > 0 && (
                    <View style={{ gap: 2 }}>
                      {day?.lastVotes2?.map((v: any, x: number) => {
                        const votedBy = players?.find(
                          (p: any) => p.userId === v.votedBy
                        );
                        const voteFor = players?.find(
                          (p: any) => p.userId === v.voteFor
                        );
                        const votedByRoleLabel = roles?.find(
                          (r: any) => r.value === votedBy?.role?.value
                        )?.label;
                        const voteForRoleLabel = roles?.find(
                          (r: any) => r.value === voteFor?.role?.value
                        )?.label;

                        return (
                          <View
                            key={x}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Text
                              style={{ color: theme.text, fontWeight: "500" }}
                            >
                              N{votedBy?.playerNumber} {votedByRoleLabel}
                            </Text>
                            <Text
                              style={{
                                color: theme.active,
                                fontWeight: "500",
                              }}
                            >
                              to
                            </Text>
                            <Text
                              style={{ color: theme.text, fontWeight: "500" }}
                            >
                              N{voteFor?.playerNumber} {voteForRoleLabel}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
                {day?.peopleDecide && (
                  <View style={{ gap: 8, marginTop: 16, marginLeft: 8 }}>
                    <Text style={{ color: theme.active, fontWeight: 500 }}>
                      People Decide:{" "}
                      <Text style={{ color: theme.text }}>
                        {(() => {
                          // Count the number of "Release all" and "Jail all" votes
                          const releaseVotesCount = day?.peopleDecide.filter(
                            (vote: any) => vote.value === "Release all"
                          ).length;
                          const jailVotesCount = day?.peopleDecide.filter(
                            (vote: any) => vote.value === "Jail all"
                          ).length;

                          // Compare the counts and alert accordingly
                          if (releaseVotesCount > jailVotesCount) {
                            return "Release All";
                          } else if (jailVotesCount > releaseVotesCount) {
                            return "Jail All";
                          } else {
                            return "Draw & Release All";
                          }
                        })()}
                      </Text>
                    </Text>

                    {day?.peopleDecide?.length > 0 && (
                      <View style={{ gap: 2 }}>
                        {day?.peopleDecide?.map((v: any, x: number) => {
                          const player = players?.find(
                            (p: any) => p.userId === v.player
                          );
                          const playerRoleLabel = roles?.find(
                            (r: any) => r.value === player?.role?.value
                          )?.label;

                          return (
                            <View
                              key={x}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{player?.playerNumber} {playerRoleLabel}
                              </Text>
                              {v?.value === "Jail all" ? (
                                <MaterialIcons
                                  name="done"
                                  color={theme.active}
                                />
                              ) : v?.value === "Release all" ? (
                                <MaterialIcons
                                  name="close"
                                  color={theme.active}
                                />
                              ) : (
                                ""
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}

                <View style={{ gap: 8, marginTop: 16 }}>
                  <Text
                    style={{
                      color: theme.active,
                      fontWeight: "500",
                      fontSize: 18,
                    }}
                  >
                    Result:
                  </Text>
                  <View>
                    {(() => {
                      // Determine the most frequent victim
                      let result = findMostFrequentVictim(day.votes || []);
                      const mostFrequentVictimId = result.mostFrequentVictims;

                      result = {
                        ...result,
                        mostFrequentVictims: mostFrequentVictimId
                          ? players.find(
                              (player: any) =>
                                player.userId === mostFrequentVictimId
                            ) || null
                          : null,
                      };

                      const currentDayBase = data;

                      // Check if serial killer killed during the day
                      let deathPlayer = players.find(
                        (user: any) =>
                          user.userId ===
                          currentDayBase?.killedBySerialKiller?.playerId
                      );

                      // Define the list of deaths
                      let deaths: any;

                      if (
                        (deathPlayer?.userId &&
                          result?.mostFrequentVictims?.userId &&
                          deathPlayer?.userId ===
                            result?.mostFrequentVictims?.userId) ||
                        (deathPlayer?.userId &&
                          !result?.mostFrequentVictims?.userId)
                      ) {
                        deaths = [deathPlayer];
                      } else if (
                        deathPlayer?.userId &&
                        result?.mostFrequentVictims?.userId &&
                        deathPlayer?.userId !==
                          result?.mostFrequentVictims?.userId
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
                            death?.userId ===
                            currentDayBase?.safePlayer?.playerId
                        );
                      }

                      if (playerSaved) {
                        deaths = deaths.filter(
                          (death: any) => death?.userId !== playerSaved.userId
                        );
                      }

                      if (deaths?.length > 0) {
                        return (
                          <View style={{ marginLeft: 8 }}>
                            {deaths?.map((d: any, x: number) => {
                              return (
                                <Text
                                  key={x}
                                  style={{
                                    color: theme.text,
                                    fontWeight: 500,
                                    marginLeft: 8,
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "red",
                                      fontSize: 16,
                                      fontWeight: 600,
                                    }}
                                  >
                                    X{" "}
                                  </Text>
                                  N{d?.playerNumber}
                                </Text>
                              );
                            })}
                          </View>
                        );
                      } else {
                        return (
                          <Text
                            style={{
                              color: theme.text,
                              fontWeight: 500,
                              marginLeft: 8,
                            }}
                          >
                            No Players have left the game
                          </Text>
                        );
                      }
                    })()}
                  </View>
                </View>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default Days;

const styles = StyleSheet.create({});

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

const Nights = ({ data, players }: any) => {
  const { theme } = useAppContext();
  const [openNight, setOpenNight] = useState<any>(null);
  return (
    <View style={{ gap: 4 }}>
      {data?.map((night: any, index: number) => {
        return (
          <Pressable
            onPress={
              openNight === night?.number
                ? () => setOpenNight(null)
                : () => setOpenNight(night?.number)
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
                N{night?.number}
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
                  let result = findMostFrequentVictim(night.votes || []);
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

                  const currentNightBase = data;

                  // Check if serial killer killed during the night
                  let deathPlayer = players.find(
                    (user: any) =>
                      user.userId ===
                      currentNightBase?.killedBySerialKiller?.playerId
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
                        death?.userId === currentNightBase?.safePlayer?.playerId
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
                  openNight === night?.number
                    ? "arrow-drop-down"
                    : "arrow-drop-up"
                }
                color={theme.active}
              />
            </View>
            {openNight === night?.number && (
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
                    Mafia's kills:
                  </Text>
                  {night?.votes?.length > 0 && (
                    <View>
                      {night?.votes?.map((v: any, x: number) => {
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
                            <Text style={{ color: "red", fontWeight: "500" }}>
                              X
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
                {night?.killedBySerialKiller && (
                  <View style={{ gap: 8, marginTop: 16, marginLeft: 8 }}>
                    <Text style={{ color: theme.active, fontWeight: "500" }}>
                      Serial Killer's kill:
                    </Text>
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {(() => {
                          const serialKiller = players?.find(
                            (p: any) => p?.role?.value === "serial-killer"
                          );

                          const serialKillerLabel = roles?.find(
                            (r: any) => r.value === serialKiller?.role?.value
                          )?.label;
                          const victim = players?.find(
                            (p: any) =>
                              p.userId === night?.killedBySerialKiller?.playerId
                          );
                          const victimLabel = roles?.find(
                            (r: any) => r.value === victim?.role?.value
                          )?.label;

                          return (
                            <>
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{serialKiller?.playerNumber}{" "}
                                {serialKillerLabel}
                              </Text>
                              <Text style={{ color: "red", fontWeight: "500" }}>
                                X
                              </Text>
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{victim?.playerNumber} {victimLabel}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    </View>
                  </View>
                )}
                {night?.findSherif && (
                  <View style={{ gap: 8, marginTop: 16, marginLeft: 8 }}>
                    <Text style={{ color: theme.active, fontWeight: "500" }}>
                      Mafia Don's Action:
                    </Text>
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {(() => {
                          const don = players?.find(
                            (p: any) => p?.role?.value === "mafia-don"
                          );

                          const findUser = players?.find(
                            (p: any) => p.userId === night?.findSherif?.findUser
                          );

                          const findUserLabel = roles?.find(
                            (r: any) => r.value === findUser?.role?.value
                          )?.label;

                          return (
                            <>
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{don?.playerNumber} Mafia Don
                              </Text>
                              <MaterialCommunityIcons
                                name="eye"
                                size={18}
                                color={
                                  night?.findSherif.findResult?.includes("Yes")
                                    ? theme.active
                                    : "#888"
                                }
                              />
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{findUser?.playerNumber} {findUserLabel}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    </View>
                  </View>
                )}
                {night?.findMafia && (
                  <View style={{ gap: 8, marginTop: 16, marginLeft: 8 }}>
                    <Text style={{ color: theme.active, fontWeight: "500" }}>
                      Police's Action:
                    </Text>
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {(() => {
                          const police = players?.find(
                            (p: any) => p?.role?.value === "police"
                          );

                          const findUser = players?.find(
                            (p: any) => p.userId === night?.findMafia?.findUser
                          );
                          const findUserLabel = roles?.find(
                            (r: any) => r.value === findUser?.role?.value
                          )?.label;

                          return (
                            <>
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{police?.playerNumber} Police
                              </Text>
                              <MaterialCommunityIcons
                                name="eye"
                                size={18}
                                color={
                                  night?.findMafia.findResult?.includes("Yes")
                                    ? theme.active
                                    : "#888"
                                }
                              />
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{findUser?.playerNumber} {findUserLabel}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    </View>
                  </View>
                )}
                {night?.safePlayer && (
                  <View style={{ gap: 8, marginTop: 16, marginLeft: 8 }}>
                    <Text style={{ color: theme.active, fontWeight: "500" }}>
                      Doctor's Action:
                    </Text>
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {(() => {
                          const doctor = players?.find(
                            (p: any) => p?.role?.value === "doctor"
                          );

                          const findUser = players?.find(
                            (p: any) => p.userId === night?.safePlayer?.playerId
                          );
                          const findUserLabel = roles?.find(
                            (r: any) => r.value === findUser?.role?.value
                          )?.label;

                          return (
                            <>
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{doctor?.playerNumber} Doctor
                              </Text>
                              <MaterialIcons
                                name="health-and-safety"
                                size={18}
                                color={
                                  night?.safePlayer.status ? "red" : "#888"
                                }
                              />
                              <Text
                                style={{ color: theme.text, fontWeight: "500" }}
                              >
                                N{findUser?.playerNumber} {findUserLabel}
                              </Text>
                            </>
                          );
                        })()}
                      </View>
                    </View>
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
                      let result = findMostFrequentVictim(night.votes || []);
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

                      const currentNightBase = data;

                      // Check if serial killer killed during the night
                      let deathPlayer = players.find(
                        (user: any) =>
                          user.userId ===
                          currentNightBase?.killedBySerialKiller?.playerId
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
                            currentNightBase?.safePlayer?.playerId
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

export default Nights;

const styles = StyleSheet.create({});

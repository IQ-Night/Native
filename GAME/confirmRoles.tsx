import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../components/button";
import { useAppContext } from "../context/app";
import { useGameContext } from "../context/game";
import NumberPicker from "../screens/screen-rooms/numberPicker";
import FlipCard from "../components/flipCard";
import roleImageGenerator from "../functions/roleImageGenerator";

const ConfirmRoles = ({
  setOpenConfirmRoles,
  setConfirmedRoles,
  confirmedRoles,
  roles,
  StartPlay,
  loadingStarting,
}: any) => {
  const { theme, haptics, activeLanguage, language } = useAppContext();
  const { activeRoom, gamePlayers } = useGameContext();

  const totalPlayersForStart = gamePlayers?.length;

  const [maxMafias, setMaxMafias] = useState(1);
  const [openOptions, setOpenOptions] = useState({ active: false });

  const [mafias, setMafias] = useState(false);
  const [selectedMaxMafias, setSelectedMaxMafias] = useState(1);
  const [citizens, setCitizens] = useState(false);
  const [doctor, setDoctor] = useState(false);
  const [police, setPolice] = useState(false);
  const [serialKiller, setSerialKiller] = useState(false);
  const [mafiaDon, setMafiaDon] = useState(false);

  useEffect(() => {
    if (gamePlayers) {
      let totalMafias = 6; // Default value

      // Convert maxPlayers to a number before comparing
      const maxPlayers = Number(totalPlayersForStart);

      // Check if maxPlayers is 4 or 5, then set totalMafias to 1
      if (maxPlayers === 4 || maxPlayers === 5) {
        totalMafias = 1; // Set totalMafias to 1 when maxPlayers is 4 or 5
      } else if (maxPlayers > 5 && maxPlayers < 9) {
        totalMafias = 2;
      } else if (maxPlayers === 9 || maxPlayers === 10) {
        totalMafias = 3;
      } else if (maxPlayers > 10 && maxPlayers < 14) {
        totalMafias = 4;
      } else if (maxPlayers === 14 || maxPlayers === 15) {
        totalMafias = 5;
      } else {
        totalMafias = 6;
      }

      if (mafiaDon && totalMafias > 0) {
        totalMafias = totalMafias - 1; // Set totalMafias to 1 when maxPlayers is 4 or 5
      }

      setMaxMafias(totalMafias);
      setSelectedMaxMafias(1);
    }
  }, [gamePlayers, mafias, mafiaDon]);
  // confirmed roles

  const DefineConfirmedRoles = () => {
    let rolesArr: any[] = [];

    // Add individual roles based on selections
    if (doctor) rolesArr.push({ value: "doctor" });
    if (police) rolesArr.push({ value: "police" });
    if (serialKiller) rolesArr.push({ value: "serial-killer" });

    // Add mafia roles
    if (mafias) {
      const mafiaRoles = Array.from({ length: selectedMaxMafias }, () => ({
        value: "mafia",
      }));

      rolesArr = [...rolesArr, ...mafiaRoles];
    }

    if (mafiaDon) {
      rolesArr.push({ value: "mafia-don" });
    }

    // Add citizen roles based on remaining player slots
    if (citizens) {
      const totalCitizens = totalPlayersForStart - rolesArr.length;
      const citizenRoles = Array.from({ length: totalCitizens }, () => ({
        value: "citizen",
      }));
      rolesArr = [...rolesArr, ...citizenRoles];
    }

    return rolesArr;
  };

  useEffect(() => {
    const defined = DefineConfirmedRoles();
    setConfirmedRoles(defined);
  }, [
    mafias,
    citizens,
    mafiaDon,
    serialKiller,
    doctor,
    police,
    selectedMaxMafias,
  ]);

  /**
   * Confirmation
   */
  const ConfirmRole = async (r: any) => {
    if (r.value === "mafia") {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      const isDon = confirmedRoles?.find((cr: any) => cr.value === "mafia-don");
      const isMafia = confirmedRoles?.filter((cr: any) => cr.value === "mafia");
      if (isMafia.length === 0 && isDon && !mafias) {
        setMafiaDon(false);
      }
      setMafias((prev: boolean) => !prev);

      if (
        confirmedRoles?.length === totalPlayersForStart &&
        !mafias &&
        !isDon
      ) {
        if (confirmedRoles?.find((cr: any) => cr.value === "citizen")) {
          // Find the index of the first "citizen" role
          const citizenIndex = confirmedRoles.findIndex(
            (cr: any) => cr.value === "citizen"
          );

          if (citizenIndex !== -1) {
            // Create a new array where the first "citizen" is replaced by "police"
            setConfirmedRoles((prev: any) => [
              ...prev.slice(0, citizenIndex), // Keep all items before the first "citizen"
              { value: "mafia" }, // Replace with "police"
              ...prev.slice(citizenIndex + 1), // Keep all items after the first "citizen"
            ]);
            if (
              confirmedRoles?.filter((cr: any) => cr.value === "citizen")
                .length === 1
            ) {
              setCitizens(false);
            }
          }
        } else {
          return; // Exit if no "citizen" role is found
        }
      }
    } else if (r.value === "citizen") {
      if (confirmedRoles?.length === totalPlayersForStart && !citizens) {
        return;
      }
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      setCitizens((prev: boolean) => !prev);
    } else if (r.value === "doctor") {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      if (confirmedRoles?.length === totalPlayersForStart && !doctor) {
        if (confirmedRoles?.find((cr: any) => cr.value === "citizen")) {
          // Find the index of the first "citizen" role
          const citizenIndex = confirmedRoles.findIndex(
            (cr: any) => cr.value === "citizen"
          );

          if (citizenIndex !== -1) {
            // Create a new array where the first "citizen" is replaced by "police"
            setConfirmedRoles((prev: any) => [
              ...prev.slice(0, citizenIndex), // Keep all items before the first "citizen"
              { value: "doctor" }, // Replace with "police"
              ...prev.slice(citizenIndex + 1), // Keep all items after the first "citizen"
            ]);
            if (
              confirmedRoles?.filter((cr: any) => cr.value === "citizen")
                .length === 1
            ) {
              setCitizens(false);
            }
          }
        } else {
          return; // Exit if no "citizen" role is found
        }
      }
      setDoctor((prev: boolean) => !prev);
    } else if (r.value === "police") {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      if (confirmedRoles?.length === totalPlayersForStart && !police) {
        if (confirmedRoles?.find((cr: any) => cr.value === "citizen")) {
          // Find the index of the first "citizen" role
          const citizenIndex = confirmedRoles.findIndex(
            (cr: any) => cr.value === "citizen"
          );

          if (citizenIndex !== -1) {
            // Create a new array where the first "citizen" is replaced by "police"
            setConfirmedRoles((prev: any) => [
              ...prev.slice(0, citizenIndex), // Keep all items before the first "citizen"
              { value: "police" }, // Replace with "police"
              ...prev.slice(citizenIndex + 1), // Keep all items after the first "citizen"
            ]);
            if (
              confirmedRoles?.filter((cr: any) => cr.value === "citizen")
                .length === 1
            ) {
              setCitizens(false);
            }
          }
        } else {
          return; // Exit if no "citizen" role is found
        }
      }
      setPolice((prev: boolean) => !prev);
    } else if (r.value === "serial-killer") {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      if (confirmedRoles?.length === totalPlayersForStart && !serialKiller) {
        if (confirmedRoles?.find((cr: any) => cr.value === "citizen")) {
          // Find the index of the first "citizen" role
          const citizenIndex = confirmedRoles.findIndex(
            (cr: any) => cr.value === "citizen"
          );

          if (citizenIndex !== -1) {
            // Create a new array where the first "citizen" is replaced by "police"
            setConfirmedRoles((prev: any) => [
              ...prev.slice(0, citizenIndex), // Keep all items before the first "citizen"
              { value: "serial-killer" }, // Replace with "police"
              ...prev.slice(citizenIndex + 1), // Keep all items after the first "citizen"
            ]);
            if (
              confirmedRoles?.filter((cr: any) => cr.value === "citizen")
                .length === 1
            ) {
              setCitizens(false);
            }
          }
        } else {
          return; // Exit if no "citizen" role is found
        }
      }
      setSerialKiller((prev: boolean) => !prev);
    } else if (r.value === "mafia-don") {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      setMafiaDon((prev: boolean) => !prev);

      if (
        confirmedRoles?.filter((cr: any) => cr.value === "mafia").length ===
          1 &&
        confirmedRoles?.filter((cr: any) => cr.value !== "mafia-don") &&
        !mafiaDon
      ) {
        setMafias(false);
      }
    }
  };

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        position: "absolute",
        zIndex: 80,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        gap: 48,
      }}
    >
      <Pressable
        style={{ position: "absolute", top: 56, right: 16, zIndex: 50 }}
        onPress={() => {
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
          setOpenConfirmRoles(null);
          setConfirmedRoles([]);
        }}
      >
        <MaterialCommunityIcons name="close" size={30} color={theme.active} />
      </Pressable>
      <View style={{ alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: 600, color: theme.text }}>
          {activeLanguage?.choice_roles}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: 600, color: theme.text }}>
          ({activeLanguage?.players}: {totalPlayersForStart})
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: "100%",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {activeRoom?.roles?.map((r: any, x: number) => {
          let disabled;
          if (r.value === "mafia" && !mafias) {
            disabled = true;
          } else if (r.value === "citizen" && !citizens) {
            disabled = true;
          } else if (r.value === "doctor" && !doctor) {
            disabled = true;
          } else if (r.value === "police" && !police) {
            disabled = true;
          } else if (r.value === "serial-killer" && !serialKiller) {
            disabled = true;
          } else if (r.value === "mafia-don" && !mafiaDon) {
            disabled = true;
          }

          const roleImage: any = roleImageGenerator({
            role: r,
            language,
          });

          return (
            <Pressable
              onPress={() => ConfirmRole(r)}
              key={x}
              style={{
                width: "44%",
                height: 160,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                borderWidth: 1.5,
                borderColor: !disabled ? theme.active : "#333",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: "60%",
                  height: 160,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <FlipCard
                  img={roleImage}
                  item={r}
                  sizes={{ width: "100%", height: 160, borderRadius: 16 }}
                  from="door-review"
                />
              </View>
              <View
                style={{
                  marginRight: "10%",
                  gap: 12,
                }}
              >
                {mafias && r.value === "mafia" && maxMafias > 1 && (
                  <Pressable
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      setOpenOptions({ active: true });
                    }}
                  >
                    <Text
                      style={{
                        color: theme.active,
                        fontWeight: 600,
                      }}
                    >
                      {selectedMaxMafias}{" "}
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => ConfirmRole(r)}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    padding: 6,
                    borderRadius: 50,
                  }}
                >
                  {!disabled ? (
                    <MaterialIcons name="done" size={24} color={theme.active} />
                  ) : (
                    <MaterialIcons name="done" size={24} color={theme.text} />
                  )}
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Button
        title={activeLanguage?.start_play}
        style={{
          width: "90%",
          backgroundColor: theme.active,
          color: "white",
        }}
        onPressFunction={StartPlay}
        disabled={confirmedRoles?.length !== totalPlayersForStart}
        loading={loadingStarting}
      />

      {openOptions?.active && (
        <NumberPicker
          title={activeLanguage?.total_mafias}
          min={1}
          max={maxMafias}
          step={1}
          selectedValue={selectedMaxMafias}
          setValue={(val: any) => {
            setOpenOptions({ active: false });
            setSelectedMaxMafias(val);
          }}
          setNumericPopup={setOpenOptions}
        />
      )}
    </BlurView>
  );
};

export default ConfirmRoles;

const styles = StyleSheet.create({});

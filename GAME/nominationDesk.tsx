import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useGameContext } from "../context/game";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/app";

const NominationDesk = ({ dailyVotes }: any) => {
  const { gamePlayers } = useGameContext();
  const { theme } = useAppContext();
  return (
    <View
      style={{
        position: "absolute",
        right: 0,
        top: 48,
        zIndex: 90,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
        borderRadius: 10,
        padding: 10,
        width: 100,
      }}
    >
      {dailyVotes?.map((vote: any, index: number) => {
        const victim = gamePlayers.find(
          (player: any) => player.userId === vote.victim
        );
        const killer = gamePlayers.find(
          (player: any) => player.userId === vote.killer
        );
        return (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: 5,
            }}
          >
            <Text style={{ color: theme.active, fontWeight: 600 }}>
              N{killer?.playerNumber}
            </Text>
            <MaterialIcons name="arrow-right" size={24} color={theme.active} />
            <Text style={{ color: theme.text, fontWeight: 600 }}>
              N{victim?.playerNumber}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default NominationDesk;

const styles = StyleSheet.create({});

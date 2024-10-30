import { StyleSheet, Text, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { BlurView } from "expo-blur";
import { useAppContext } from "../context/app";
import {
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useGameContext } from "../context/game";
import Img from "../components/image";
import LottieView from "lottie-react-native";

const AttentionWindow = ({ attention, data }: any) => {
  const { theme } = useAppContext();
  const { gamePlayers } = useGameContext();

  // Define the attention context
  let content;
  if (attention?.value?.includes("day")) {
    content = (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Fontisto name="day-sunny" size={24} color={theme.active} />
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: 500 }}>
          {attention.value}
        </Text>
      </View>
    );
  } else if (attention?.value?.includes("night")) {
    content = (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Fontisto name="night-clear" size={24} color={theme.active} />
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: 500 }}>
          {attention.value}
        </Text>
      </View>
    );
  } else if (attention?.value?.includes("common")) {
    content = (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MaterialCommunityIcons
          name="account-voice"
          size={24}
          color={theme.active}
        />
        <Text
          style={{
            color: theme.text,
            fontSize: 24,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {attention.value}
        </Text>
      </View>
    );
  } else if (attention?.value?.includes("Candidates")) {
    content = (
      <View style={{ alignItems: "center", justifyContent: "center", gap: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <FontAwesome5 name="vote-yea" size={24} color={theme.active} />
          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {attention.value}
          </Text>
        </View>
        <View style={{ gap: 8 }}>
          {data?.nominantes
            ?.map((nom: any) => {
              // Find the corresponding player for each nominee
              const player = gamePlayers?.find(
                (pl: any) => pl.userId === nom.victim
              );
              return {
                ...nom,
                player, // Include the player object in the mapped data
              };
            })
            ?.sort(
              (a: any, b: any) =>
                (a.player?.playerNumber || 0) - (b.player?.playerNumber || 0)
            ) // Sort based on playerNumber
            ?.map((nom: any, index: number) => {
              const player = nom.player;
              return (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 50,
                      overflow: "hidden",
                    }}
                  >
                    <Img uri={player?.userCover} />
                  </View>
                  <Text style={{ color: theme.active, fontWeight: 500 }}>
                    N{player?.playerNumber}
                  </Text>
                </View>
              );
            })}
        </View>
      </View>
    );
  } else if (attention?.value?.includes("Game over")) {
    content = (
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LottieView
          source={require("../assets/animation.json")}
          autoPlay
          loop
          style={{ position: "absolute", width: "100%", height: "100%" }}
        />
        <View
          style={{ alignItems: "center", justifyContent: "center", gap: 16 }}
        >
          <FontAwesome6 name="trophy" size={32} color={theme.active} />
          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {attention.value}
          </Text>
        </View>
      </View>
    );
  } else if (
    attention?.value?.includes("Starting Last speech") ||
    attention?.value?.includes("Starting Night")
  ) {
    content = (
      <View style={{ alignItems: "center", justifyContent: "center", gap: 20 }}>
        <MaterialIcons name="close" color="red" size={40} />
        <Text
          style={{
            color: theme.text,
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {attention.value}
        </Text>
      </View>
    );
  } else if (attention?.value?.includes("Room closed")) {
    content = (
      <View style={{ alignItems: "center", justifyContent: "center", gap: 18 }}>
        <MaterialIcons name="close" color={theme.active} size={40} />
        <Text
          style={{
            color: theme.text,
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {attention.value} by Host!
        </Text>
      </View>
    );
  } else if (attention?.value?.includes("Voting Draw")) {
    content = (
      <View style={{ alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Text
          style={{
            color: theme.text,
            fontSize: 16,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          Votes are draw - No player has left!
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MaterialCommunityIcons
            name="account-voice"
            size={24}
            color={theme.active}
          />
          <Text
            style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Starts speechs again!
          </Text>
        </View>
      </View>
    );
  } else if (attention?.value?.includes("Starting Voting")) {
    content = (
      <View style={{ alignItems: "center", justifyContent: "center", gap: 24 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
          Voting Again!
        </Text>
        <View style={{ gap: 8 }}>
          {attention?.players
            ?.sort((a: any, b: any) => a.playerNumber - b.playerNumber)
            ?.map((nom: any, index: number) => {
              return (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 50,
                      overflow: "hidden",
                    }}
                  >
                    <Img uri={nom?.userCover} />
                  </View>
                  <Text style={{ color: theme.active, fontWeight: 500 }}>
                    N{nom?.playerNumber}
                  </Text>
                </View>
              );
            })}
        </View>
      </View>
    );
  }

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: 80,
        top: 0,
        left: 0,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
      }}
    >
      {content}
    </BlurView>
  );
};

export default AttentionWindow;

const styles = StyleSheet.create({});

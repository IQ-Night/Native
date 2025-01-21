import {
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import { StyleSheet, Text, View } from "react-native";
import Img from "../components/image";
import { useAppContext } from "../context/app";
import { useGameContext } from "../context/game";
import { useEffect, useState } from "react";

const AttentionWindow = ({ attention, data }: any) => {
  const { theme, activeLanguage } = useAppContext();
  const { gamePlayers } = useGameContext();

  const [timer, setTimer] = useState(5); // საწყისი დრო წამებში

  useEffect(() => {
    if (attention?.timer) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval); // გაჩერება
            return 0;
          }
          return prev - 1; // ყოველ წამს შემცირება
        });
      }, 1000);

      return () => clearInterval(interval); // გაწმენდა კომპონენტის დახურვისას
    }
  }, []);

  // Define the attention context
  let content;
  if (attention?.value?.includes("day")) {
    content = (
      <View style={{ alignItems: "center", gap: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Fontisto name="day-sunny" size={24} color={theme.active} />
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: 500 }}>
            {activeLanguage.start_of_the_day}
          </Text>
        </View>
        {attention?.timer && (
          <View
            style={{
              minWidth: 64,
              height: 24,
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 50,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                minWidth: 64,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",

                paddingHorizontal: 10,
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
                {timer + activeLanguage?.sec}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  } else if (attention?.value?.includes("night")) {
    content = (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Fontisto name="night-clear" size={24} color={theme.active} />
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: 500 }}>
          {activeLanguage.start_of_the_night}
        </Text>
      </View>
    );
  } else if (
    attention?.value?.includes("common") &&
    attention?.value !== "No player left the game - common timer start"
  ) {
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
          {activeLanguage.common_time}
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
            {activeLanguage.candidates_to_vote}
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
            {activeLanguage.game_over_winners} {attention?.value?.split("-")[2]}
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
  } else if (attention?.value?.includes("current game finished by admin")) {
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
          {activeLanguage.current_game_finished_by_admin}
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
          {attention?.value?.includes("host")
            ? activeLanguage.room_closed_by_host
            : activeLanguage.room_closed_by_admin}
        </Text>
      </View>
    );
  } else if (attention?.value?.includes("player saved")) {
    content = (
      <View style={{ alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Text
          style={{
            color: theme.text,
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {activeLanguage?.player_saved}
        </Text>
        <Text
          style={{
            color: theme.text,
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {activeLanguage?.common_time}
        </Text>
      </View>
    );
  } else if (
    attention?.value === "No player left the game - common timer start"
  ) {
    content = (
      <View style={{ alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Text
          style={{
            color: theme.text,
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {activeLanguage?.no_players_left_game}
        </Text>
        <Text
          style={{
            color: theme.text,
            fontSize: 18,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {activeLanguage?.common_time}
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
          {activeLanguage?.votes_are_draw}
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
            {activeLanguage?.starts_speechs_again}
          </Text>
        </View>
      </View>
    );
  } else if (attention?.value?.includes("Starting Voting")) {
    content = (
      <View style={{ alignItems: "center", justifyContent: "center", gap: 24 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
          {activeLanguage?.voting_again}
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

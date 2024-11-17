import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import Chair from "./chair";
import { ActivityIndicator } from "react-native-paper";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Table = ({
  game,
  activePlayerToSpeech,
  dayNumber,
  days,
  speechTimer,
  nights,
  nightNumber,
  loadingPlayer,
  loadingReJoin,
  setOpenUser,
  timeController,
}: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Game context
   */
  const { gamePlayers, activeRoom, loadingSpectate } = useGameContext();

  let gamePlayersSorted = gamePlayers?.sort(
    (a: any, b: any) => a.playerNumber - b.playerNumber
  );

  /**
   * Vote to safe by doctor
   */
  const [safePlayer, setSafePlayer] = useState(false);

  // findnight of sherif (this is for when don press to find sherif to disable button in the same night)
  const [findNight, setFindNight] = useState(null);

  /**
   * Find sherif by don
   */
  const [sherifPlayer, setSherifPlayer] = useState(null);

  // founded mafias
  const [foundedMafias, setFoundedMafias] = useState([]);

  useEffect(() => {
    if (activeRoom?.reJoin) {
      const currentUserRole = activeRoom?.lastGame?.players.find(
        (player: any) => player.userId === currentUser._id
      );

      if (currentUserRole?.role?.value === "mafia-don") {
        if (
          activeRoom?.lastGame?.nights?.some((n: any) =>
            n?.findSherif?.findResult?.includes("Yes")
          )
        ) {
          setSherifPlayer(
            activeRoom?.lastGame?.players?.find(
              (p: any) => p.role.value === "police"
            )
          );
        }
      }
      if (currentUserRole?.role?.value === "police") {
        const foundedNights = activeRoom?.lastGame?.nights?.filter((n: any) =>
          n?.findMafia?.findResult?.includes("Yes")
        );
        const mafias = foundedNights?.map((fn: any) => {
          return fn?.findMafia?.findUser;
        });
        setFoundedMafias(mafias);
      }
    }
  }, [activeRoom]);

  // serial killer kill
  const [killBySerialKiller, setKillBySerialKiller] = useState<any>(null);

  return (
    <View style={styles.container}>
      <View style={styles.tableAndList}>
        {loadingSpectate || loadingReJoin ? (
          <View
            style={{
              position: "absolute",
              left: 0,
              zIndex: 60,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              paddingHorizontal: "15%",
              gap: 16,
            }}
          >
            <ActivityIndicator size={24} color={theme.active} />
            <Text
              style={{
                color: theme.text,
                textAlign: "center",
                fontSize: 18,
                lineHeight: 24,
              }}
            >
              Please wait...
            </Text>
            {loadingSpectate && (
              <Text
                style={{
                  color: theme.text,
                  textAlign: "center",
                  fontSize: 16,
                  lineHeight: 24,
                  fontStyle: "italic",
                }}
              >
                When round will change, you will able to join room as a
                spectator.
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              {(() => {
                const chairs = [];
                const numChairs =
                  game.value === "Ready to start"
                    ? activeRoom.options.maxPlayers
                    : gamePlayersSorted.length;

                for (let i = 0; i < numChairs; i++) {
                  const item =
                    gamePlayersSorted && gamePlayersSorted[i]
                      ? gamePlayersSorted[i]
                      : null;
                  if (!item?.death) {
                    chairs.push(
                      <Chair
                        key={i}
                        item={item}
                        index={i}
                        row={1}
                        game={game}
                        activePlayerToSpeech={activePlayerToSpeech}
                        dayNumber={dayNumber}
                        days={days}
                        speechTimer={speechTimer}
                        nights={nights}
                        nightNumber={nightNumber}
                        loadingPlayer={loadingPlayer}
                        safePlayer={safePlayer}
                        setSafePlayer={setSafePlayer}
                        setOpenUser={setOpenUser}
                        sherifPlayer={sherifPlayer}
                        setSherifPlayer={setSherifPlayer}
                        findNight={findNight}
                        setFindNight={setFindNight}
                        foundedMafias={foundedMafias}
                        setFoundedMafias={setFoundedMafias}
                        killBySerialKiller={killBySerialKiller}
                        setKillBySerialKiller={setKillBySerialKiller}
                        timeController={timeController}
                      />
                    );
                  }
                }

                return chairs;
              })()}
            </View>
          </View>
        )}
        <View style={styles.table}>
          <BlurView
            intensity={30}
            tint="dark"
            style={{ padding: 8, flex: 1, width: "100%", alignItems: "center" }}
          >
            <View
              style={{
                borderRadius: 350,
                overflow: "hidden",
                flex: 1,
                width: "100%",
                position: "relative",
              }}
            >
              <ImageBackground
                source={require("../assets/background.jpg")}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                />
              </ImageBackground>
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
};

export default Table;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 45,
    elevation: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tableAndList: {
    width: "100%",
    // marginTop: SCREEN_HEIGHT * 0.05,
    alignItems: "center",
  },
  list: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  table: {
    borderRadius: 350,
    overflow: "hidden",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
  },
});

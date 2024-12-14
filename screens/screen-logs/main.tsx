import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { FormatDate } from "../../functions/formatDate";
import Days from "./days";
import Nights from "./nights";

const Logs = ({ route, item }: any) => {
  let room = route?.params.room;
  if (!room) {
    room = item;
  }

  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();

  const [loadLogs, setLoadLogs] = useState(true);
  const [logs, setLogs] = useState<any>([]);
  const [totalLogs, setTotalLogs] = useState<any>(null);
  const [page, setPage] = useState(1);

  const GetLogs = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/rooms/" + room?._id + "/logs?page=1"
      );
      if (response.data.status === "success") {
        setTotalLogs(response.data.totalLogs);
        setLogs(response.data.data.logs);
        setPage(1);
        setLoadLogs(false);
      }
    } catch (error: any) {
      setLoadLogs(false);
      console.log(error.response.data.message);
    }
  };

  const AddHistory = async () => {
    const newPage = page + 1;
    setLoadLogs(true);

    if (!room?._id) {
      console.log("Room ID is not available.");
      setLoadLogs(false);
      return;
    }

    try {
      const { data } = await axios.get(
        `${apiUrl}/api/v1/rooms/${room._id}/logs?page=${newPage}`
      );

      if (data.status === "success") {
        const logsList = data.data.logs;

        setLogs((prevLogs: any) => {
          // Create a Set of existing log IDs for fast lookup
          const existingLogIds = new Set(
            prevLogs.map((log: any) => log.number)
          );

          // Filter new logs to include only those that are not already present
          const uniqueNewLogs = logsList.filter(
            (newLog: any) => !existingLogIds.has(newLog.number)
          );

          // Return the concatenated array of previous logs and unique new logs
          return [...prevLogs, ...uniqueNewLogs];
        });

        setPage(newPage);
      }
    } catch (error: any) {
      console.log(
        "Error fetching logs:",
        error?.response?.data?.message || error.message
      );
    } finally {
      setLoadLogs(false);
    }
  };

  useEffect(() => {
    if (room?._id) {
      GetLogs();
    }
  }, [room?._id]);

  /**
   * Active state
   */
  const [activeState, setActiveState] = useState<any>({ value: "games" });

  /**
   * select days or nights
   */
  const [selectPeriod, setSelectPeriod] = useState<any>(null);
  const [periodData, setPeriodData] = useState<any>(null);
  useEffect(() => {
    setSelectPeriod(null);
    setPeriodData(null);
  }, [activeState]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const GetData = async (value: any) => {
      try {
        setLoadingData(true);
        const response = await axios.get(
          apiUrl +
            "/api/v1/rooms/" +
            room?._id +
            "/periodData?game=" +
            activeState?.number +
            "&period=" +
            value
        );
        if (response.data.status === "success") {
          setPeriodData(response.data.data);
          setLoadingData(false);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
        setLoadingData(false);
      }
    };
    if (selectPeriod === "Nights") {
      GetData("Nights");
    } else if (selectPeriod === "Days") {
      GetData("Days");
    }
  }, [selectPeriod]);

  const defineUserRating = (ratings: any, userId: any) => {
    const userPointsMap = ratings?.reduce((acc: any, rating: any) => {
      if (rating?.userId && rating?.points) {
        // If the userId already exists, sum the points
        if (acc[rating.userId]) {
          acc[rating.userId] += rating.points;
        } else {
          // Otherwise, initialize with the current points
          acc[rating.userId] = rating.points;
        }
      }
      return acc;
    }, {});

    // Access the points for the given userId directly from the userPointsMap
    const playerPoints = userPointsMap ? userPointsMap[userId] : null;
    return playerPoints;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 350;
          if (isCloseToBottom) {
            if (totalLogs > logs?.length) {
              AddHistory();
            }
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.row}>
          <Animated.View
            style={{
              flexDirection: "row",
              width: "100%",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {logs?.map((item: any, index: number) => {
              if (item?.gameLevel.status === "Finished") {
                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      activeState?.number === item?.number
                        ? setActiveState(null)
                        : setActiveState(item);
                    }}
                  >
                    <View
                      style={[
                        styles.logItem,
                        {
                          backgroundColor:
                            activeState?.number === item?.number
                              ? "rgba(255,255,255,0.05)"
                              : "transparent",
                        },
                      ]}
                    >
                      <Text style={{ color: theme.text }}>
                        {activeLanguage?.game} N{item?.number}
                      </Text>
                      <Text style={{ color: theme.text }}>
                        {item?.createdAt && FormatDate(item?.createdAt, "date")}
                      </Text>
                      <View>
                        <MaterialIcons
                          name={
                            activeState?.number === item?.number
                              ? "arrow-drop-down"
                              : "arrow-drop-up"
                          }
                          size={24}
                          color={theme.active}
                        />
                      </View>
                    </View>
                    {activeState?.number === item?.number && (
                      <Animated.View
                        style={{
                          width: "100%",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: 8,
                          gap: 12,
                          padding: 16,
                          marginTop: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.active,
                            fontSize: 16,
                            fontWeight: 500,
                          }}
                        >
                          {activeLanguage?.game} N{activeState?.number}
                        </Text>
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {activeLanguage?.winner}:{" "}
                          <Text style={{ color: theme.active }}>
                            {activeState?.result?.winners === "Mafia"
                              ? activeLanguage?.mafia
                              : activeState?.result?.winners === "Citizens"
                              ? activeLanguage?.citizen
                              : activeState?.result?.winners === "Serial Killer"
                              ? activeLanguage?.serialKiller
                              : "No winners"}
                          </Text>
                        </Text>
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {activeLanguage?.finishedAt}:{" "}
                          {activeState?.gameLevel?.finishedAt &&
                            FormatDate(
                              activeState?.gameLevel?.finishedAt,
                              "date"
                            )}
                        </Text>
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {activeLanguage?.playersMore}:
                        </Text>
                        <View
                          style={{
                            gap: 12,
                            padding: 12,
                            borderRadius: 8,
                            backgroundColor: "rgba(255,255,255,0.05)",
                          }}
                        >
                          {activeState?.players?.map((p: any, x: number) => {
                            return (
                              <View
                                key={x}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <View
                                  style={{
                                    height: 24,
                                    width: 24,
                                    borderRadius: 50,
                                    overflow: "hidden",
                                  }}
                                >
                                  <Img uri={p.userCover} />
                                </View>
                                <Text
                                  style={{ color: theme.text, fontWeight: 500 }}
                                >
                                  N{p?.playerNumber} {p?.userName}
                                </Text>
                                <Text
                                  style={{
                                    color: theme.active,
                                    fontWeight: 500,
                                  }}
                                >
                                  {p?.role?.value === "mafia"
                                    ? activeLanguage?.mafia
                                    : p?.role?.value === "citizen"
                                    ? activeLanguage?.citizen
                                    : p?.role?.value === "doctor"
                                    ? activeLanguage?.doctor
                                    : p?.role?.value === "police"
                                    ? activeLanguage?.police
                                    : p?.role?.value === "serial-killer"
                                    ? activeLanguage?.serialKiller
                                    : activeLanguage?.mafiaDon}
                                </Text>
                                {(p?.role?.value.includes("mafia") &&
                                  item?.result?.winners === "Mafia") ||
                                (p?.role?.value !== "serial-killer" &&
                                  !p?.role?.value.includes("mafia") &&
                                  item?.result?.winners === "Citizens") ||
                                (p?.role?.value.includes("serial-killer") &&
                                  item?.result?.winners === "Serial Killer") ? (
                                  <MaterialCommunityIcons
                                    name="medal"
                                    size={16}
                                    color={theme.active}
                                  />
                                ) : null}
                                <View></View>
                                <Text
                                  style={{
                                    fontWeight: 500,
                                    color: theme.text,
                                    marginLeft: "auto",
                                  }}
                                >
                                  {defineUserRating(item?.rating, p?.userId) ||
                                    0}{" "}
                                  P.
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                        <View
                          style={{
                            width: "100%",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Pressable
                            onPress={
                              selectPeriod === "Days"
                                ? () => {
                                    if (haptics) {
                                      Haptics.impactAsync(
                                        Haptics.ImpactFeedbackStyle.Soft
                                      );
                                    }
                                    setSelectPeriod(null);
                                  }
                                : () => {
                                    if (haptics) {
                                      Haptics.impactAsync(
                                        Haptics.ImpactFeedbackStyle.Soft
                                      );
                                    }
                                    setSelectPeriod("Days");
                                  }
                            }
                            style={{
                              padding: 6,
                              paddingHorizontal: 16,
                              borderRadius: 50,
                              backgroundColor:
                                selectPeriod === "Days"
                                  ? theme.active
                                  : "rgba(255,255,255,0.05)",
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  selectPeriod === "Days"
                                    ? "white"
                                    : theme.text,
                                fontWeight: 500,
                              }}
                            >
                              {activeLanguage?.days}
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={
                              selectPeriod === "Nights"
                                ? () => {
                                    if (haptics) {
                                      Haptics.impactAsync(
                                        Haptics.ImpactFeedbackStyle.Soft
                                      );
                                    }
                                    setSelectPeriod(null);
                                  }
                                : () => {
                                    if (haptics) {
                                      Haptics.impactAsync(
                                        Haptics.ImpactFeedbackStyle.Soft
                                      );
                                    }
                                    setSelectPeriod("Nights");
                                  }
                            }
                            style={{
                              padding: 6,
                              paddingHorizontal: 16,
                              borderRadius: 50,
                              backgroundColor:
                                selectPeriod === "Nights"
                                  ? theme.active
                                  : "rgba(255,255,255,0.05)",
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  selectPeriod === "Nights"
                                    ? "white"
                                    : theme.text,
                                fontWeight: 500,
                              }}
                            >
                              {activeLanguage?.nights}
                            </Text>
                          </Pressable>
                        </View>
                        {loadingData ? (
                          <ActivityIndicator size={16} color={theme.active} />
                        ) : (
                          <View>
                            {selectPeriod === "Days" ? (
                              <Days data={periodData} players={item.players} />
                            ) : selectPeriod === "Nights" ? (
                              <Nights
                                data={periodData}
                                players={item.players}
                              />
                            ) : undefined}
                          </View>
                        )}
                      </Animated.View>
                    )}
                  </Pressable>
                );
              }
            })}

            <View style={{ width: "100%" }}>
              <Text style={styles.noLogsText}>
                {!loadLogs &&
                  (!totalLogs || totalLogs === 0) &&
                  activeLanguage?.not_found}
              </Text>
            </View>
            {loadLogs && (
              <View style={{ width: "100%", alignItems: "center" }}>
                <ActivityIndicator
                  size={24}
                  color={theme.active}
                  style={{ marginVertical: 8 }}
                />
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Logs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    zIndex: 20,
  },
  row: {
    width: "100%",
    paddingBottom: 24,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 4,
  },
  logItem: {
    width: "100%",
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "rgba(255,255,255,0.1)",
    borderBottomWidth: 1,
    padding: 8,
  },
  loader: {
    width: "100%",
    alignItems: "center",
    height: 300,
    justifyContent: "center",
  },
  noLogsText: {
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
    fontSize: 16,
    margin: 16,
  },
});

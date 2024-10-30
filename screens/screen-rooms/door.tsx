import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useGameContext } from "../../context/game";
import { FormatDate } from "../../functions/formatDate";
import axios from "axios";
import { useAuthContext } from "../../context/auth";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";
import { checkBanExpired } from "../../functions/checkBan";
import BanTimer from "../../components/banTimer";
import { useRoomsContext } from "../../context/rooms";

interface ItemType {
  _id: string;
  title: string;
  admin: any;
  roles: any;
  totalPlayers: number;
  maxTotalPlayers: number;
  members: any;
  roomNumber: number;
  cover: any;
  rating: number;
  founder: object;
  totalPlayedGames: number;
  price: number;
  config: ConfigType;
  createdAt: any;
  language: string;
  options: any;
  private: any;
  liveMembers: any;
  spectatorMode: boolean;
}

interface ConfigType {
  newbes: boolean;
  reveal: boolean;
  noNominations: boolean;
  speakerRotation: boolean;
  privateRoom: boolean;
  vipRoom: boolean;
  discussion: boolean;
  spectatorMode: boolean;
  lastWordCitizen: string;
  lastWordSlain: string;
  personalTime: number;
  rules: any;
}

interface DoorProps {
  item: any;
  setDoorReview: any;
  navigation: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Door: React.FC<DoorProps> = ({ item, setDoorReview, navigation }) => {
  /**
   * App context
   */
  const { theme, haptics, apiUrl } = useAppContext();
  /**
   * Game context
   */
  const { socket } = useGameContext();
  /**
   * Game context
   */
  const { setRooms } = useRoomsContext();
  /**
   * Auth context
   */
  const { currentUser, setCurrentUser } = useAuthContext();

  const [liveUsers, setLiveUsers] = useState<any[]>(item.liveMembers); // State to store users in the room

  const getRoomMembers = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/rooms/" + item?._id + "/members"
      );
      if (response.data.status === "success") {
        setLiveUsers(response.data.data.members);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    setLiveUsers(item.liveMembers);
  }, [item]);

  // game level
  const [gameLevel, setGameLevel] = useState<any>(null);

  useEffect(() => {
    // Fetch the number of live users in the room when the component loads
    if (!socket) return; // Ensure the socket is defined
    const handleUpdateRoomInfo = (response: any) => {
      if (response.roomId === item._id) {
        getRoomMembers();
        if (response?.gameLevel) {
          setGameLevel(response?.gameLevel);
        }
      }
    };

    // Set up the socket listener
    socket.on("updateRoomInfo", handleUpdateRoomInfo);

    // Clean up the socket listener on unmount or when socket changes
    return () => {
      socket.off("updateRoomInfo", handleUpdateRoomInfo);
    };
  }, [socket, item._id]);

  // defines room open or not
  const currentUserRating = DefineUserLevel({ user: currentUser });

  let roomIsOpen = { status: "close", reason: "empty" };
  if (
    item.admin.founder._id === currentUser?._id ||
    liveUsers?.some(
      (u: { userId: string }) => u.userId === item.admin.founder._id
    )
  ) {
    if (
      currentUser?.status?.type === "blocked in app" &&
      !checkBanExpired(currentUser?.status)
    ) {
      roomIsOpen = { status: "close", reason: "blocked in app" };
    } else if (currentUserRating?.current < item?.rating?.min) {
      roomIsOpen = { status: "close", reason: "rating" };
    } else {
      const expired = checkBanExpired(
        item?.blackList?.find(
          (i: { user: string }) => i?.user === currentUser?._id
        )
      );

      if (expired) {
        roomIsOpen = { status: "open", reason: "" };
      } else {
        roomIsOpen = { status: "close", reason: "ban" };
      }
    }
  }

  return (
    <View
      style={[
        styles.shadowContainer,
        {
          opacity: roomIsOpen.status === "open" ? 1 : 0.5,
        },
      ]}
    >
      <View style={styles.container}>
        <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
          <Pressable style={styles.pressableContainer}>
            <Img uri={item.cover} />
            <LinearGradient
              colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.3)"]}
              style={styles.wrapper}
            >
              {/** Content */}
              <View style={styles.contentContainer}>
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <View style={styles.flagContainer}>
                      <CountryFlag
                        isoCode={item.language}
                        size={16}
                        style={styles.flag}
                      />
                    </View>
                    <Text
                      style={styles.title}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item?.title}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    navigation.navigate("User", { item: item.admin.founder });
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                  }}
                  style={{ marginTop: 6, justifyContent: "center" }}
                >
                  <Text style={[styles.adminText, { color: theme.text }]}>
                    By: {item.admin.founder.name}
                  </Text>
                </TouchableOpacity>
                <View style={{ marginTop: 6, justifyContent: "center" }}>
                  <Text style={[styles.adminText, { color: theme.text }]}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={16}
                      color={theme.text}
                    />{" "}
                    {FormatDate(item.createdAt, "withTime")}
                  </Text>
                </View>
                <View style={{ marginTop: 6, justifyContent: "center" }}>
                  <Text style={[styles.adminText, { color: theme.text }]}>
                    <FontAwesome5 size={14} color={theme.text} name="users" />{" "}
                    {liveUsers?.filter((u: any) => u.type === "player")?.length}
                    /{item?.options.maxPlayers}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.adminText,
                    { color: theme.text, marginTop: 8 },
                  ]}
                >
                  Lvl: {item?.rating.min}
                </Text>
                {item.spectatorMode ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 6,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="eye"
                      size={18}
                      color={theme.text}
                    />
                  </View>
                ) : (
                  <MaterialCommunityIcons
                    name="eye-off"
                    size={18}
                    color={theme.text}
                    style={{ marginTop: 6 }}
                  />
                )}
                <View style={styles.joinButtonContainer}>
                  <Pressable
                    onPress={() => {
                      if (roomIsOpen?.status === "close") {
                        return;
                      }
                      if (roomIsOpen?.status === "open") {
                        setDoorReview({ ...item, liveMembers: liveUsers });
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                      }
                    }}
                    style={styles.joinButton}
                  >
                    {item.private.value && (
                      <MaterialCommunityIcons
                        size={18}
                        color={
                          roomIsOpen.status === "open" ? theme.active : "#888"
                        }
                        name="lock"
                      />
                    )}
                    {gameLevel?.status === "In Play" ? (
                      <Text style={styles.joinButtonText}>Playing now</Text>
                    ) : (
                      <Text
                        style={[
                          styles.joinButtonText,
                          {
                            color:
                              roomIsOpen?.status === "open"
                                ? theme.active
                                : "#888",
                            fontWeight: 600,
                          },
                        ]}
                      >
                        {roomIsOpen?.reason === "rating" && (
                          <Text>Level does't match</Text>
                        )}
                        {currentUser?.status?.type === "blocked in app" &&
                        !checkBanExpired(currentUser?.status) ? (
                          <Text style={{ color: "#888", fontSize: 14 }}>
                            Ban:{" "}
                            <BanTimer
                              duration={currentUser?.status?.totalHours}
                              createdAt={currentUser?.status?.createdAt}
                              afterExpire={() =>
                                setCurrentUser((prev: any) => ({
                                  ...prev,
                                  status: undefined,
                                }))
                              }
                            />
                          </Text>
                        ) : (
                          <>
                            {roomIsOpen?.reason === "ban" ? (
                              <Text style={{ color: "#888", fontSize: 14 }}>
                                Ban:{" "}
                                <BanTimer
                                  duration={
                                    item?.blackList?.find(
                                      (i: { user: string }) =>
                                        i?.user === currentUser?._id
                                    )?.totalHours
                                  }
                                  createdAt={
                                    item?.blackList?.find(
                                      (i: { user: string }) =>
                                        i?.user === currentUser?._id
                                    )?.createdAt
                                  }
                                  afterExpire={() =>
                                    setRooms((prev: any) =>
                                      prev.map((r: any) => {
                                        if (r._id === item?._id) {
                                          return {
                                            ...r,
                                            blackList: r.blackList.filter(
                                              (b: any) =>
                                                b.user !== currentUser?._id
                                            ),
                                          };
                                        } else {
                                          return r;
                                        }
                                      })
                                    )
                                  }
                                />
                              </Text>
                            ) : (
                              <Text>
                                {liveUsers?.find(
                                  (u: any) =>
                                    u.userId === item.admin.founder._id
                                )
                                  ? "Join"
                                  : item.admin.founder._id === currentUser._id
                                  ? "Open Room"
                                  : "Closed"}
                              </Text>
                            )}
                          </>
                        )}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </BlurView>
      </View>
    </View>
  );
};

export default Door;

const styles = StyleSheet.create({
  shadowContainer: {
    // Box shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    // Elevation for Android
    elevation: 6,
  },
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 8,
  },
  blurContainer: {},
  pressableContainer: {
    width: (SCREEN_WIDTH - 24) / 2,
    aspectRatio: 1,
    overflow: "hidden",
  },
  wrapper: {
    position: "absolute",
    height: "100%",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentContainer: {
    overflow: "hidden",
    flex: 1,
    width: "100%",
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flagContainer: {
    borderRadius: 2,
    overflow: "hidden",
  },
  flag: {
    color: "#fff",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    overflow: "hidden",
    width: "80%",
  },
  adminPressable: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  adminText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  details: {
    gap: 8,
    marginTop: 8,
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playersText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  joinButtonContainer: {
    alignItems: "center",
    gap: 8,
    marginTop: "auto",
  },
  joinButton: {
    width: "100%",
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 48,
    // Box shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    // Elevation for Android
    elevation: 6,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "orange",
  },
});

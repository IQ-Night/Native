import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
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
import { useAuthContext } from "../../context/auth";
import { useGameContext } from "../../context/game";
import { useRoomsContext } from "../../context/rooms";
import { checkBanExpired } from "../../functions/checkBan";
import { FormatDate } from "../../functions/formatDate";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";
import { JoinButtonText } from "./joinButton";

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
    item.admin.founder.id === currentUser?._id ||
    liveUsers?.some(
      (u: { userId: string }) => u.userId === item.admin.founder.id
    )
  ) {
    if (
      currentUser?.status?.type === "blocked in app" &&
      !checkBanExpired(currentUser?.status)
    ) {
      // if current user blocked in app
      roomIsOpen = { status: "close", reason: "blocked in app" };
    } else if (currentUserRating?.current < item?.rating?.min) {
      // if door rating is more than current user has
      roomIsOpen = { status: "close", reason: "rating" };
    } else if (item?.bannedUserInfo) {
      // if current user blocked in clan where admin is member
      const expired = checkBanExpired(item?.bannedUserInfo);
      if (expired) {
        roomIsOpen = { status: "open", reason: "" };
      } else {
        roomIsOpen = { status: "close", reason: "clan ban" };
      }
    } else {
      // if current user blocked in door
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
                    navigation.navigate("User", {
                      item: {
                        _id: item.admin.founder.id,
                        cover: item.admin.founder?.cover,
                      },
                    });
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
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 6,
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text style={[styles.adminText, { color: theme.text }]}>
                    <FontAwesome5 size={14} color={theme.text} name="users" />{" "}
                    {liveUsers?.filter((u: any) => u.type === "player")?.length}
                    /{item?.options.maxPlayers}
                  </Text>
                  {item.spectatorMode ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="eye"
                        size={16}
                        color={theme.text}
                      />
                    </View>
                  ) : (
                    <MaterialCommunityIcons
                      name="eye-off"
                      size={16}
                      color={theme.text}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.adminText,
                    { color: theme.text, marginTop: 8 },
                  ]}
                >
                  Lvl: {item?.rating.min}
                </Text>

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

                    <JoinButtonText
                      gameLevel={gameLevel}
                      roomIsOpen={roomIsOpen}
                      currentUser={currentUser}
                      theme={theme}
                      item={item}
                      liveUsers={liveUsers}
                      setCurrentUser={setCurrentUser}
                      setRooms={setRooms}
                    />
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

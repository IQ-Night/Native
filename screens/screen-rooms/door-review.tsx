import {
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Button from "../../components/button";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useGameContext } from "../../context/game";
import { useRoomsContext } from "../../context/rooms";
import { FormatDate } from "../../functions/formatDate";
import RoleInfo from "./create-room/roleInfo";
import EditRoom from "./edit-room";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DoorReview = ({ doorReview, setDoorReview, navigation }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  /**
   * Rooms context
   */
  const { setRooms } = useRoomsContext();

  /**
   * Game context
   */

  const { setActiveRoom, socket, setLoadingSpectate, activeRoom } =
    useGameContext();

  // pin code input state

  const [pinCodeInput, setDoorReviewInput] = useState("");

  const [liveUsers, setLiveUsers] = useState<any[]>([]); // State to store users in the room
  const [gameLevel, setGameLevel] = useState<any>(null);

  useEffect(() => {
    setLiveUsers(doorReview?.liveMembers);
    setGameLevel(doorReview?.lastGame?.gameLevel);
  }, [doorReview]);

  useEffect(() => {
    if (!socket) return; // Early return if socket is not defined

    const handleUpdateRoomInfo = (response: any) => {
      if (response.roomId === doorReview._id && response) {
        setLiveUsers(response.usersInRoom);
        if (response?.gameLevel) {
          setGameLevel(response?.gameLevel);
        }
        if (response?.usersInRoom?.length < 1) {
          setDoorReview(null);
        }
      }
    };

    // Set up the socket listener
    socket.on("updateRoomInfo", handleUpdateRoomInfo);

    // Clean up the socket listener on unmount or when socket changes
    return () => {
      socket.off("updateRoomInfo", handleUpdateRoomInfo);
    };
  }, [socket, doorReview._id]);

  /**
   * Open role info
   */
  const [openRoleInfo, setOpenRoleInfo] = useState({ value: null });

  /**
   * Delete room
   */
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const DeleteRoom = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        apiUrl + "/api/v1/rooms/" + doorReview._id
      );
      if (response.data.status === "success") {
        setRooms((prev: any) =>
          prev.filter((room: any) => room._id !== doorReview._id)
        );
        setDoorReview(null);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  // check if room not deleted
  const [loadingSpectator, setLoadingSpectator] = useState(false);
  const CheckRoom = async (type: any, connect: any) => {
    if (type === "spectator") {
      setLoadingSpectator(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await axios.get(
        apiUrl + "/api/v1/rooms/" + doorReview._id
      );
      if (response.data.status === "success") {
        if (connect) {
          setActiveRoom({ ...doorReview, reJoin: true });
        } else {
          setActiveRoom(doorReview);
        }
        // Join the room
        socket.emit(
          "joinRoom",
          doorReview._id,
          doorReview.roomName,
          currentUser._id,
          type
        );
      } else {
        setAlert({
          active: true,
          text: "The room is already deleted by Admin",
          type: "warning",
        });
        setRooms((prev: any) =>
          prev.filter((room: any) => room._id !== doorReview._id)
        );
        setDoorReview(null);
      }
      if (type === "spectator") {
        setLoadingSpectator(false);
        if (
          response.data.data.room.games[
            response.data.data.room.games.length - 1
          ].gameLevel?.status === "In play"
        ) {
          setLoadingSpectate(true);
        }
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Edit room
   */
  const [editRoom, setEditRoom] = useState(false);
  const translateYEditRoom = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    // Define the animation for opening and closing the room
    Animated.timing(translateYEditRoom, {
      toValue: editRoom ? 0 : SCREEN_HEIGHT, // 0 to open, SCREEN_HEIGHT to close
      duration: 300,
      easing: Easing.inOut(Easing.ease), // Smooth easing for in-out effect
      useNativeDriver: true, // For smoother and better performance
    }).start();
  }, [editRoom]);

  return (
    <>
      <Animated.View
        style={[
          styles.screen,
          {
            transform: [{ translateY: translateYEditRoom }],
          },
        ]}
      >
        <EditRoom
          editRoom={doorReview}
          setEditRoom={setEditRoom}
          setDoorReview={setDoorReview}
        />
      </Animated.View>
      <BlurView intensity={120} tint="dark" style={styles.container}>
        <KeyboardAvoidingView
          style={{ width: "100%", height: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View
            style={{
              height: "100%",
              width: "100%",
              justifyContent: "space-between",
              paddingBottom: 108,
            }}
          >
            <View style={styles.header}>
              <Text
                style={{
                  color: theme.text,
                  fontWeight: 600,
                  fontSize: 24,
                }}
              >
                Review
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                {doorReview.admin.founder._id === currentUser._id && (
                  <MaterialIcons
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      navigation.navigate("Logs", {
                        room: doorReview,
                      });
                    }}
                    name="format-list-bulleted"
                    style={{ position: "relative", top: 1 }}
                    size={26}
                    color={theme.text}
                  />
                )}
                <MaterialIcons
                  onPress={() => {
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                    setEditRoom(true);
                  }}
                  name="settings"
                  style={{ position: "relative", top: 1 }}
                  size={25}
                  color={theme.text}
                />

                {doorReview.admin.founder._id === currentUser._id && (
                  <MaterialCommunityIcons
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      setDeleteConfirm(true);
                    }}
                    name="delete"
                    style={{ position: "relative", top: 1 }}
                    size={26}
                    color="red"
                  />
                )}
                <FontAwesome
                  onPress={() => {
                    setDoorReview(null);
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                  }}
                  name="close"
                  color={theme.active}
                  size={32}
                />
              </View>
            </View>
            <View
              style={{
                flex: 1,
                width: "100%",
                padding: 16,
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  gap: 16,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    height: 80,
                    width: 80,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <Img uri={doorReview.cover} />
                </View>
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      color: theme.active,
                      fontWeight: 600,
                      fontSize: 24,
                    }}
                  >
                    {doorReview?.title}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      navigation.navigate("User", {
                        item: doorReview.admin.founder,
                      });
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Created by: {doorReview?.admin.founder.name}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    <MaterialCommunityIcons name="calendar" size={14} />{" "}
                    {FormatDate(doorReview.createdAt, "whithTime")}
                  </Text>
                </View>
              </View>
              <View style={styles.details}>
                <View style={styles.iconTextContainer}>
                  <FontAwesome5 size={16} color={theme.text} name="users" />
                  <Text style={styles.playersText}>
                    {liveUsers?.filter((u: any) => u.type === "player")?.length}
                    /{doorReview?.options.maxPlayers}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  color: theme.text,
                  fontWeight: 500,
                  fontSize: 14,
                  marginTop: 16,
                }}
              >
                Level: {doorReview?.rating.min}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  Draw in re-vote:
                </Text>
                <Text
                  style={{
                    color: theme.active,
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  {doorReview.drawInReVote}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: 500,
                    fontSize: 14,
                    marginTop: 8,
                  }}
                >
                  Spectators:
                </Text>
                {doorReview.spectatorMode ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="eye"
                      size={18}
                      color={theme.text}
                      style={{ marginLeft: 4 }}
                    />
                    <Text style={{ color: theme.text, marginLeft: 4 }}>
                      {
                        liveUsers?.filter((u: any) => u.type === "spectator")
                          .length
                      }
                    </Text>
                    <FontAwesome5 size={12} color={theme.text} name="users" />
                  </View>
                ) : (
                  <MaterialCommunityIcons
                    name="eye-off"
                    size={18}
                    color={theme.text}
                    style={{ marginTop: 8 }}
                  />
                )}
              </View>

              <View
                style={{
                  height: 1,
                  width: "100%",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  marginTop: 16,
                }}
              />
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,
                  fontWeight: 500,
                  marginVertical: 12,
                  marginLeft: 4,
                }}
              >
                Roles:
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {doorReview.roles.map((role: any, index: number) => {
                  return (
                    <View
                      key={index}
                      style={{
                        width: "22.2%",
                        height: 100,
                        backgroundColor: "#333",
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        borderWidth: 2,
                        borderColor: "gray",
                      }}
                    >
                      <FontAwesome6
                        onPress={() => setOpenRoleInfo(role)}
                        name="circle-info"
                        size={18}
                        color={theme.text}
                        style={{ position: "absolute", top: 8, right: 8 }}
                      />
                      <Text style={{ fontSize: 12, color: theme.text }}>
                        {role.label}{" "}
                        {role.value === "mafia"
                          ? "(" + doorReview.options.maxMafias + ")"
                          : role.value === "citizen"
                          ? "(" +
                            (doorReview.options.maxPlayers -
                              doorReview.options.maxMafias -
                              (doorReview.roles.length - 2)) +
                            ")"
                          : ""}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                gap: 8,
                marginTop: 12,
              }}
            >
              {doorReview.private.value && (
                <View style={{ alignItems: "center", gap: 8, width: "100%" }}>
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 18,
                        fontWeight: 500,
                      }}
                    >
                      Pin Code
                    </Text>
                    <View style={{ width: "100%" }}>
                      <TextInput
                        placeholder="Enter Pin Code"
                        placeholderTextColor={theme.text}
                        maxLength={8}
                        value={pinCodeInput}
                        onChangeText={setDoorReviewInput}
                        style={{
                          backgroundColor: "transparent",
                          color: theme.active,
                          borderColor: "rgba(255,255,255,0.1)",
                          borderWidth: 1.5,
                          height: 56,
                          borderRadius: 12,
                          paddingLeft: 16,
                        }}
                      />
                    </View>
                  </View>
                </View>
              )}
              {(gameLevel?.status !== "In Play" ||
                (gameLevel?.status === "In Play" &&
                  liveUsers?.filter((u: any) => u.type === "player").length !==
                    doorReview?.options.maxPlayers)) && (
                <Button
                  title={
                    doorReview?.spectatorMode &&
                    gameLevel?.status !== "In Play" &&
                    !liveUsers?.find((u: any) => u.userId === currentUser?._id)
                      ? "Join as a Player"
                      : doorReview?.spectatorMode &&
                        liveUsers?.some(
                          (u: any) => u.userId === currentUser?._id && !u?.death
                        )
                      ? "Return in Game"
                      : "Join"
                  }
                  style={{
                    backgroundColor: theme.active,
                    color: "white",
                    width: "100%",
                  }}
                  loading={loading}
                  onPressFunction={
                    (doorReview?.private.value &&
                      pinCodeInput === doorReview?.private.code) ||
                    !doorReview?.private.value
                      ? () => {
                          if (
                            gameLevel?.status === "In Play" &&
                            liveUsers?.some(
                              (u: any) =>
                                u.userId === currentUser?._id && !u?.death
                            )
                          ) {
                            CheckRoom("player", "reJoin");
                          } else {
                            CheckRoom("player", "");
                          }
                        }
                      : () => alert("Wrong Pin Code")
                  }
                />
              )}
              {doorReview?.spectatorMode && (
                <Button
                  title="Join as a Spectator"
                  style={{
                    backgroundColor: theme.text,
                    color: "white",
                    width: "100%",
                  }}
                  loading={loadingSpectator}
                  onPressFunction={
                    (doorReview?.private.value &&
                      pinCodeInput === doorReview?.private.code) ||
                    !doorReview?.private.value
                      ? () => {
                          CheckRoom("spectator", "");
                        }
                      : () => alert("Wrong Pin Code")
                  }
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
      {openRoleInfo.value && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            zIndex: 50,
            height: "100%",
            width: "100%",
            paddingTop: 120,
          }}
        >
          <FontAwesome
            name="close"
            size={34}
            color={theme.active}
            style={{ position: "absolute", top: 48, right: 16, zIndex: 60 }}
            onPress={() => {
              setOpenRoleInfo({ value: null });
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
            }}
          />

          <RoleInfo
            openRoleInfo={openRoleInfo}
            setOpenRoleInfo={setOpenRoleInfo}
          />
        </BlurView>
      )}
      {deleteConfirm && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            zIndex: 50,
            height: "100%",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <View style={{ paddingHorizontal: 24, gap: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 500,
                textAlign: "center",
                color: theme.text,
              }}
            >
              Are you sure to want to delete this room?
            </Text>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => setDeleteConfirm(false)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: "#888",
                  width: "48%",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                }}
              >
                <Text style={{ fontWeight: "bold", color: theme.text }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={DeleteRoom}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: theme.active,
                  width: "48%",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                }}
              >
                {loading ? (
                  <ActivityIndicator size={22} color="white" />
                ) : (
                  <Text style={{ fontWeight: "bold", color: "white" }}>
                    Confirm
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </BlurView>
      )}
    </>
  );
};

export default DoorReview;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
    alignItems: "center",
    top: 0,
    zIndex: 50,
    paddingTop: 40,
    paddingHorizontal: 8,
    gap: 8,
  },
  header: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  details: {
    gap: 8,
    marginLeft: 8,
    position: "absolute",
    top: 16,
    right: 16,
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playersText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 80,
    paddingBottom: 96,
  },
});

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
import BlackList from "./blackList";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DoorReview = ({ doorReview, setDoorReview, navigation }: any) => {
  /**
   * open component with anim
   */
  /**
   * Edit room
   */

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (doorReview) {
      // Define the animation for opening and closing the room
      Animated.timing(scaleAnim, {
        toValue: 1, // 0 to open, SCREEN_HEIGHT to close
        duration: 250,
        easing: Easing.inOut(Easing.ease), // Smooth easing for in-out effect
        useNativeDriver: true, // For smoother and better performance
      }).start();
    }
  }, [doorReview]);

  const closeReview = () => {
    // Define the animation for opening and closing the room
    Animated.timing(scaleAnim, {
      toValue: 0, // 0 to open, SCREEN_HEIGHT to close
      duration: 250,
      easing: Easing.inOut(Easing.ease), // Smooth easing for in-out effect
      useNativeDriver: true, // For smoother and better performance
    }).start(() => setDoorReview(null));
  };
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser, setCurrentUser } = useAuthContext();
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
        if (response?.usersInRoom) {
          setLiveUsers(response.usersInRoom);
          if (response?.usersInRoom?.length < 1) {
            closeReview();
          }
        }
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
  }, [socket, doorReview._id]);

  /**
   * Open role info
   */
  const [openRoleInfo, setOpenRoleInfo] = useState({ value: null });

  /**
   * Delete room
   */
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  // Animation for confirmation popup
  const slideAnim = useRef(new Animated.Value(300)).current; // Start off-screen

  const openDeleteConfirm = () => {
    setDeleteConfirm(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeDeleteConfirm = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setDeleteConfirm(false));
  };

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
        closeReview();
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
        // define if need to pay before open room
        let payid =
          doorReview?.admin.founder.id === currentUser?._id &&
          !currentUser?.vip?.active;

        // Join the room
        socket.emit(
          "joinRoom",
          doorReview._id,
          doorReview.roomName,
          currentUser._id,
          type,
          payid
        );
        if (payid) {
          setCurrentUser((prev: any) => ({
            ...prev,
            coins: { ...prev.coins, total: prev.coins.total - 2 },
          }));
        }
      } else {
        setAlert({
          active: true,
          text: "The room is already deleted by Admin",
          type: "warning",
        });
        setRooms((prev: any) =>
          prev.filter((room: any) => room._id !== doorReview._id)
        );
        closeReview();
      }
      if (type === "spectator") {
        setLoadingSpectator(false);
        if (
          response.data.data.room.games[
            response.data.data.room.games.length - 1
          ].gameLevel?.status === "In Play"
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

  // on join button

  const onPressFunction = () => {
    const isGameInPlay = gameLevel?.status === "In Play";
    if (
      doorReview?.admin?.founder?.id !== currentUser?._id &&
      !currentUser?.admin.active
    ) {
      const playerCountMismatch =
        liveUsers?.filter((u: any) => u.type === "player").length !==
        doorReview?.options.maxPlayers;

      if (!isGameInPlay || playerCountMismatch) {
        const isPrivateAndValidCode =
          (doorReview?.private.value &&
            pinCodeInput === doorReview?.private.code) ||
          !doorReview?.private.value;

        if (isPrivateAndValidCode) {
          if (
            isGameInPlay &&
            liveUsers?.some(
              (u: any) => u.userId === currentUser?._id && !u?.death
            )
          ) {
            CheckRoom("player", "reJoin");
          } else {
            CheckRoom("player", "");
          }
        } else {
          alert("Wrong Pin Code");
        }
      }
    } else {
      if (
        isGameInPlay &&
        liveUsers?.some((u: any) => u.userId === currentUser?._id && !u?.death)
      ) {
        CheckRoom("player", "reJoin");
      } else {
        CheckRoom("player", "");
      }
    }
  };

  /**
   * black list
   */
  const [openBlackList, setOpenBlackList] = useState(false);

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
          setDoorReview={closeReview}
        />
      </Animated.View>
      <BlurView intensity={120} tint="dark" style={styles.container}>
        <KeyboardAvoidingView
          style={{ width: "100%", height: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <Animated.View
            style={{
              height: "100%",
              width: "100%",
              justifyContent: "space-between",
              paddingBottom: 108,
              opacity: scaleAnim,
              transform: [{ scale: scaleAnim }],
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
                {(currentUser?._id === doorReview?.admin.founder.id ||
                  currentUser?.admin.active) && (
                  <MaterialIcons
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      setOpenBlackList(true);
                    }}
                    name="format-list-bulleted"
                    style={{ position: "relative", top: 1 }}
                    size={26}
                    color="red"
                  />
                )}

                {doorReview.admin.founder.id === currentUser._id && (
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
                )}

                {doorReview.admin.founder.id === currentUser._id && (
                  <MaterialCommunityIcons
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      openDeleteConfirm();
                    }}
                    name="delete"
                    style={{ position: "relative", top: 1 }}
                    size={26}
                    color="red"
                  />
                )}
                <FontAwesome
                  onPress={() => {
                    closeReview();
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
              {doorReview.private.value &&
                !currentUser?.admin.active &&
                doorReview?.admin?.founder?.id !== currentUser?._id && (
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

              <Button
                title={(() => {
                  if (currentUser?._id !== doorReview?.admin.founder.id) {
                    if (gameLevel?.status === "In Play") {
                      return "Playing now";
                    } else if (
                      gameLevel?.status !== "In Play" &&
                      liveUsers?.filter((u: any) => u.type === "player")
                        .length === doorReview?.options.maxPlayers
                    ) {
                      return "Room is full";
                    } else {
                      return "Join as a Player";
                    }
                  } else {
                    if (currentUser?.vip?.active) {
                      return <Text>Open Room</Text>;
                    } else {
                      return (
                        <Text>
                          Open Room 2{" "}
                          <FontAwesome5 name="coins" size={14} color="white" />
                        </Text>
                      );
                    }
                  }
                })()}
                style={{
                  backgroundColor: theme.active,
                  color: "white",
                  width: "100%",
                }}
                disabled={
                  gameLevel?.status === "In Play" ||
                  liveUsers?.filter((u: any) => u.type === "player").length ===
                    doorReview?.options.maxPlayers
                }
                loading={loading}
                onPressFunction={onPressFunction}
              />

              {doorReview?.spectatorMode &&
                doorReview?.admin.founder.id !== currentUser?._id && (
                  <Button
                    title="Join as a Spectator"
                    style={{
                      backgroundColor: theme.text,
                      color: "white",
                      width: "100%",
                    }}
                    loading={loadingSpectator}
                    onPressFunction={() => {
                      if (
                        doorReview?.admin?.founder?.id !== currentUser?._id &&
                        !currentUser?.admin.active
                      ) {
                        if (
                          (doorReview?.private.value &&
                            pinCodeInput === doorReview?.private.code) ||
                          !doorReview?.private.value
                        ) {
                          CheckRoom("spectator", "");
                        } else {
                          alert("Wrong Pin Code");
                        }
                      } else {
                        CheckRoom("spectator", "");
                      }
                    }}
                  />
                )}
            </View>
          </Animated.View>
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
          intensity={20}
          tint="dark"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            zIndex: 90,
          }}
        >
          <Pressable
            onPress={closeDeleteConfirm}
            style={{ width: "100%", height: "100%" }}
          >
            <Animated.View
              style={[
                styles.confirmPopup,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <BlurView intensity={120} tint="dark" style={styles.confirmBlur}>
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
                <View style={styles.confirmButtons}>
                  <Button
                    title="Cancel"
                    style={styles.cancelButton}
                    onPressFunction={closeDeleteConfirm}
                  />
                  <Button
                    loading={loading}
                    title="Remove"
                    style={styles.removeButton}
                    onPressFunction={DeleteRoom}
                  />
                </View>
              </BlurView>
            </Animated.View>
          </Pressable>
        </BlurView>
      )}
      {openBlackList && (
        <BlackList
          roomId={doorReview?._id}
          setOpenBlackList={setOpenBlackList}
        />
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
  confirmPopup: {
    height: 300,
    zIndex: 90,
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  confirmBlur: {
    width: "100%",
    height: 300,
    padding: 24,
    paddingTop: 48,
    gap: 32,
  },
  confirmText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  cancelButton: {
    width: "45%",
    backgroundColor: "#888",
    color: "white",
  },
  removeButton: {
    width: "45%",
    backgroundColor: "red",
    color: "white",
  },
});

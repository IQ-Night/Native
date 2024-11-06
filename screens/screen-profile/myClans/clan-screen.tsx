import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Img from "../../../components/image";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useGameContext } from "../../../context/game";
import { useProfileContext } from "../../../context/profile";
import { FormatDate } from "../../../functions/formatDate";
import EditTitle from "./popup-editTitle";
import Search from "./searchMember";
import { useNotificationsContext } from "../../../context/notifications";
import ManagementConfig from "./managementConfig";
import { DefineUserLevel } from "../../../functions/userLevelOptimizer";
import Avatars from "../../../components/avatars";
import BlackList from "./blackList";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Clan = ({ route, navigation }: any) => {
  const [item, setItem] = useState(route.params.item);

  useEffect(() => {
    setItem(route.params.item);
  }, [route.params.item]);

  /**
   * App context
   */
  const { apiUrl, theme, haptics } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  /**
   * Game context
   */
  const { socket } = useGameContext();

  /**
   * Profile context
   */
  const { clans, setClans, updateClanState, deleteConfirm, setDeleteConfirm } =
    useProfileContext();
  /**
   * Notifications context
   */
  const { setClansNotifications, SendNotification } = useNotificationsContext();

  /**
   * Management
   */
  const founder = item?.admin?.find((a: any) => a.role === "founder")?.user;
  const directors = item?.admin?.filter(
    (a: any) => a.role === "director"
  )?.user;
  const managers = item?.admin?.filter((a: any) => a.role === "manager")?.user;
  const wisers = item?.admin?.filter((a: any) => a.role === "wiser")?.user;
  const currentUserRole = item?.admin.find(
    (a: any) => a.user?._id === currentUser?._id
  )?.role;

  /**
   * Delete clan
   */
  const [loading, setLoading] = useState(false);
  const DeleteClan = async () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      setLoading(true);
      const response = await axios.delete(apiUrl + "/api/v1/clans/" + item._id);
      if (response.data.status === "success") {
        setClans((prev: any) =>
          prev.filter((clan: any) => clan._id !== item._id)
        );
        navigation.navigate("My Clans");
        setLoading(false);
        setDeleteConfirm(false);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Members
   */
  const [loadMembers, setLoadMembers] = useState(false);
  const [members, setMembers] = useState<any>([]);
  const [requests, setRequests] = useState<any>([]);
  const [pendings, setPendings] = useState<any>([]);

  const GetMembers = async ({ status }: any) => {
    setLoadMembers(true);
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/clans/" + item._id + "/members?status=" + status
      );
      if (response.data.status === "success") {
        setMembers(response.data.members);
        setRequests(response.data.requests);
        setPendings(response.data.pendings);
        setLoadMembers(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };
  useEffect(() => {
    if (item) {
      GetMembers({ status: "member" });
    }
  }, [item, clans]);

  /**
   * Add members
   */
  const [openSearch, setOpenSearch] = useState(false);
  const [search, setSearch] = useState("");

  /**
   * Search Animation
   */

  // Boolean to track input focus
  const [isFocused, setIsFocused] = useState(false);
  // Animated values
  const slideAnim = useRef(new Animated.Value(-100)).current; // Initial position off-screen
  const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0

  // Ref for the TextInput
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (openSearch) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        inputRef.current?.focus();
        setIsFocused(true);
      });
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [openSearch]);

  // players list
  const [loadPlayers, setLoadPlayers] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const GetPlayers = async () => {
      setLoadPlayers(true);
      try {
        const response = await axios.get(
          apiUrl +
            "/api/v1/players?currentUser=" +
            currentUser._id +
            "&clan=" +
            item.title +
            "&search=" +
            search +
            "&type="
        );
        if (response.data.status === "success") {
          setTimeout(() => {
            setPlayers(response.data.data.users);
            setLoadPlayers(false);
          }, 200);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    if (openSearch) {
      GetPlayers();
    }
  }, [openSearch, search, openSearch, item, clans]);

  /**
   * Send ask to join to user by admin
   */
  const [sendingLoading, setSendingLoading] = useState(null);

  const JoinClan = async ({ title, userId, status }: any) => {
    setSendingLoading(userId);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + title + "/join",
        { userId, status, joinDate: new Date() }
      );
      if (response.data.status === "success") {
        setSendingLoading(null);
        setPendings((prev: any) => [
          ...prev,
          { userId, status, joinDate: new Date().toISOString() },
        ]);
        socket.emit("notifications", { userId: userId });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Leave Clan
   */
  const [leavingLoading, setLeavingLoading] = useState<any>(false);
  const LeaveClan = async ({ userId }: any) => {
    setLeavingLoading(true);
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/leave",
        {
          userId,
        }
      );
      if (response.data.status === "success") {
        setLeavingLoading(false);
        setClans((prev: any) =>
          prev.filter((clan: any) => clan.title !== item.title)
        );
        navigation.navigate("My Clans");
        item?.admin?.map((a: any) => {
          return SendNotification({
            userId: a?.user?._id,
            type: "Left clan",
          });
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Active state of content
   */
  const [activeState, setActiveState] = useState("members");

  /**
   * current member clan status
   */
  const include = item.members.find((m: any) => m.userId === currentUser._id);

  /**
   * Delete Member
   */

  const DeleteMember = async () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      setLoading(true);
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/leave",
        {
          userId: deleteConfirm,
        }
      );
      if (response.data.status === "success") {
        setMembers((prev: any) =>
          prev.filter((mem: any) => mem.userId !== deleteConfirm)
        );
        setLoading(false);
        setDeleteConfirm(false);
        SendNotification({
          userId: deleteConfirm,
          type: "Admin has deleted you from clan",
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Cancel request
   */

  const CancelRequest = async ({ userId }: any) => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/leave",
        {
          userId,
        }
      );
      if (response.data.status === "success") {
        setRequests((prev: any) =>
          prev.filter((req: any) => req.userId !== userId)
        );
        setItem((prev: any) => ({
          ...prev,
          members: prev.members.filter((memb: any) => memb.userId !== userId),
        }));
        setClansNotifications((prev: any) =>
          prev.map((clan: any) => {
            if (clan._id === item._id) {
              // Return the updated clan with modified members
              return {
                ...clan,
                members: clan.members.filter(
                  (memb: any) => memb.userId !== userId
                ),
              };
            }
            return clan; // Return unmodified clans
          })
        );
        SendNotification({
          userId: userId,
          type: "Admin dont accept to join to clan " + "'" + item.title + "'",
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Confirm request
   */
  const ConfirmRequest = async ({ userId }: any) => {
    setSendingLoading(userId);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/join",
        { userId, status: "member", joinDate: new Date() }
      );
      if (response.data.status === "success") {
        const itm = requests.find((req: any) => req.userId === userId);
        setRequests((prev: any) =>
          prev.filter((req: any) => req.userId !== userId)
        );
        setItem((prev: any) => ({
          ...prev,
          members: prev.members.map((memb: any) => {
            if (memb.userId === userId) {
              return { ...memb, status: "member" };
            } else {
              return memb;
            }
          }),
        }));
        setMembers((prev: any) => [...prev, { ...itm, status: "member" }]);
        setClansNotifications((prev: any) =>
          prev.map((clan: any) => {
            if (clan._id === item._id) {
              // Return the updated clan with modified members
              return {
                ...clan,
                members: clan.members.map((memb: any) => {
                  if (memb.userId === userId) {
                    // Update the status to "member"
                    return { ...memb, status: "member" };
                  }
                  return memb; // Return unmodified members
                }),
              };
            }
            return clan; // Return unmodified clans
          })
        );
        SendNotification({
          userId: userId,
          type: "Admin confirmed to join to clan " + "'" + item.title + "'",
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * management configs
   */
  const [openConfig, setOpenConfig] = useState<any>(null);

  /**
   * Open popup
   */
  const [openPopup, setOpenPopup] = useState("");
  const [clanState, setClanState] = useState({ cover: item?.cover });

  useEffect(() => {
    const ChangeCover = async () => {
      try {
        const response = await axios.patch(
          apiUrl + "/api/v1/clans/" + item?._id,
          {
            cover: clanState?.cover,
          }
        );
        if (response?.data.status === "success") {
          setItem((prev: any) => ({ ...prev, cover: clanState?.cover }));
          setClans((prev: any) =>
            prev.map((clan: any) => {
              if (clan?._id === item?._id) {
                return { ...clan, cover: clanState?.cover };
              } else {
                return clan;
              }
            })
          );
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    if (clanState?.cover !== item?.cover) {
      ChangeCover();
    }
  }, [clanState]);

  return (
    <View style={{ height: "100%", width: "100%" }}>
      <View style={styles.container}>
        <Pressable
          onPress={
            currentUserRole === "founder"
              ? () => setOpenPopup("avatars")
              : undefined
          }
          style={{
            width: "25%",
            aspectRatio: 1,
            overflow: "hidden",
          }}
        >
          <Img uri={item.cover} />
        </Pressable>

        {/** Content */}

        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 12,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Founded At: {FormatDate(item.createdAt, "onlyDate")}
          </Text>
          {currentUser._id !== founder?._id && (
            <TouchableOpacity
              onPress={() => LeaveClan({ userId: currentUser._id })}
              activeOpacity={0.8}
              style={{
                width: "50%",
                height: 32,
                borderRadius: 50,
                backgroundColor: !include ? theme.active : "#888",
                alignItems: "center",
                padding: 4,
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.4)",
                justifyContent: "center",
              }}
            >
              {leavingLoading ? (
                <ActivityIndicator size={16} color="white" />
              ) : (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <MaterialIcons name="logout" size={16} color="white" />
                  <Text style={{ color: "white", fontWeight: "500" }}>
                    Leave Clan
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.1)",
          marginBottom: 8,
        }}
      />
      <View
        style={{
          width: "100%",
          paddingHorizontal: 12,
        }}
      >
        {currentUserRole === "founder" ||
        currentUserRole === "director" ||
        currentUserRole === "manager" ||
        currentUserRole === "wiser" ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => {
                setActiveState("members");
                setOpenSearch(false);
                GetMembers({ status: "member" });
              }}
              style={{
                padding: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  activeState === "members" ? theme.active : "#333",
              }}
            >
              <Text
                style={{
                  color: activeState === "members" ? "white" : theme.text,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <FontAwesome5
                  size={16}
                  color={activeState === "members" ? "white" : theme.text}
                  name="users"
                />
                {"  "}
                Members ({members?.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveState("requests");
                setOpenSearch(false);
                GetMembers({ status: "pending" });
              }}
              style={{
                padding: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  activeState === "requests" ? theme.active : "#333",
              }}
            >
              <Text
                style={{
                  color: activeState === "requests" ? "white" : theme.text,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Requests{" "}
                <Text
                  style={{
                    color:
                      requests?.length > 0 && activeState !== "requests"
                        ? theme.active
                        : requests?.length > 0 && activeState === "requests"
                        ? "white"
                        : requests?.length === 0 && activeState === "requests"
                        ? "white"
                        : theme.text,
                  }}
                >
                  ({requests?.length})
                </Text>
              </Text>
            </Pressable>

            <Pressable
              style={{
                padding: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  openSearch && activeState === "add" ? theme.active : "#333",
              }}
              onPress={() => {
                setOpenSearch(true);
                setSearch("");
                setActiveState("add");
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
            >
              <Text
                style={{
                  color:
                    openSearch && activeState === "add" ? "white" : theme.text,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Add Members
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setActiveState("blackList");
                setOpenSearch(false);
              }}
              style={{
                padding: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  activeState === "blackList" ? theme.active : "#333",
              }}
            >
              <Text
                style={{
                  color: activeState === "blackList" ? "white" : theme.text,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Black List
              </Text>
            </Pressable>
          </ScrollView>
        ) : (
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              fontWeight: 600,
              marginVertical: 4,
            }}
          >
            <FontAwesome5 size={16} color={theme.text} name="users" /> Members (
            {members?.length})
          </Text>
        )}
        {openSearch && activeState === "add" && (
          <View style={{ marginTop: 8 }}>
            <Search
              search={search}
              setSearch={setSearch}
              open={openSearch}
              setOpen={setOpenSearch}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              slideAnim={slideAnim}
              opacityAnim={opacityAnim}
              inputRef={inputRef}
            />
            <View
              style={{
                width: "100%",
                backgroundColor: "#222",
                height: 600,
                marginTop: 8,
                borderRadius: 8,
                padding: 8,
              }}
            >
              <ScrollView>
                <View style={[styles.row, { paddingTop: 0 }]}>
                  {loadPlayers && (
                    <ActivityIndicator size={24} color={theme.active} />
                  )}
                  {players?.length < 1 && !loadPlayers && (
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 500,
                        fontSize: 16,
                        margin: 16,
                      }}
                    >
                      No Players Found!
                    </Text>
                  )}
                  {!loadPlayers &&
                    players?.map((member: any, index: any) => {
                      if (member?._id === currentUser._id) {
                        return;
                      }

                      return (
                        <Pressable
                          onPress={() => {
                            navigation.navigate("User", { item: member });
                            if (haptics) {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Soft
                              );
                            }
                          }}
                          key={index}
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            padding: 8,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <View
                            style={{
                              width: 24,
                              aspectRatio: 1,
                              overflow: "hidden",
                              borderRadius: 150,
                            }}
                          >
                            <Img uri={member?.cover} />
                          </View>
                          <Text style={{ color: "white", fontWeight: 500 }}>
                            {member?.name}
                          </Text>

                          <Pressable
                            onPress={(e) => e.stopPropagation()}
                            style={{ marginLeft: "auto", marginRight: 8 }}
                          >
                            {sendingLoading === member?._id ? (
                              <ActivityIndicator
                                size={14}
                                color={theme.active}
                              />
                            ) : (
                              <Pressable
                                onPress={
                                  pendings.find(
                                    (player: any) =>
                                      player.userId === member?._id
                                  )
                                    ? (e) => {
                                        e.stopPropagation();
                                      }
                                    : (e) => {
                                        e.stopPropagation();
                                        JoinClan({
                                          title: item.title,
                                          userId: member?._id,
                                          status: "pending",
                                        });
                                      }
                                }
                                style={{ height: 24, justifyContent: "center" }}
                              >
                                <Text
                                  style={{
                                    color: pendings.find(
                                      (player: any) =>
                                        player.userId === member?._id
                                    )
                                      ? theme.text
                                      : theme.active,
                                    fontSize: 12,
                                    fontWeight: 600,
                                  }}
                                >
                                  {pendings.find(
                                    (player: any) =>
                                      player.userId === member?._id
                                  )
                                    ? "Pending"
                                    : "Invite"}
                                </Text>
                              </Pressable>
                            )}
                          </Pressable>
                        </Pressable>
                      );
                    })}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        <ScrollView>
          <View style={[styles.row]}>
            {loadMembers && (
              <ActivityIndicator size={24} color={theme.active} />
            )}
            {!loadMembers &&
              (activeState === "members" ? members : requests)?.map(
                (member: any, index: any) => {
                  var level = DefineUserLevel({ user: member });
                  return (
                    <View
                      key={index}
                      style={{
                        width: "100%",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        padding: 8,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: 12,
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          navigation.navigate("User", { item: member });
                          if (haptics) {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Soft
                            );
                          }
                        }}
                        style={{
                          width: 24,
                          aspectRatio: 1,
                          overflow: "hidden",
                          borderRadius: 150,
                        }}
                      >
                        <Img uri={member?.cover} />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          navigation.navigate("User", { item: member });
                          if (haptics) {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Soft
                            );
                          }
                        }}
                      >
                        <Text
                          style={{
                            color:
                              member?.userId === currentUser?._id
                                ? theme.active
                                : theme.text,
                            fontWeight: 500,
                          }}
                        >
                          {member?.userId === currentUser?._id
                            ? "You"
                            : member?.name}
                        </Text>
                      </Pressable>
                      <Text style={{ color: theme.active, fontWeight: "500" }}>
                        {(() => {
                          const role = item?.admin.find(
                            (m: any) => m.user._id === member?._id
                          )?.role;
                          return role
                            ? role.charAt(0).toUpperCase() + role.slice(1)
                            : ""; // Capitalize role if it exists
                        })()}
                      </Text>
                      <Text
                        style={{
                          color: theme.text,
                          fontWeight: 500,
                        }}
                      >
                        Lvl: {level?.current}
                      </Text>
                      <Text
                        style={{
                          color: theme.active,
                          fontWeight: 500,
                        }}
                      >
                        {member?.rating} P.
                      </Text>

                      {(currentUserRole === "founder" ||
                        currentUserRole === "director") &&
                        member?._id !== founder?._id &&
                        activeState === "members" &&
                        member?._id !== currentUser?._id && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              marginLeft: "auto",
                            }}
                          >
                            <Pressable
                              onPress={() => {
                                setOpenConfig(member);
                              }}
                            >
                              <MaterialIcons
                                name="edit"
                                size={18}
                                color={theme.active}
                              />
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                setDeleteConfirm(member?._id);
                              }}
                            >
                              <MaterialIcons
                                name="delete"
                                size={18}
                                color="red"
                              />
                            </Pressable>
                          </View>
                        )}
                      {member?._id !== founder?._id &&
                        activeState === "requests" &&
                        currentUserRole && (
                          <View
                            style={{
                              marginLeft: "auto",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Pressable
                              onPress={() => {
                                CancelRequest({ userId: member?._id });
                              }}
                              style={{ marginLeft: "auto" }}
                            >
                              <MaterialIcons
                                name="close"
                                size={20}
                                color="red"
                              />
                            </Pressable>
                            <Text
                              style={{ fontWeight: 600, color: theme.text }}
                            >
                              Join?
                            </Text>
                            <Pressable
                              onPress={() => {
                                ConfirmRequest({
                                  userId: member?._id,
                                });
                              }}
                              style={{ marginLeft: "auto" }}
                            >
                              <MaterialIcons
                                name="done"
                                size={20}
                                color="green"
                              />
                            </Pressable>
                          </View>
                        )}
                    </View>
                  );
                }
              )}
            {activeState === "blackList" && (
              <BlackList navigation={navigation} clan={item} />
            )}
          </View>
        </ScrollView>
      </View>
      {updateClanState === "Edit Title" && (
        <EditTitle navigation={navigation} item={item} setItem={setItem} />
      )}

      {deleteConfirm && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            position: "absolute",
            top: -50,
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
              {deleteConfirm === "clan"
                ? "Are you sure to want to delete this Clan?"
                : "Are you sure to want to delete this Member?"}
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
                onPress={() => {
                  setDeleteConfirm(false);
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: "#333",
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
                onPress={deleteConfirm === "clan" ? DeleteClan : DeleteMember}
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
      {openConfig && (
        <ManagementConfig
          clan={item}
          setOpenConfig={setOpenConfig}
          openConfig={openConfig}
          setItem={setItem}
        />
      )}

      {openPopup !== "" && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            zIndex: 50,
            height: "100%",
            width: "100%",
            paddingTop: 12,
          }}
        >
          <FontAwesome
            name="close"
            size={32}
            color={theme.active}
            style={{ position: "absolute", top: 12, right: 16, zIndex: 60 }}
            onPress={() => {
              setOpenPopup("");
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
            }}
          />
          {openPopup === "avatars" && (
            <Avatars
              state={clanState}
              setState={setClanState}
              type="clan-avatar"
            />
          )}
        </BlurView>
      )}
    </View>
  );
};

export default Clan;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: 10,
    gap: 6,
    minHeight: SCREEN_HEIGHT * 0.3,
  },
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 50,
    paddingBottom: 96,
  },
});

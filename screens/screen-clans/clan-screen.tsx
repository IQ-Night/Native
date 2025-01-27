import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Avatars from "../../components/avatars";
import DeleteConfirm from "../../components/deleteConfirm";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useClansContext } from "../../context/clans";
import { useContentContext } from "../../context/content";
import { useGameContext } from "../../context/game";
import { useNotificationsContext } from "../../context/notifications";
import { FormatDate } from "../../functions/formatDate";
import BlackList from "./blackList";
import ClanActionButton from "./clanActionButton";
import ManagementConfig from "./managementConfig";
import EditSlogan from "./popup-editSlogan";
import EditTitle from "./popup-editTitle";
import Search from "./searchMember";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Clan = ({ route, navigation }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert, activeLanguage } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser, setCurrentUser, GetUser } = useAuthContext();
  /**
   * Game context
   */
  const { socket, activeRoom } = useGameContext();
  /**
   * Content context
   */
  const { setConfirmAction } = useContentContext();

  /**
   * Notifications context
   */
  const { clansNotifications } = useNotificationsContext();

  const [item, setItem] = useState(route.params.item);
  useEffect(() => {
    setItem(route.params.item);
  }, [route.params.item, clansNotifications]);

  // update clan wiht live socket
  const updateClan = (data: any) => {
    setItem(data);
    navigation.setOptions(data);
    setClans((prev: any) =>
      prev?.map((pc: any) => {
        if (data?._id == pc?._id) {
          return data;
        } else {
          return pc;
        }
      })
    );
  };
  useEffect(() => {
    socket.on("updateClan", updateClan);
    return () => {
      socket.off("updateClan", updateClan);
    };
  }, [socket]);

  /**
   * Clans context
   */

  const {
    clans,
    setClans,
    updateClanState,
    setUpdateClanState,
    deleteConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    slideAnimDelete,
  } = useClansContext();

  /**
   * Notifications context
   */
  const { setClansNotifications, SendNotification } = useNotificationsContext();

  /**
   * Content context
   */
  const { setRerenderClans } = useContentContext();

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
    (a: any) => a.user?.id === currentUser?._id
  )?.role;

  // current user member status in this clan
  const userMemberStatus = item?.members?.find(
    (im: any) => im?.userId === currentUser?._id
  )?.status;
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
        setCurrentUser((prev: any) => ({
          ...prev,
          clan: undefined,
        }));
        setClans((prev: any) =>
          prev.filter((clan: any) => clan._id !== item._id)
        );
        navigation.navigate("Clans List");
        setLoading(false);
        closeDeleteConfirm();
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
  const [pendings, setOffers] = useState<any>([]);

  const GetMembers = async ({ status }: any) => {
    setLoadMembers(true);
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/clans/" + item._id + "/members?status=" + status
      );
      if (response.data.status === "success") {
        setMembers(response.data.members);
        setRequests(response.data.requests);
        setOffers(response.data.offers);
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
  const [players, setPlayers] = useState<any>(null);

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
  const [actionLoading, setActionLoading] = useState<any>(null);

  const JoinClan = async ({ title, userId, status }: any) => {
    const type = status === "offer" ? "ask" : "request";
    setActionLoading(userId);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + title + "/join?type=" + type,
        { userId, status, joinDate: new Date() }
      );
      if (response.data.status === "success") {
        const newClan = response?.data?.data?.clan;
        updateClan(newClan);
        setActionLoading(null);
        setOffers((prev: any) => [
          ...prev,
          { userId, status, joinDate: new Date().toISOString() },
        ]);

        if (userId !== currentUser?._id && status !== "offer") {
          return SendNotification({
            userId: userId,
            type: "joinRequest",
            title: item?.title,
            name: currentUser?.name,
          });
        }
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Leave Clan
   */
  const LeaveClan = async ({ userId, type }: any) => {
    setActionLoading(true);
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/leave?type=leaveClan",
        {
          userId,
        }
      );
      if (response.data.status === "success") {
        const updatedClan = response?.data?.data?.clan;
        setActionLoading(false);
        updateClan(updatedClan);

        item?.admin?.map((a: any) => {
          if (a?.user?.id !== currentUser?._id) {
            if (type !== "cancel request") {
              return SendNotification({
                userId: a?.user?.id,
                type: "leftClan",
                title: item?.title,
              });
            } else {
              if (a?.user?.id !== currentUser?._id) {
                return SendNotification({
                  userId: a?.user?.id,
                  type: "joinRequestDenied",
                });
              }
            }
          }
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
   * Delete Member
   */

  const DeleteMember = async () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      setLoading(true);
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/leave?type=deleteMember",
        {
          userId: deleteConfirm,
        }
      );
      if (response.data.status === "success") {
        setMembers((prev: any) =>
          prev.filter((mem: any) => mem.userId !== deleteConfirm)
        );
        setLoading(false);
        closeDeleteConfirm();
        SendNotification({
          userId: deleteConfirm,
          type: "removedFromClan",
          title: item?.title,
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
        apiUrl + "/api/v1/clans/" + item.title + "/leave?type=cancelRequest",
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
        SendNotification({
          userId: userId,
          type: "joinRequestDeclinedByAdmin",
          title: item?.title,
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
    setActionLoading(userId);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/join?type=confirm",
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

        SendNotification({
          userId: userId,
          type: "joinRequestApprovedByAdmin",
          title: item?.title,
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
  const [openPopup, setOpenPopup] = useState<any>(null);

  // open state
  const translateYState = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (openPopup) {
      Animated.timing(translateYState, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [openPopup]);

  const closeState = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    Animated.timing(translateYState, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Once the animation is complete, update the state
      setOpenPopup("");
    });
  };
  const [changeLoading, setChangeLoading] = useState(false);
  const ChangeCover = async (coverItem: any) => {
    const needToPay = item.price.cover < 1;
    if (needToPay) {
      setChangeLoading(true);
    }
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item?._id + "?type=cover&paid=" + needToPay,
        {
          cover: coverItem,
        }
      );
      if (response?.data.status === "success") {
        setItem((prev: any) => ({
          ...prev,
          cover: coverItem,
          price: needToPay ? { ...item.price, cover: 2000 } : item.price,
        }));
        GetUser();
        setClans((prev: any) =>
          prev?.map((p: any) => {
            if (p?._id === item?._id) {
              return {
                ...p,
                cover: coverItem,
                price: needToPay ? { ...item.price, cover: 2000 } : item.price,
              };
            } else {
              return p;
            }
          })
        );
        setChangeLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  const ActiveChat = async (chatValue: any) => {
    const needToPay = item.price.chat < 1;
    if (needToPay) {
      setChangeLoading(true);
    }
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item?._id + "?type=chat&paid=" + needToPay,
        {
          chat: chatValue,
        }
      );
      if (response?.data.status === "success") {
        setItem((prev: any) => ({
          ...prev,
          chat: chatValue,
          price: needToPay ? { ...item.price, chat: 1500 } : item.price,
        }));
        GetUser();
        setChangeLoading(false);
        setClans((prev: any) =>
          prev?.map((p: any) => {
            if (p?._id === item?._id) {
              return {
                ...p,
                chat: chatValue,
                price: needToPay ? { ...item.price, chat: 1500 } : item.price,
              };
            } else {
              return p;
            }
          })
        );
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  /** Upload Avatar */
  const [file, setFile] = useState<any>(null);

  return (
    <View style={{ height: "100%", width: "100%" }}>
      {changeLoading && (
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 90,
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator color="orange" size="small" />
        </BlurView>
      )}
      <View style={styles.container}>
        <Pressable
          onPress={() => {
            if (currentUserRole === "founder") {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }

              setOpenPopup("avatars");
            }
          }}
          style={{
            width: "25%",
            aspectRatio: 1,
            overflow: "hidden",
            borderRadius: 8,
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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {item?.slogan ? (
              <Text
                style={{
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: 500,
                  fontStyle: "italic",
                  maxWidth: "60%",
                }}
              >
                {item?.slogan}
              </Text>
            ) : item?.admin?.find((a: any) => a.role === "founder")?.user.id ===
              currentUser?._id ? (
              <Text
                style={{
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: 500,
                  fontStyle: "italic",
                  maxWidth: "60%",
                }}
              >{`${activeLanguage?.slogan}: `}</Text>
            ) : (
              ""
            )}

            {founder?.id === currentUser?._id && (
              <MaterialIcons
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setUpdateClanState("Edit Slogan");
                }}
                name="edit"
                size={20}
                color={theme.active}
              />
            )}
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {activeLanguage?.foundedAt}:{" "}
            {FormatDate(item.createdAt, "onlyDate")}
          </Text>
          {founder.id === currentUser?._id && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {activeLanguage?.chat}:
              </Text>
              {Platform.OS === "ios" ? (
                <Switch
                  trackColor={{ false: theme.background2, true: theme.active }}
                  value={item?.chat}
                  style={{
                    transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }],
                  }}
                  onValueChange={async () => {
                    const needToPay = item.price.chat < 1;
                    if (!item?.chat) {
                      if (needToPay) {
                        setConfirmAction({
                          active: true,
                          text: activeLanguage?.confirm_turn_chat,
                          Function: () => ActiveChat(true),
                          price: 1500,
                        });
                      } else {
                        ActiveChat(true);
                      }
                    } else {
                      ActiveChat(false);
                    }
                  }}
                />
              ) : (
                <Pressable
                  onPress={async () => {
                    setItem((prev: any) => ({ ...prev, chat: !prev.chat }));
                  }}
                >
                  <Text style={{ color: theme.active }}>
                    Turned {item?.chat ? "on" : "off"}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/**  clan actions button */}
          {founder.id !== currentUser?._id && (
            <ClanActionButton
              clans={clans}
              currentUser={currentUser}
              item={item}
              haptics={haptics}
              actionLoading={actionLoading}
              JoinClan={JoinClan}
              LeaveClan={LeaveClan}
              theme={theme}
              activeLanguage={activeLanguage}
              currentUserRole={currentUserRole}
              userMemberStatus={userMemberStatus}
            />
          )}

          {/* {!currentUserRole && !currentUser?.clans && (
            <TouchableOpacity
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                if (
                  userStatus?.value === "member" ||
                  userStatus?.value === "request"
                ) {
                  LeaveClan({ userId: currentUser?._id });
                } else if (userStatus?.value === "notMember") {
                  JoinClan({
                    title: item?.title,
                    userId: currentUser?._id,
                    status: "request",
                  });
                }
              }}
              activeOpacity={userStatus?.value === "pending" ? 1 : 0.8}
              style={{
                maxWidth: "70%",
                minWidth: "50%",
                height: 28,
                borderRadius: 50,
                backgroundColor:
                  userStatus === "request"
                    ? "#888"
                    : userStatus === "pending"
                    ? "#888"
                    : theme.active,
                alignItems: "center",
                padding: 4,
                borderWidth: userStatus?.value === "Ask by admin" ? 0 : 1.5,
                borderColor: "rgba(255,255,255,0.4)",
                justifyContent: "center",
              }}
            >
              {sendingLoading || leavingLoading ? (
                <ActivityIndicator size={16} color="white" />
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  {(() => {
                    if (userStatus?.value === "notMember") {
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <MaterialCommunityIcons
                            name="door-open"
                            size={18}
                            style={{ color: "white" }}
                          />
                          <Text style={{ color: "white", fontWeight: 500 }}>
                            {activeLanguage?.request_to_join}
                          </Text>
                        </View>
                      );
                    } else if (userStatus?.value === "pending") {
                      return (
                        <Text style={{ color: "white", fontWeight: 500 }}>
                          {activeLanguage?.pending}...
                        </Text>
                      );
                    } else if (userStatus?.value === "member") {
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <MaterialIcons
                            name="logout"
                            size={18}
                            style={{ color: "white" }}
                          />
                          <Text style={{ color: "white", fontWeight: 500 }}>
                            {activeLanguage?.leaveClan}
                          </Text>
                        </View>
                      );
                    }
                  })()}
                </View>
              )}
            </TouchableOpacity>
          )} */}
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
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setActiveState("members");
                setOpenSearch(false);
                GetMembers({ status: "member" });
                setPlayers(null);
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
                {activeLanguage?.members} ({members?.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setActiveState("requests");
                setOpenSearch(false);
                GetMembers({ status: "pending" });
                setPlayers(null);
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
                {activeLanguage?.requests}{" "}
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
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setOpenSearch(true);
                setSearch("");
                setActiveState("add");
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
                {activeLanguage?.add_members}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setActiveState("blackList");
                setOpenSearch(false);
                setPlayers(null);
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
                {activeLanguage?.blacklist}
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
            <FontAwesome5 size={16} color={theme.text} name="users" />{" "}
            {activeLanguage?.members} ({members?.length})
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
                  {!loadPlayers && players?.length < 1 && (
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 500,
                        fontSize: 16,
                        position: "absolute",
                        top: 64,
                      }}
                    >
                      {activeLanguage?.not_found}
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
                            {actionLoading === member?._id ? (
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
                                        if (haptics) {
                                          Haptics.impactAsync(
                                            Haptics.ImpactFeedbackStyle.Soft
                                          );
                                        }
                                        JoinClan({
                                          title: item.title,
                                          userId: member?._id,
                                          status: "offer",
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
                                    ? activeLanguage?.pending
                                    : activeLanguage?.invite}
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
            {activeState === "requests" && requests?.length < 1 && (
              <Text
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 500,
                  fontSize: 16,
                  position: "absolute",
                  top: 64,
                }}
              >
                {activeLanguage?.not_found}
              </Text>
            )}
            {activeState === "members" && members?.length < 1 && (
              <Text
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 500,
                  fontSize: 16,
                  position: "absolute",
                  top: 64,
                }}
              >
                {activeLanguage?.not_found}
              </Text>
            )}
            {!loadMembers &&
              (activeState === "members" || activeState === "requests") &&
              (activeState === "members" ? members : requests)?.map(
                (member: any, index: any) => {
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
                            ? activeLanguage?.you
                            : member?.name}
                        </Text>
                      </Pressable>
                      <Text style={{ color: theme.active, fontWeight: "500" }}>
                        {(() => {
                          const role = item?.admin.find(
                            (m: any) => m.user.id === member?._id
                          )?.role;
                          let roleLabel;
                          if (role === "founder") {
                            roleLabel = activeLanguage?.founder;
                          } else if (role === "director") {
                            roleLabel = activeLanguage?.director;
                          } else if (role === "manager") {
                            roleLabel = activeLanguage?.manager;
                          } else if (role === "wiser") {
                            roleLabel = activeLanguage?.wiser;
                          }
                          return roleLabel; // Capitalize role if it exists
                        })()}
                      </Text>

                      {(currentUserRole === "founder" ||
                        currentUserRole === "director") &&
                        member?._id !== founder?.id &&
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
                                if (haptics) {
                                  Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Soft
                                  );
                                }
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
                                if (haptics) {
                                  Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Soft
                                  );
                                }
                                openDeleteConfirm(member?._id);
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
                      {member?._id !== founder?.id &&
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
                                if (haptics) {
                                  Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Soft
                                  );
                                }
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
                              {activeLanguage?.join}?
                            </Text>
                            <Pressable
                              onPress={() => {
                                if (haptics) {
                                  Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Soft
                                  );
                                }
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
      {updateClanState === "Edit Slogan" && (
        <EditSlogan navigation={navigation} item={item} setItem={setItem} />
      )}

      {deleteConfirm && (
        <DeleteConfirm
          closeDeleteConfirm={closeDeleteConfirm}
          text={
            deleteConfirm === "clan"
              ? activeLanguage?.clan_delete_confirmation
              : activeLanguage?.user_delete_confirmation
          }
          Function={deleteConfirm === "clan" ? DeleteClan : DeleteMember}
          slideAnim={slideAnimDelete}
          loadingDelete={loading}
        />
      )}
      {openConfig && (
        <ManagementConfig
          clan={item}
          setOpenConfig={setOpenConfig}
          openConfig={openConfig}
          setItem={setItem}
        />
      )}
      {openPopup && (
        <BlurView intensity={120} tint="dark" style={styles.blurContainer}>
          <View style={styles.popupContainer}>
            <Animated.View
              style={{
                transform: [{ translateY: translateYState }],
                width: "100%",
                height: "100%",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => {
                  closeState();
                }}
              >
                <MaterialIcons
                  name="arrow-drop-down"
                  size={42}
                  color={theme.active}
                />
              </Pressable>

              {openPopup === "avatars" && (
                <Avatars
                  state={{ cover: item?.cover }}
                  onChange={ChangeCover}
                  type="clan-avatar"
                  file={file}
                  setFile={setFile}
                  item={item}
                />
              )}
            </Animated.View>
          </View>
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
    paddingBottom: 32,
    gap: 6,
    minHeight: SCREEN_HEIGHT * 0.3,
  },

  popupContainer: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  blurContainer: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: 10,
    paddingTop: 12,
  },
  blurContainer2: {
    position: "absolute",
    zIndex: 20,
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

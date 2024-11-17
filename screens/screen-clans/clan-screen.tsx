import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
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
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useClansContext } from "../../context/clans";
import { useGameContext } from "../../context/game";
import { FormatDate } from "../../functions/formatDate";
import { useContentContext } from "../../context/content";
import { useNotificationsContext } from "../../context/notifications";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";
import UserPopup from "./userPopup";
import Block from "../../admin/users/block-user";

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
   * Content context
   */
  const { setRerenderClans } = useContentContext();
  /**
   * Notification context
   */
  const { SendNotification } = useNotificationsContext();

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
   * Members
   */
  const [loadMembers, setLoadMembers] = useState(true);
  const [members, setMembers] = useState<any>([]);

  const GetMembers = async ({ status }: any) => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/clans/" + item._id + "/members?status=" + status
      );
      if (response.data.status === "success") {
        setMembers(response.data.members);
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
  }, [item]);

  /**
   * Request to join to user by admin
   */
  const [sendingLoading, setSendingLoading] = useState(false);

  const JoinClan = async () => {
    setSendingLoading(true);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/join",
        { userId: currentUser._id, status: "request", joinDate: new Date() }
      );
      if (response.data.status === "success") {
        setSendingLoading(false);

        setItem((prev: any) => ({
          ...prev,
          members: [
            ...prev.members,
            {
              userId: currentUser._id,
              status: "request",
              joinDate: new Date().toISOString(),
            },
          ],
        }));

        item?.admin.map((a: any) => {
          if (a?.user?.id !== currentUser?._id) {
            return socket.emit("notifications", { userId: a.user.id });
          }
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Confirm
   */
  const Confirm = async () => {
    setSendingLoading(true);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/join",
        { userId: currentUser._id, status: "member", joinDate: new Date() }
      );
      if (response.data.status === "success") {
        setSendingLoading(false);
        setMembers((prev: any) => [
          ...prev,
          {
            userId: currentUser._id,
            status: "member",
            joinDate: new Date().toISOString(),
          },
        ]);
        setItem((prev: any) => ({
          ...prev,
          members: [
            ...prev.members,
            {
              userId: currentUser._id,
              status: "member",
              joinDate: new Date().toISOString(),
            },
          ],
        }));

        item?.admin.map((a: any) => {
          if (a?.user?.id !== currentUser?._id) {
            return SendNotification({
              userId: a?.user?.id,
              type: `User ${currentUser?.name} has joined to clan ${item?.title}`,
            });
          }
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Leave Clan
   */

  const [leavingLoading, setLeavingLoading] = useState<any>(false);
  const LeaveClan = async () => {
    setLeavingLoading(true);
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/leave",
        {
          userId: currentUser._id,
        }
      );
      if (response.data.status === "success") {
        setLeavingLoading(false);

        setItem((prev: any) => ({
          ...prev,
          members: item.members.filter(
            (memb: any) => memb.userId !== currentUser._id
          ),
        }));
        setMembers((prev: any) =>
          prev.filter((memb: any) => memb.userId !== currentUser._id)
        );

        setRerenderClans(true);
        item?.admin.map((a: any) => {
          if (a?.user?._id !== currentUser?._id) {
            return SendNotification({
              userId: a.user.id,
              type: "Left clan",
            });
          }
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  /**
   * current member clan status
   */
  let userStatus: string | undefined;
  if (
    item.members.find(
      (m: any) => m.userId === currentUser._id && m.status === "member"
    )
  ) {
    userStatus = "member";
  } else if (
    item.members.find(
      (m: any) => m.userId === currentUser._id && m.status === "request"
    )
  ) {
    userStatus = "Pending";
  } else if (
    item.members.find(
      (m: any) => m.userId === currentUser._id && m.status === "pending"
    )
  ) {
    userStatus = "Ask by admin";
  } else {
    userStatus = "Request";
  }

  /**
   * open user
   */
  const [openUser, setOpenUser] = useState<any>(null);
  return (
    <View style={{ height: "100%", width: "100%" }}>
      <View style={styles.container}>
        <View
          style={{
            width: "25%",
            aspectRatio: 1,
            overflow: "hidden",
            borderRadius: 8,
          }}
        >
          <Img uri={item.cover} />
        </View>

        {/** Content */}

        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 18,
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
          {currentUserRole !== "founder" && userStatus !== "Ask by admin" && (
            <TouchableOpacity
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                if (userStatus === "member") {
                  LeaveClan();
                } else if (userStatus === "Request") {
                  JoinClan();
                }
              }}
              activeOpacity={userStatus === "Pending" ? 1 : 0.8}
              style={{
                width: "50%",
                height: 28,
                borderRadius: 50,
                backgroundColor:
                  userStatus === "Request"
                    ? theme.active
                    : userStatus === "Ask by admin"
                    ? "transparent"
                    : "#888",
                alignItems: "center",
                padding: 4,
                borderWidth: userStatus === "Ask by admin" ? 0 : 1.5,
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
                    if (userStatus === "Request") {
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
                            Request to Join
                          </Text>
                        </View>
                      );
                    } else if (userStatus === "Pending") {
                      return (
                        <Text style={{ color: "white", fontWeight: 500 }}>
                          Pending...
                        </Text>
                      );
                    } else if (userStatus === "member") {
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
                            Leave Clan
                          </Text>
                        </View>
                      );
                    }
                  })()}
                </View>
              )}
            </TouchableOpacity>
          )}
          {userStatus === "Ask by admin" && (
            <View style={{ gap: 8, width: "100%" }}>
              <Text style={{ fontWeight: 600, color: theme.text }}>
                You have invited to Join?
              </Text>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <Pressable
                  onPress={LeaveClan}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    width: 80,
                    alignItems: "center",
                    borderRadius: 50,
                  }}
                >
                  {leavingLoading ? (
                    <ActivityIndicator size={20} color="red" />
                  ) : (
                    <MaterialIcons name="close" size={20} color="red" />
                  )}
                </Pressable>

                <Pressable
                  onPress={Confirm}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    width: 80,
                    alignItems: "center",
                    borderRadius: 50,
                  }}
                >
                  {sendingLoading ? (
                    <ActivityIndicator size={20} color="green" />
                  ) : (
                    <MaterialIcons name="done" size={20} color="green" />
                  )}
                </Pressable>
              </View>
            </View>
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

      <View style={{ width: "100%", paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <FontAwesome5 size={16} color={theme.text} name="users" /> Members (
            {members.length})
          </Text>
        </View>

        <ScrollView>
          <View style={styles.row}>
            {loadMembers && (
              <ActivityIndicator size={24} color={theme.active} />
            )}
            {members?.map((member: any, index: any) => {
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
                    gap: 8,
                  }}
                >
                  <Pressable
                    onPress={() => setOpenUser(member)}
                    style={{
                      width: 24,
                      aspectRatio: 1,
                      overflow: "hidden",
                      borderRadius: 150,
                    }}
                  >
                    <Img uri={member.cover} />
                  </Pressable>
                  <Pressable onPress={() => setOpenUser(member)}>
                    <Text style={{ color: "white", fontWeight: 500 }}>
                      {member.name}
                    </Text>
                  </Pressable>
                  <Text style={{ color: theme.active, fontWeight: "500" }}>
                    {(() => {
                      const role = item?.admin.find(
                        (m: any) => m.user._id === member._id
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
                      marginLeft: "auto",
                    }}
                  >
                    {member.rating} P.
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
      {openUser && <UserPopup openUser={openUser} setOpenUser={setOpenUser} />}
    </View>
  );
};

export default Clan;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 8,
    padding: 16,
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

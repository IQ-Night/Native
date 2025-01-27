import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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
import { useProfileContext } from "../../context/profile";
import { useAuthContext } from "../../context/auth";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { useNotificationsContext } from "../../context/notifications";
import { Badge } from "react-native-elements";
import { useClansContext } from "../../context/clans";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ClanItem = ({ userClan, item, setUserScreen, navigation }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser, setCurrentUser } = useAuthContext();
  /**
   * Clan context
   */
  const { setClans } = useClansContext();
  /**
   * Notifications context
   */
  const { setClansNotifications, clansNotifications, SendNotification } =
    useNotificationsContext();

  /**
   * Management
   */

  const founder = item?.admin?.find((a: any) => a.role === "founder")?.user;

  const directors = item?.admin?.filter(
    (a: any) => a.role === "director"
  )?.user;
  const managers = item?.admin?.filter((a: any) => a.role === "manager")?.user;
  const wisers = item?.admin?.filter((a: any) => a.role === "wiser")?.user;
  const currentUserRole = item?.admin?.find(
    (a: any) => a.user.id === currentUser?._id
  );

  // defines current user status is pending
  const currentUserStatus = item?.members?.find(
    (memb: any) => memb.userId === currentUser._id
  )?.status;

  /**
   * Delete Member
   */
  const [loading, setLoading] = useState<any>(null);
  const DeclineInvite = async () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      setLoading("delete");
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/leave",
        {
          userId: currentUser._id,
        }
      );
      if (response.data.status === "success") {
        const updatedClan = response?.data?.data?.clan;
        setLoading(null);

        setClans((prev: any) =>
          prev?.map((pc: any) => {
            if (item?._id == pc?._id) {
              return updatedClan;
            } else {
              return pc;
            }
          })
        );
        setClansNotifications((prev: any) =>
          prev.filter((clan: any) => clan._id !== item._id)
        );
        item?.admin.map((a: any) => {
          if (a?.user?.id !== currentUser?._id) {
            return SendNotification({
              userId: a?.user?.id,
              type: "joinRequestDenied",
            });
          }
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const JoinClan = async () => {
    setLoading("join");
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item.title + "/join",
        { userId: currentUser._id, status: "member", joinDate: new Date() }
      );

      if (response.data.status === "success") {
        const newClan = response.data.data.clan;
        setClans((prev: any) => {
          return prev.map((clan: any) => {
            if (clan.title === newClan.title) {
              return newClan;
            }
            return clan; // Return the other clans unchanged
          });
        });

        setClansNotifications((prev: any) =>
          prev.filter((clan: any) => clan._id !== item._id)
        );
        setLoading(null);
        item?.admin?.map((a: any) => {
          if (a?.user?.id !== currentUser?._id) {
            return SendNotification({
              userId: a?.user?.id,
              type: "userJoinedClan",
              title: item?.title,
            });
          }
        });
      }
    } catch (error: any) {
      console.log(error);
      setLoading(null); // Ensure loading is stopped in case of error
    }
  };

  // admin requests total
  const adminClan = clansNotifications?.find((clan: any) =>
    clan.admin.some((a: any) => a.user.id === currentUser?._id)
  );
  const adminClansNotifs =
    adminClan?.members?.filter((m: any) => m?.status === "request")?.length ||
    0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate("Clan", { item: item });
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
      }}
      style={{
        width: "100%",
        // Box shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 2,
        borderWidth: 1,
        borderColor: "#222",
        borderRadius: 8,
      }}
    >
      <View style={styles.container}>
        <View
          style={{
            width: "25%",
            aspectRatio: 1,
            overflow: "hidden",
          }}
        >
          <Img uri={item?.cover} />
        </View>

        {/** Content */}
        <View
          style={{
            overflow: "hidden",
            flex: 1,
            height: "100%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              width: "100%",
              position: "relative",
            }}
          >
            <View
              style={{
                gap: 4,
                padding: 12,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  gap: 8,
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <View style={{ borderRadius: 2, overflow: "hidden" }}>
                  <CountryFlag
                    isoCode={item?.language}
                    size={12}
                    style={{
                      color: theme.text,
                    }}
                  />
                </View>
                <Text
                  style={{
                    width: "55%",
                    color: userClan ? theme.active : theme.text,
                    fontSize: 16,
                    fontWeight: 700,
                    overflow: "hidden",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item?.title}
                </Text>

                {currentUserRole && adminClansNotifs > 0 && (
                  <Badge
                    value={adminClansNotifs}
                    status="success"
                    badgeStyle={{ backgroundColor: theme.active }}
                    containerStyle={{}}
                  />
                )}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: "auto",
                    gap: 8,
                  }}
                >
                  {item?.chat && (
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      <MaterialCommunityIcons name="chat" size={18} />{" "}
                    </Text>
                  )}
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    <FontAwesome5 size={14} color={theme.text} name="users" />{" "}
                    {
                      item.members.filter(
                        (member: any) => member.status === "member"
                      ).length
                    }
                  </Text>
                </View>
              </View>
              {item?.slogan?.length > 0 && (
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: "500",
                    overflow: "hidden",
                    fontStyle: "italic",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item?.slogan}
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {activeLanguage?.founder}:{" "}
                  {founder?.id === currentUser?._id ? (
                    <Text style={{ color: theme.active }}>
                      {activeLanguage?.you}
                    </Text>
                  ) : (
                    founder?.name
                  )}
                </Text>
              </View>
              {currentUserStatus === "offer" && (
                <View
                  style={{
                    marginTop: "auto",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingTop: 8,
                  }}
                >
                  <Text style={{ color: theme.active, fontWeight: 700 }}>
                    Invite
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Pressable
                      onPress={DeclineInvite}
                      style={{
                        padding: 2,
                        paddingHorizontal: 8,
                        backgroundColor: "#888",
                        borderRadius: 4,
                        height: 22,
                        minWidth: 80,
                        alignItems: "center",
                      }}
                    >
                      {loading === "delete" ? (
                        <ActivityIndicator size={16} color="white" />
                      ) : (
                        <Text style={{ color: "white" }}>
                          {activeLanguage?.remove}
                        </Text>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={JoinClan}
                      style={{
                        padding: 2,
                        paddingHorizontal: 8,
                        backgroundColor: theme.active,
                        borderRadius: 4,
                        height: 22,
                        minWidth: 80,
                        alignItems: "center",
                      }}
                    >
                      {loading === "join" ? (
                        <ActivityIndicator size={16} color="white" />
                      ) : (
                        <Text style={{ color: "white" }}>
                          {activeLanguage?.confirm}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
              {currentUserStatus === "request" && (
                <View
                  style={{
                    marginTop: "auto",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    paddingTop: 8,
                  }}
                >
                  <Text style={{ color: theme.active, fontWeight: 700 }}>
                    Pending request
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Pressable
                      onPress={DeclineInvite}
                      style={{
                        padding: 2,
                        paddingHorizontal: 8,
                        backgroundColor: "#888",
                        borderRadius: 4,
                        height: 22,
                        minWidth: 80,
                        alignItems: "center",
                      }}
                    >
                      {loading === "delete" ? (
                        <ActivityIndicator size={16} color="white" />
                      ) : (
                        <Text style={{ color: "white" }}>
                          {activeLanguage?.cancel}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ClanItem;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
  },
});

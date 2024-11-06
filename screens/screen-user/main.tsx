import axios from "axios";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";
import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Warnings from "./warnings";
import SendWarnings from "../../admin/users/warnings";
import Block from "../../admin/users/block-user";
import Reports from "../../admin/users/reports";
import { warnings } from "../../context/content";
import { useNotificationsContext } from "../../context/notifications";
import { useGameContext } from "../../context/game";
import Ban from "../screen-clans/clan-ban";
import Actions from "./actions";
import * as Haptics from "expo-haptics";
import Statistics from "./statistics";

const User = ({ route, navigation, userItem, from }: any) => {
  let item: any = route?.params?.item || userItem;

  /**
   * App context
   */
  const { theme, apiUrl, haptics, setAlert } = useAppContext();

  /**
   * Notification context
   */
  const { SendNotification } = useNotificationsContext();

  // auth
  const { currentUser } = useAuthContext();
  // auth
  const { socket } = useGameContext();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<any>(true);

  /**
   * Actions
   */
  const [openActions, setOpenActions] = useState(false);

  /**
   * clan actions
   */
  // define if current user is clan admin where this user is member
  const [usersClans, setUsersClans] = useState<any>(null);

  const CheckClanInfo = async ({ adminId, memberId }: any) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/checkClanUsers?adminId=${adminId}&memberId=${memberId}`
      );
      if (response.data.status === "success") {
        setUsersClans(response.data.data.clans);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response?.data?.message || "An error occurred");
      setLoading(false);
    }
  };

  const UpdateUser = async () => {
    try {
      const response = await axios.get(apiUrl + "/api/v1/users/" + item?._id);
      if (response.data.status === "success") {
        setUser(response.data.data.user);
        CheckClanInfo({ adminId: currentUser?._id, memberId: item?._id });
      }
    } catch (error: any) {
      console.log(error.response.data);

      setLoading(false);
    }
  };

  /**
   * Define user level
   */
  let level = DefineUserLevel({ user });

  // blocks
  const [openBlock, setOpenBlock] = useState<any>(null);

  // reports
  const [openRepost, setOpenReport] = useState<any>(null);
  const [reportType, setReportType] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const SendReport = async () => {
    setReportLoading(true);
    try {
      const response = await axios.post(apiUrl + "/api/v1/reports", {
        createdAt: new Date(),
        sender: currentUser?._id,
        receiver: user?._id,
        reportType: reportType,
        status: "unread",
      });
      if (response?.data?.status === "success") {
        setReportType(null);
        setOpenReport(null);
        setReportLoading(false);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.message);
    }
  };

  // send warning
  const [warningLoading, setWarningLoading] = useState(false);
  const [openSendWarnings, setOpenSendWarnings] = useState<any>(null);
  const [warningType, setWarningType] = useState<any>(null);

  const SendWarning = async () => {
    try {
      setWarningLoading(true);
      const response = await axios.post(apiUrl + "/api/v1/admin/warnings", {
        user: user?._id,
        warning: warningType,
        createdAt: new Date(),
        sender: currentUser?._id,
      });
      if (response.data.status === "success") {
        socket.emit("rerenderAuthUser", { userId: user?._id });
        SendNotification({
          userId: user?._id,
          type: `You've got a warning by admin! Reason: ${
            warnings?.find((w: any) => w.value === warningType)?.en
          }`,
        });
        setTimeout(() => {
          setOpenSendWarnings(null);
          setAlert({
            active: true,
            type: "success",
            text: "Warning sent successfully!",
          });
        }, 300);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  /**
   * clan ban
   */
  const [openClanBan, setOpenClanBan] = useState(false);

  // sub list
  const [activeSection, setActiveSection] = useState("Clans");

  /**
   * Get user stats
   */
  const [statistics, setStatistics] = useState<any>(null);
  const GetStats = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/users/" + user?._id + "/statistics"
      );
      if (response.data.status === "success") {
        setStatistics(response?.data.data.statistics);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    if (user) {
      GetStats();
    }
  }, [user]);

  console.log(statistics);

  return (
    <>
      {loading && (
        <BlurView style={styles.loader} tint="dark" intensity={30}>
          <ActivityIndicator size={32} color={theme.active} />
        </BlurView>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, gap: 16 }}
        style={{
          flex: 1,
          width: "100%",
          marginTop: 12,
          paddingHorizontal: 12,
        }}
      >
        {openActions && (
          <Actions
            loading={loading}
            user={user}
            setOpenReport={setOpenReport}
            setOpenSendWarnings={setOpenSendWarnings}
            from={from}
            setOpenBlock={setOpenBlock}
            usersClans={usersClans}
            setOpenClanBan={setOpenClanBan}
          />
        )}
        <View
          style={{
            flexDirection: "row",
            gap: 16,
          }}
        >
          <View
            style={{
              width: "33%",
              aspectRatio: 1,
              overflow: "hidden",
              borderRadius: 8,
            }}
          >
            <Img uri={item?.cover || item?.userCover} onLoad={UpdateUser} />
          </View>
          <FontAwesome
            onPress={() => {
              setOpenActions((prev: boolean) => !prev);
              if (haptics)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }}
            style={{ position: "absolute", top: 8, right: 8 }}
            name={openActions ? "close" : "exclamation-triangle"}
            size={openActions ? 24 : 20}
            color={theme.active}
          />
          <View style={{ gap: 16 }}>
            {user?.admin?.active && (
              <Text
                style={{
                  color: theme.active,
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                {user?.admin?.role}
              </Text>
            )}
            <Text style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}>
              Lvl: {level?.current}
            </Text>
            <Text
              style={{
                color: theme.text,
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              <MaterialCommunityIcons
                name="diamond"
                size={14}
                color={theme.active}
              />{" "}
              {user?.rating}
            </Text>
          </View>
        </View>
        <View>
          <View style={{ gap: 12 }}>
            <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
              <Pressable
                onPress={() => {
                  if (haptics)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  setActiveSection("Clans");
                }}
                style={{
                  padding: 4,
                  backgroundColor:
                    activeSection === "Clans"
                      ? theme.active
                      : "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color: activeSection === "Clans" ? "white" : theme.text,
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                >
                  Clans
                </Text>
              </Pressable>
              {currentUser?.admin?.active && user?.warnings?.length > 0 && (
                <Pressable
                  style={{
                    padding: 4,
                    backgroundColor:
                      activeSection === "Warnings"
                        ? theme.active
                        : "rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 4,
                  }}
                  onPress={() => {
                    if (haptics)
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    setActiveSection("Warnings");
                  }}
                >
                  <MaterialIcons
                    name="warning"
                    size={16}
                    color={
                      activeSection === "Warnings" ? "white" : theme.active
                    }
                  />
                  <Text
                    style={{
                      color:
                        activeSection === "Warnings" ? "white" : theme.text,
                      fontWeight: 500,
                      fontSize: 16,
                    }}
                  >
                    Warnings: {user?.warnings?.length}
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  if (haptics)
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  setActiveSection("Statistics");
                }}
                style={{
                  padding: 4,
                  backgroundColor:
                    activeSection === "Statistics"
                      ? theme.active
                      : "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Text
                  style={{
                    color:
                      activeSection === "Statistics" ? "white" : theme.text,
                    fontWeight: 500,
                    fontSize: 16,
                  }}
                >
                  Statistics
                </Text>
              </Pressable>
            </ScrollView>
            {activeSection === "Clans" && (
              <View style={{ gap: 12, padding: 8 }}>
                {user?.clans?.map((i: any, index: number) => {
                  return (
                    <Pressable
                      onPress={() => {
                        if (haptics)
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        if (!userItem) {
                          navigation.navigate("Clan", { item: i });
                        }
                      }}
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          aspectRatio: 1,
                          overflow: "hidden",
                          borderRadius: 50,
                        }}
                      >
                        <Img uri={i?.cover} />
                      </View>
                      <Text style={{ color: theme.text, fontWeight: 500 }}>
                        {i.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {activeSection === "Warnings" && <Warnings list={user?.warnings} />}
            {activeSection === "Statistics" && (
              <Statistics user={user} statistics={statistics} />
            )}
          </View>
        </View>
      </ScrollView>

      {openSendWarnings && (
        <SendWarnings
          setOpenWarnings={setOpenSendWarnings}
          SendWarning={SendWarning}
          warningLoading={warningLoading}
          warningType={warningType}
          setWarningType={setWarningType}
        />
      )}

      {openRepost && (
        <Reports
          setOpenReport={setOpenReport}
          reportType={reportType}
          setReportType={setReportType}
          SendReport={SendReport}
          reportLoading={reportLoading}
        />
      )}

      {openBlock && (
        <Block
          userId={user?._id}
          userName={user?.name}
          setOpenBlock={setOpenBlock}
          from={{ state: "clan", stateId: item?._id }}
        />
      )}
      {openClanBan && (
        <Ban
          clans={usersClans}
          setUsersClans={setUsersClans}
          openUser={user}
          setOpenBan={setOpenClanBan}
        />
      )}
    </>
  );
};

export default User;

const styles = StyleSheet.create({
  loader: {
    width: "100%",
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    position: "absolute",
    zIndex: 80,
  },
});

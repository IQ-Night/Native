import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/app";
import { useGameContext } from "../../context/game";
import * as Haptics from "expo-haptics";
import Button from "../../components/button";
import { BlurView } from "expo-blur";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { checkBanExpired, convertDuration } from "../../functions/checkBan";
import { useNotificationsContext } from "../../context/notifications";
import { useAuthContext } from "../../context/auth";
import Img from "../../components/image";
import BanTimer from "../../components/banTimer";

const bansList = [
  { totalHours: 0.0164, label: "1 min" },
  { totalHours: 0.5, label: "30 min" },
  { totalHours: 2, label: "2 hours" },
  { totalHours: 6, label: "6 hours" },
  { totalHours: 24, label: "24 hours" },
  { totalHours: 72, label: "3 days" },
  { totalHours: 168, label: "1 week" },
  { totalHours: 720, label: "1 month" },
];

const Ban = ({ openUser, setOpenBan, clans, setUsersClans }: any) => {
  const { apiUrl, theme, haptics } = useAppContext();
  const { socket, activeRoom } = useGameContext();
  const { currentUser } = useAuthContext();

  const slideAnim = useRef(new Animated.Value(500)).current;
  const [selectedDuration, setSelectedDuration] = useState(
    bansList[0].totalHours
  ); // Initial selection
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const closeBan = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setOpenBan(false));
  };

  // choice clan
  const [choisenClan, setChoisenClan] = useState<any>(null);

  useEffect(() => {
    if (clans?.length === 1) {
      setChoisenClan(clans[0]);
    }
  }, []);

  /**
   * Notification context
   */
  const { SendNotification } = useNotificationsContext();

  const AddBan = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/clans/${choisenClan?._id}/banList`,
        {
          user: openUser?._id,
          totalHours: selectedDuration,
          createdAt: new Date(),
        }
      );

      if (response?.data?.status === "success") {
        closeBan();
        const duration = convertDuration(selectedDuration);
        SendNotification({
          userId: openUser?._id,
          type:
            "You've got ban in clan " +
            choisenClan?.title +
            " by admin for " +
            duration +
            "",
        });
        // Update the users' clans state
        setUsersClans((prev: any) => {
          // Check if the current clan exists in the previous state
          if (prev?._id === choisenClan?._id) {
            return {
              ...prev,
              banList: prev.banList.map((ban: any) => {
                if (ban.user === openUser?._id) {
                  // Update existing ban properties
                  return {
                    ...ban,
                    totalHours: selectedDuration,
                    createdAt: new Date(),
                  };
                }
                return ban; // Return the unchanged ban
              }),
            };
          }
          return prev; // Return the previous state if the clan is not matched
        });
        socket.emit("rerenderRooms", { userId: openUser?._id });
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={[StyleSheet.absoluteFill, { zIndex: 80 }]}
    >
      <Pressable style={styles.container} onPress={closeBan}>
        <Animated.ScrollView
          style={[
            styles.animatedView,
            { transform: [{ translateY: slideAnim }] },
          ]}
          contentContainerStyle={{
            gap: 32,
            alignItems: "center",
          }}
        >
          {clans?.length > 1 && (
            <View style={{ width: "100%", alignItems: "center" }}>
              <View style={styles.header}>
                <Text style={[styles.headerText, { color: theme.text }]}>
                  Choise Clan
                </Text>
              </View>
              <View style={{ gap: 8, width: "100%", alignItems: "center" }}>
                {clans?.map((clan: any) => {
                  return (
                    <Pressable
                      onPress={() => {
                        if (choisenClan?._id === clan?._id) {
                          setChoisenClan(null);
                        } else {
                          setChoisenClan(clan);
                        }
                      }}
                      key={clan._id}
                      style={{
                        minWidth: "50%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        padding: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor:
                          choisenClan?._id === clan?._id
                            ? theme.active
                            : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          aspectRatio: 1,
                          overflow: "hidden",
                          borderRadius: 50,
                        }}
                      >
                        <Img uri={clan?.cover} />
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: theme.text,
                        }}
                      >
                        {clan.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
          {choisenClan && (
            <View>
              {/* Find the ban object for the current user */}
              {choisenClan.banList &&
                choisenClan.banList.find(
                  (i: any) => i.user === openUser?._id
                ) && (
                  <Text style={{ color: theme.active }}>
                    <BanTimer
                      createdAt={parseFloat(
                        choisenClan.banList.find(
                          (i: any) => i.user === openUser?._id
                        )?.createdAt
                      )}
                      duration={parseFloat(
                        choisenClan.banList.find(
                          (i: any) => i.user === openUser?._id
                        )?.totalHours
                      )}
                    />
                  </Text>
                )}
            </View>
          )}
          <View style={{ width: "100%", alignItems: "center" }}>
            <View style={styles.header}>
              <Text style={[styles.headerText, { color: theme.text }]}>
                Add Ban in this clan
              </Text>
              <MaterialCommunityIcons
                name="block-helper"
                size={18}
                color="red"
              />
            </View>

            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.pickerContainer}
            >
              <Picker
                selectedValue={selectedDuration}
                onValueChange={(value) => setSelectedDuration(value)}
              >
                {bansList.map((item) => (
                  <Picker.Item
                    key={item.totalHours}
                    label={item.label}
                    value={item.totalHours}
                    color={theme.text}
                  />
                ))}
              </Picker>
            </Pressable>
          </View>

          <Button
            title="Add Ban"
            style={{
              backgroundColor: "red",
              width: "100%",
              color: "white",
            }}
            loading={loading}
            onPressFunction={AddBan}
            disabled={!choisenClan}
          />
        </Animated.ScrollView>
      </Pressable>
    </BlurView>
  );
};

export default Ban;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  animatedView: {
    width: "90%",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
  },
  pickerContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    width: "100%",
    padding: 8,
  },
});

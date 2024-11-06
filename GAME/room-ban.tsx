import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/app";
import { useGameContext } from "../context/game";
import * as Haptics from "expo-haptics";
import Button from "../components/button";
import { BlurView } from "expo-blur";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { convertDuration } from "../functions/checkBan";
import { useNotificationsContext } from "../context/notifications";
import { useAuthContext } from "../context/auth";

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

const Ban = ({ openUser, setOpenBan, setOpenUser }: any) => {
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

  /**
   * Notification context
   */
  const { SendNotification } = useNotificationsContext();

  const AddBan = async () => {
    setLoading(true);

    try {
      const response = await axios.patch(
        `${apiUrl}/api/v1/rooms/${activeRoom?._id}/blackList`,
        {
          user: openUser?.userId,
          totalHours: selectedDuration,
          createdAt: new Date(),
        }
      );

      if (response?.data?.status === "success") {
        socket.emit("leaveRoom", activeRoom?._id, openUser?.userId);
        closeBan();
        setOpenUser(null);
        const duration = convertDuration(selectedDuration);
        SendNotification({
          userId: openUser?.userId,
          type: "You've got ban in room by admin for " + duration + "",
        });
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // throw out user from the room
  const [throwLoading, setThrowLoading] = useState(false);
  const ThrowOut = async (usr: any) => {
    setThrowLoading(true);
    try {
      setTimeout(() => {
        socket.emit("leaveRoom", usr?.roomId, usr?.userId);
        setOpenUser(null);
        setOpenBan(false);
        setThrowLoading(false);
        SendNotification({
          userId: openUser?.userId,
          type: "You'r throwouted from room by admin",
        });
      }, 300);
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={[StyleSheet.absoluteFill, { zIndex: 80 }]}
    >
      <Pressable style={styles.container} onPress={closeBan}>
        <Animated.View
          style={[
            styles.animatedView,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {(currentUser?.admin?.active &&
            currentUser?._id !== activeRoom?.admin?.founder?._id &&
            activeRoom?.admin?.founder?._id === openUser?.userId) ||
          openUser?.admin.active ? null : (
            <>
              <View style={styles.header}>
                <Text style={[styles.headerText, { color: theme.text }]}>
                  Add Ban in this room
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
              <Button
                title="Add Ban"
                style={{
                  backgroundColor: "red",
                  width: "100%",
                  color: "white",
                }}
                loading={loading}
                onPressFunction={AddBan}
              />
            </>
          )}

          <Button
            title="Simple throw out from this room"
            icon={
              <MaterialCommunityIcons name="logout" size={23} color="white" />
            }
            style={{
              backgroundColor: theme.active,
              width: "100%",
              color: "white",
            }}
            loading={throwLoading}
            onPressFunction={() => ThrowOut(openUser)}
          />
        </Animated.View>
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
    alignItems: "center",
    gap: 12,
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

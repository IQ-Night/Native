import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useGameContext } from "../../context/game";
import { useNotificationsContext } from "../../context/notifications";
import { convertDuration } from "../../functions/checkBan";

const Block = ({ userId, userName, setOpenBlock, setOpenUser, from }: any) => {
  const { apiUrl, theme, haptics, setAlert, activeLanguage } = useAppContext();
  const blocksOptions = [
    { totalHours: 0.0334, label: "2 " + activeLanguage?.min },
    { totalHours: 0.5, label: "30 " + activeLanguage?.min },
    { totalHours: 2, label: "2 " + activeLanguage?.hours },
    { totalHours: 6, label: "6 " + activeLanguage?.hours },
    { totalHours: 24, label: "24 " + activeLanguage?.hours },
    { totalHours: 72, label: "3 " + activeLanguage?.days },
    { totalHours: 168, label: "1 " + activeLanguage?.week },
    { totalHours: 720, label: "1 " + activeLanguage?.month },
    { totalHours: 8640, label: "1 " + activeLanguage?.year },
    { totalHours: 86400, label: "10 " + activeLanguage?.year },
  ];
  const { socket, activeRoom } = useGameContext();
  const { currentUser } = useAuthContext();

  const slideAnim = useRef(new Animated.Value(500)).current;
  const [selectedDuration, setSelectedDuration] = useState(
    blocksOptions[0].totalHours
  ); // Initial selection
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const closeBlock = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setOpenBlock(false));
  };

  /**
   * Notification context
   */
  const { SendNotification } = useNotificationsContext();

  const AddBlock = async () => {
    setLoading(true);

    try {
      const response = await axios.patch(
        `${apiUrl}/api/v1/users/${userId}/block`,
        {
          type: "blocked in app",
          totalHours: selectedDuration,
          createdAt: new Date(),
        }
      );

      if (response?.data?.status === "success") {
        if (from?.state === "room") {
          socket.emit("leaveRoom", from?.stateId, userId);
        }

        if (socket) {
          socket.emit("rerenderAuthUser", { userId });
        }
        SendNotification({
          userId: userId,
          type: "blockedInApp",
        });
        closeBlock();
        if (setOpenUser) {
          setOpenUser(null);
        }
        setAlert({
          active: true,
          type: "success",
          text: activeLanguage?.blockAdded,
        });
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
      <Pressable style={styles.container} onPress={closeBlock}>
        <Animated.View
          style={[
            styles.animatedView,
            {
              transform: [{ translateY: slideAnim }],
              position: "relative",
              bottom: from?.state !== "room" ? 60 : 0,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: theme.text }]}>
              {activeLanguage?.block} {userName} in app
            </Text>
            <MaterialCommunityIcons name="block-helper" size={18} color="red" />
          </View>

          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.pickerContainer}
          >
            <Picker
              selectedValue={selectedDuration}
              onValueChange={(value) => setSelectedDuration(value)}
            >
              {blocksOptions.map((item) => (
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
            title={activeLanguage?.block}
            style={{
              backgroundColor: "red",
              width: "100%",
              color: "white",
            }}
            loading={loading}
            onPressFunction={AddBlock}
          />
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default Block;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  animatedView: {
    width: "96%",
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

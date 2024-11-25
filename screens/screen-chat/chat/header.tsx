import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/app";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import axios from "axios";
import { useGameContext } from "../../../context/game";
import { ActivityIndicator } from "react-native-paper";
import { useAuthContext } from "../../../context/auth";

const Header = ({ handleClose, setMessages, totalMessages }: any) => {
  const { theme, apiUrl, activeLanguage } = useAppContext();
  const { activeRoom } = useGameContext();
  const { currentUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const ClearMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/chat"
      );
      if (response?.data.status === "success") {
        setMessages([]);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  // Clear timeout state
  const [clearState, setClearState] = useState<any>(null);
  const [clearTimeoutValue, setClearTimeoutValue] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Effect to handle timeout for clearing invoices
  useEffect(() => {
    let timer: NodeJS.Timeout; // Define timer variable for cleanup

    if (isTimerActive && clearTimeoutValue > 0) {
      // Set interval to decrement the clearTimeoutValue every second
      timer = setInterval(() => {
        setClearTimeoutValue((prev) => {
          if (prev <= 1) {
            ClearMessages();
            setMessages([]);
            setIsTimerActive(false); // Stop the timer
            setClearState(null);
            return 0; // Ensure it doesn't go below 0
          }
          return prev - 1; // Decrement the timer value
        });
      }, 1000); // 1 second interval

      return () => clearInterval(timer); // Cleanup the interval on unmount
    }

    return () => clearTimeout(timer); // Cleanup the timer
  }, [isTimerActive, clearTimeoutValue]);

  // Function to start the timer
  const startTimer = () => {
    if (clearTimeoutValue === 0) {
      setClearTimeoutValue(5); // Reset to 5 seconds
    }
    setIsTimerActive(true); // Start the timer
  };

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        width: "100%",
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        top: 0,
        paddingTop: 48,
        paddingBottom: 12,
        zIndex: 90,
      }}
    >
      {activeRoom?.admin?.founder?.id === currentUser?._id ? (
        <Pressable
          onPress={() => {
            if (totalMessages > 0) {
              if (clearState === "confirm") {
                setMessages([]);
                ClearMessages();
                setClearTimeoutValue(0); // Reset timeout
                setClearState(null);
              } else {
                setClearState("confirm");
                startTimer();
              }
            }
          }}
          style={{
            padding: 4,
            borderRadius: 8,
            backgroundColor:
              clearState === "confirm" ? theme.active : "rgba(255,255,255,0.1)",
            // paddingHorizontal: 12,
            width: 80,
            height: 26,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator size={14} color="white" />
          ) : (
            <Text
              style={{
                color:
                  totalMessages > 0 && !clearState
                    ? theme.active
                    : totalMessages > 0 && clearState === "confirm"
                    ? "white"
                    : "#888",
                fontWeight: "500",
                fontSize: 12,
              }}
            >
              {clearState === "confirm"
                ? `${activeLanguage?.confirm} (${clearTimeoutValue}s)`
                : activeLanguage?.clear_all}
            </Text>
          )}
        </Pressable>
      ) : (
        <View />
      )}
      <Text
        style={{
          color: theme.text,
          fontSize: 24,
          fontWeight: "600",
          width: 80,
          textAlign: "center",
        }}
      >
        Chat
      </Text>
      <Pressable
        onPress={handleClose}
        style={{
          width: 80,
          alignItems: "flex-end",
        }}
      >
        <FontAwesome name="close" size={40} color={theme.active} />
      </Pressable>
    </BlurView>
  );
};

export default Header;

const styles = StyleSheet.create({});

import {
  FontAwesome6,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { FormatDate } from "../../functions/formatDate";

const Vip = () => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert } = useAppContext();

  // auth
  const { currentUser, setCurrentUser } = useAuthContext();

  const Vips = [
    {
      duration: "1 Week",
      price: 7,
    },
    {
      duration: "2 Weeks",
      price: 12,
    },
    {
      duration: "1 Month",
      price: 20,
    },
    {
      duration: "3 Months",
      price: 50,
    },
    {
      duration: "6 Months",
      price: 80,
    },
    {
      duration: "Annually",
      price: 140,
    },
  ];

  /**
   * Buy Vip
   */
  const [loading, setLoading] = useState<any>(null);
  // confirm buying
  const [confirm, setConfirm] = useState(null);
  const BuyVip = async ({ Vip, price, duration }: any) => {
    setLoading(Vip);
    const invoice = {
      type: "Buy Vip",
      Vip: Vip,
      price: price,
      createdAt: new Date(),
      duration: duration,
    };
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/users/" + currentUser?._id + "/buyVip",
        { ...invoice }
      );
      if (response.data.status === "success") {
        const newUser = {
          ...currentUser,
          vip: response?.data?.data?.vip,
        };

        setCurrentUser(newUser);
        setConfirm(null);
        setAlert({
          active: true,
          type: "success",
          text: "Vip have bought successfully!",
        });
      }

      setLoading(null);
    } catch (error: any) {
      console.log(error.response);
      setLoading(null);
      setConfirm(null);
    }
  };

  // Clear timeout state
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
            setConfirm(null); // Clear invoices when timer reaches zero
            setIsTimerActive(false); // Stop the timer
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
    <ScrollView
      contentContainerStyle={{
        paddingTop: 8,
        gap: 16,
        paddingHorizontal: 12,
        paddingBottom: 100,
      }}
    >
      {Vips?.map((c: any, x: number) => {
        return (
          <View
            key={x}
            style={{
              width: "100%",
              backgroundColor: "rgba(255,255,255,0.05)",
              height: 196,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              paddingVertical: 20,
            }}
          >
            <MaterialIcons
              name="diamond"
              size={100}
              color={theme.text}
              style={{ position: "absolute", opacity: 0.05, left: 0, top: 0 }}
            />
            <MaterialIcons
              name="diamond"
              size={100}
              color={theme.text}
              style={{
                position: "absolute",
                opacity: 0.05,
                right: 0,
                bottom: 0,
                transform: [{ scaleX: -1 }], // Flip horizontally
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{ color: theme.active, fontSize: 24, fontWeight: 700 }}
              >
                {c?.duration}{" "}
              </Text>
              <MaterialIcons name="diamond" size={24} color={theme.active} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: 600, color: "white" }}>
              {c?.price}$
            </Text>
            <Button
              title={
                confirm === c?.duration
                  ? "Confirm (" + clearTimeoutValue + ")"
                  : c?.duration === currentUser?.vip?.duration
                  ? "Active - Expires: " +
                    FormatDate(currentUser?.vip?.expiresAt, "onlyDate")
                  : "Buy"
              }
              style={{
                width: "100%",
                backgroundColor:
                  confirm === c?.duration ? "green" : theme.active,
                color: "white",
              }}
              disabled={c?.duration === currentUser?.vip?.duration}
              loading={loading === c?.duration}
              onPressFunction={() => {
                if (confirm !== c?.duration) {
                  setConfirm(c?.duration);
                  startTimer();
                } else {
                  BuyVip({
                    Vip: c?.duration,
                    price: c?.price,
                    duration: c?.duration,
                  });
                  setClearTimeoutValue(0);
                }
              }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

export default Vip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    zIndex: 20,
  },
  header: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
});

import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";

const Coins = () => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert } = useAppContext();

  // auth
  const { currentUser, setCurrentUser } = useAuthContext();

  const coins = [
    {
      size: 100,
      price: 5,
    },
    {
      size: 200,
      price: 8,
    },
    {
      size: 500,
      price: 12,
    },
    {
      size: 1000,
      price: 17,
    },
    {
      size: 1500,
      price: 23,
    },
    {
      size: 2000,
      price: 30,
    },
    {
      size: 3500,
      price: 45,
    },
  ];

  /**
   * Buy coins
   */
  const [loading, setLoading] = useState<any>(null);
  // confirm buying
  const [confirm, setConfirm] = useState(null);
  const BuyCoins = async ({ coins, price }: any) => {
    setLoading(coins);
    const invoice = {
      type: "Buy coins",
      coins: coins,
      price: price,
      createdAt: new Date(),
    };
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/users/" + currentUser?._id + "/buyCoins",
        { ...invoice }
      );
      if (response.data.status === "success") {
        const newUser = {
          ...currentUser,
          coins: {
            ...currentUser.coins,
            total: (currentUser.coins.total || 0) + coins,
          }, // Safely update total
        };

        setCurrentUser(newUser);
        setConfirm(null);
        setAlert({
          active: true,
          type: "success",
          text: "Coins have bought successfully!",
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
      {coins?.map((c: any, x: number) => {
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
            <MaterialCommunityIcons
              name="hand-coin-outline"
              size={100}
              color={theme.text}
              style={{ position: "absolute", opacity: 0.05, left: 0, top: 0 }}
            />
            <MaterialCommunityIcons
              name="hand-coin-outline"
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
            <Text
              style={{ color: theme.active, fontSize: 24, fontWeight: 700 }}
            >
              {c?.size}{" "}
              <FontAwesome6 name="coins" size={24} color={theme.active} />
            </Text>
            <Text style={{ fontSize: 24, fontWeight: 600, color: "white" }}>
              {c?.price}$
            </Text>
            <Button
              title={
                confirm === c?.size
                  ? "Confirm (" + clearTimeoutValue + ")"
                  : "Buy"
              }
              style={{
                width: "100%",
                backgroundColor: confirm === c?.size ? "green" : theme.active,
                color: "white",
              }}
              loading={loading === c?.size}
              onPressFunction={() => {
                if (confirm !== c?.size) {
                  setConfirm(c?.size);
                  startTimer();
                } else {
                  BuyCoins({ coins: c?.size, price: c?.price });
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

export default Coins;

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

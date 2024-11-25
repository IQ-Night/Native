import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import { useAppContext } from "../context/app";
import { color } from "react-native-elements/dist/helpers";
import Button from "./button";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuthContext } from "../context/auth";

const ConfirmAction = ({ openState, setOpenState, Function, money }: any) => {
  const { currentUser } = useAuthContext();
  const { theme, setAlert, activeLanguage } = useAppContext();
  const slideAnim = useRef(new Animated.Value(220)).current; // Start off-screen
  const [countdown, setCountdown] = useState(5); // Timer countdown state

  // Animation to slide the popup in and out
  useEffect(() => {
    if (openState) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Start countdown timer when popup opens
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      // Automatically run the function if countdown reaches zero
      if (countdown === 0) {
        clearInterval(timer); // Clear timer
        setTimeout(() => {
          closeComponent(); // Close popup
        }, 500);
      }

      // Cleanup timer on component unmount
      return () => clearInterval(timer);
    }
  }, [openState, countdown]);

  // Function to close the confirmation popup
  const closeComponent = () => {
    Animated.timing(slideAnim, {
      toValue: 220, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setOpenState({ active: false });
      setCountdown(5); // Reset countdown for next time
    });
  };

  // Function to handle user confirmation
  const handleConfirm = () => {
    if (currentUser?.coins?.total < parseInt(openState?.price)) {
      return setAlert({
        active: true,
        text: "You don't have enough coins to change cover!",
        type: "error",
      });
    }
    Function(); // Run the provided function
    closeComponent(); // Close popup
    setAlert({
      active: true,
      text: openState?.successText
        ? openState?.successText
        : "Complete successfully!",
      type: "success",
    });
  };

  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={{ width: "100%", height: "100%", position: "absolute" }}
    >
      <Pressable
        onPress={closeComponent}
        style={{ width: "100%", height: "100%" }}
      >
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            height: 220,
            width: "100%",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: "hidden",
            transform: [{ translateY: slideAnim }],
          }}
        >
          <BlurView
            intensity={120}
            tint="dark"
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
              gap: 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.text,
                textAlign: "center",
              }}
            >
              {openState?.text}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Button
                title={`${activeLanguage?.cancel} ${countdown}s`}
                onPressFunction={closeComponent}
                style={{
                  width: "45%",
                  backgroundColor: "#888",
                  color: "white",
                }}
              />

              <Button
                title={
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: 600,
                      marginVertical: 6,
                    }}
                  >
                    {activeLanguage?.confirm} {openState?.price}{" "}
                    {money === "money" ? (
                      "$"
                    ) : (
                      <FontAwesome5
                        name="coins"
                        size={14}
                        color={theme.active}
                      />
                    )}
                  </Text>
                }
                onPressFunction={handleConfirm}
                style={{
                  width: "45%",
                  backgroundColor: "green",
                  color: "white",
                }}
              />
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default ConfirmAction;

const styles = StyleSheet.create({});

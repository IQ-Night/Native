import React, { useEffect } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import { useAppContext } from "../../context/app";
import { useGameContext } from "../../context/game";
import { useAuthContext } from "../../context/auth";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import User from "../../screens/screen-user/main";

const UserPopup = ({ openUser, setOpenUser }: any) => {
  const { theme, haptics } = useAppContext();
  const { currentUser } = useAuthContext();

  const translateY = new Animated.Value(500); // Initial position off-screen
  const opacity = new Animated.Value(0); // Initial opacity is 0

  // Open animation effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Close animation function
  const closePopup = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500, // Slide down off-screen
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0, // Fade out
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOpenUser(null); // Close the popup after animation ends
    });
  };

  return (
    <BlurView intensity={120} tint="dark" style={styles.blurContainer}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            opacity: opacity,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "500" }}>
            {openUser?.userName}
          </Text>
          <View style={styles.iconContainer}>
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                closePopup(); // Call close animation on press
              }}
            >
              <MaterialCommunityIcons
                name="close"
                size={30}
                color={theme.active}
              />
            </Pressable>
          </View>
        </View>
        <User userItem={{ ...openUser, _id: openUser?.userId }} />
      </Animated.View>
    </BlurView>
  );
};

export default UserPopup;

const styles = StyleSheet.create({
  blurContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 70,
  },
  container: {
    width: "100%",
    paddingTop: 16,
    position: "absolute",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});

import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAppContext } from "../../context/app";
import { useRoomsContext } from "../../context/rooms";
import CountryFlag from "react-native-country-flag";

const Filter = ({ openFilter, setOpenFilter, translateYFilter }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  return (
    <BlurView
      intensity={30}
      tint="dark"
      style={{
        flex: 1,
      }}
    >
      <Pressable onPress={() => setOpenFilter(false)} style={styles.container}>
        <Animated.View
          style={{
            transform: [{ translateY: translateYFilter }],
            height: "60%",
            borderRadius: 24,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "#222",
          }}
        >
          <BlurView intensity={120} tint="dark" style={{ flex: 1 }}>
            <View style={styles.header}>
              <Ionicons
                onPress={() => setOpenFilter(false)}
                name="caret-down-outline"
                color={theme.text}
                size={24}
              />
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default Filter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    zIndex: 20,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    height: 48,
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 20,
  },
});

import React from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import Header from "../../components/header";
import { useLiderboardContext } from "../../context/liderboard";
import List from "./list";
import { ActivityIndicator } from "react-native-paper";
import { useContentContext } from "../../context/content";
import { useAppContext } from "../../context/app";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Liderboard = () => {
  const { theme } = useAppContext();
  /**
   * Content context
   */
  const { opacityList, transformListY } = useContentContext();

  return (
    <View style={{ width: "100%", flex: 1 }}>
      <Header tab="Liderboard" />

      <Animated.View
        style={{
          opacity: opacityList,
          transform: [{ scale: opacityList }],
          height: 30,
          width: 40,
          position: "absolute",
          top: 110,
          left: SCREEN_WIDTH / 2 - 20,
        }}
      >
        <ActivityIndicator color="orange" size="small" />
      </Animated.View>

      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateY: transformListY }],
        }}
      >
        <List />
      </Animated.View>
    </View>
  );
};

export default Liderboard;

const styles = StyleSheet.create({});

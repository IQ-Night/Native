import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/app";
import { Ionicons } from "@expo/vector-icons";

const About = () => {
  /**
   * App state
   */
  const { theme } = useAppContext();

  return (
    <View style={styles.container}>
      <Text>About</Text>
    </View>
  );
};

export default About;

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
    paddingHorizontal: 16,
  },
});

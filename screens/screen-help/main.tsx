import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/app";
import { Ionicons } from "@expo/vector-icons";

const Help = () => {
  /**
   * App state
   */
  const { theme } = useAppContext();

  return (
    <View style={styles.container}>
      <Text>Help</Text>
    </View>
  );
};

export default Help;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    zIndex: 20,
  },
});

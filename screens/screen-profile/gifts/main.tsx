import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppContext } from "../../../context/app";

const Gift = () => {
  /**
   * App context
   */
  const { theme } = useAppContext();
  return (
    <View>
      <Text>Gifts</Text>
    </View>
  );
};

export default Gift;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    zIndex: 20,
  },
});

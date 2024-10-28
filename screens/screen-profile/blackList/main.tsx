import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../../context/app";

const BlackList = () => {
  /**
   * App state
   */
  const { theme } = useAppContext();

  return (
    <View style={styles.container}>
      <Text>BlackList</Text>
    </View>
  );
};

export default BlackList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    zIndex: 20,
  },
});

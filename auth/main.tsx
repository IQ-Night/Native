import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useAppContext } from "../context/app";
import Login from "./login";
import Register from "./register";
import { useAuthContext } from "../context/auth";
import ChoiceAuth from "./choiceAuth";

const Auth = () => {
  /**
   * Auth context
   */
  const { activeRoute } = useAuthContext();

  return (
    <View style={styles.container}>
      {activeRoute.current === "login" ? (
        <Login />
      ) : activeRoute.current === "choiceAuth" ? (
        <ChoiceAuth />
      ) : (
        <Register />
      )}
    </View>
  );
};

export default Auth;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

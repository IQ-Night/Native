import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { useAppContext } from "../../context/app";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../components/button";

const Landing = ({ navigation }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={{ flex: 1, width: "100%" }}
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.3)"]}
        style={styles.container}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 48,
            fontWeight: 700,
            position: "absolute",
            top: "30%",
          }}
        >
          IQ-Night
        </Text>
        <View
          style={{
            width: "100%",
            position: "absolute",
            bottom: 48,
            alignItems: "center",
          }}
        >
          <Button
            title="Auth"
            style={{
              width: "95%",
              backgroundColor: theme.active,
              color: "white",
            }}
            onPressFunction={() => navigation.navigate("Login")}
          />
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default Landing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

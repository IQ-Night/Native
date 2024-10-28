import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/app";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface PropsTypes {
  active: boolean;
  type: String;
  onClose: () => void;
  text: String;
}

const Alert: React.FC<PropsTypes> = ({ type, onClose, text }) => {
  const { theme } = useAppContext();
  // Initialize animated value
  const translateY = useRef(new Animated.Value(300)).current;

  const [close, setClose] = useState(true);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: close ? 0 : 300,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [close]);
  return (
    <LinearGradient
      colors={[
        "rgba(0,0,0,0)",
        "rgba(0,0,0,0.2)",
        "rgba(0,0,0,0.4)",
        "rgba(0,0,0,0.8)",
        "rgba(0,0,0,1)",
      ]}
      style={{
        position: "absolute",
        bottom: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        alignItems: "center",
        justifyContent: "flex-end",
        zIndex: 1000,
      }}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <Pressable
        onPress={() => {
          setClose(false);
          setTimeout(() => {
            onClose();
          }, 10);
        }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-end",
          zIndex: 1000,
        }}
      >
        <Animated.View
          style={{
            marginBottom: 72,
            width: "94%",
            borderRadius: 10,
            backgroundColor:
              type === "error"
                ? "red"
                : type === "success"
                ? "green"
                : theme.active,
            minHeight: 48,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 7.5,
            paddingHorizontal: 16,
            transform: [{ translateY }],
          }}
        >
          <Text style={{ color: "white", maxWidth: "90%", fontWeight: 500 }}>
            {text}
          </Text>
          <Ionicons
            name="close"
            size={24}
            color="white"
            onPress={() => {
              setClose(false);
              setTimeout(() => {
                onClose();
              }, 10);
            }}
          />
        </Animated.View>
      </Pressable>
    </LinearGradient>
  );
};

export default Alert;

const styles = StyleSheet.create({});

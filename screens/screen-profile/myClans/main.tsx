import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import List from "./list";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import CreateClan from "./createClan";
import * as Haptics from "expo-haptics";
import { useAppContext } from "../../../context/app";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MyClans = ({ navigation }: any) => {
  /**
   * App context
   */
  const { haptics, theme } = useAppContext();
  /**
   * Create clan opening
   */
  const [createClan, setCreateClan] = useState(false);
  const translateYCreateClan = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  useEffect(() => {
    if (createClan) {
      Animated.timing(translateYCreateClan, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateYCreateClan, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [createClan]);
  return (
    <View style={{ height: "100%" }}>
      <List navigation={navigation} />
      <Animated.View
        style={[
          styles.screen,
          {
            transform: [{ translateY: translateYCreateClan }],
          },
        ]}
      >
        <CreateClan setCreateClan={setCreateClan} />
      </Animated.View>
      <View
        style={{
          // Box shadow for iOS
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          // Elevation for Android
          elevation: 4,
        }}
      >
        <View style={styles.createIcon}>
          <View
            style={{
              borderRadius: 8,
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              width: "90%",
            }}
          >
            <BlurView
              intensity={120}
              tint="dark"
              style={{
                gap: 16,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => {
                  setCreateClan(true);
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
                style={{
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  padding: 8,
                  gap: 4,
                }}
              >
                <Ionicons
                  name="create"
                  size={24}
                  color={"orange"}
                  style={{ position: "relative", left: 1 }}
                />
                <Text
                  style={{ fontSize: 16, fontWeight: 500, color: theme.active }}
                >
                  Create Clan
                </Text>
              </Pressable>
            </BlurView>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MyClans;

const styles = StyleSheet.create({
  createIcon: {
    borderRadius: 10,
    position: "absolute",
    bottom: 90,
    overflow: "hidden",
    width: "100%",
    alignItems: "center",
  },
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 50,
    paddingBottom: 96,
  },
});

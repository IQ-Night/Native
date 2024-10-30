import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  Text,
  Pressable,
  Dimensions,
  Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import Logs from "./main";
import { useAppContext } from "../../context/app";
import { useGameContext } from "../../context/game";

const LogsModal = ({ openLogs, setOpenLogs }: any) => {
  const { theme, haptics } = useAppContext();
  const { activeRoom } = useGameContext();

  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: openLogs ? 0 : Dimensions.get("window").height,
      duration: 300,
      easing: Easing.out(Easing.ease), // Smooth easing added
      useNativeDriver: true,
    }).start();
  }, [openLogs]);

  const closeModal = () => {
    // Slide down when the component unmounts
    Animated.timing(slideAnim, {
      toValue: Dimensions.get("window").height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setOpenLogs(false));
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: 70,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {openLogs && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            flex: 1,
            paddingTop: 94,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 56,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.05)",
              paddingBottom: 16,
            }}
          >
            <Text
              style={{ color: theme.text, fontSize: 18, fontWeight: "500" }}
            >
              Game logs:
            </Text>
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                closeModal();
              }}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text
                style={{
                  color: theme.active,
                  fontSize: 16,
                  fontWeight: 600,
                  marginRight: 4,
                }}
              >
                Close
              </Text>
            </Pressable>
          </View>
          <Logs item={activeRoom} setOpenLogs={setOpenLogs} />
        </BlurView>
      )}
    </Animated.View>
  );
};

export default LogsModal;

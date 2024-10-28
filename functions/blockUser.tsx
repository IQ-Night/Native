import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable } from "react-native";

export const renderBlockButton = ({
  user,
  haptics,
  setConfirm,
  text,
  style,
}: any) => (
  <Pressable
    onPress={() => {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      setConfirm({
        user,
        text,
      });
    }}
    style={{ ...style }}
  >
    <MaterialCommunityIcons name="block-helper" size={19} color="red" />
  </Pressable>
);

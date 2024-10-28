import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useAppContext } from "../../context/app";

const MenuItem = ({ item, navigation }: any) => {
  /**
   * app context
   */
  const { theme, haptics } = useAppContext();
  return (
    <Pressable
      style={styles.button}
      onPress={() => {
        navigation.navigate(item.screen);
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
      }}
    >
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}>
        {item.label}
      </Text>
      <MaterialIcons name="arrow-right" size={24} color={theme.text} />
    </Pressable>
  );
};

export default MenuItem;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
});

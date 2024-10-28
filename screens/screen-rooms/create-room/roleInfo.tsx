import { BlurView } from "expo-blur";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../../context/app";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const RoleInfo = ({ openRoleInfo }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  return (
    <BlurView intensity={120} tint="dark" style={styles.container}>
      <View
        style={{
          width: "100%",
          alignItems: "center",
          gap: 16,
          // marginTop: "60%",
        }}
      >
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: 500 }}>
          {openRoleInfo?.label}
        </Text>
        <Text>"Info</Text>
      </View>
    </BlurView>
  );
};

export default RoleInfo;

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT - 48,
    width: "100%",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    zIndex: 50,
    paddingTop: 48,
    paddingHorizontal: 16,
    gap: 8,
  },
  header: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
});

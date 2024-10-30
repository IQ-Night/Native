import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { BlurView } from "expo-blur";
import { useAppContext } from "../context/app";
import { useGameContext } from "../context/game";
import { useAuthContext } from "../context/auth";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import User from "../screens/screen-user/main";

const UserPopup = ({
  openUser,
  setOpenBan,
  setOpenBlock,
  setOpenUser,
}: any) => {
  const { theme, haptics } = useAppContext();
  const { activeRoom } = useGameContext();
  const { currentUser } = useAuthContext();
  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        width: "100%",
        position: "absolute",
        zIndex: 70,
        height: "100%",
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
        }}
      >
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: 500 }}>
          {openUser?.userName}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {((activeRoom?.admin.founder?._id || activeRoom?.admin.founder) ===
            currentUser?._id ||
            currentUser?.admin?.active) &&
            openUser?.userId !== currentUser?._id && (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setOpenBan(true);
                }}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={23}
                  color={theme.text}
                />
              </Pressable>
            )}
          {currentUser?.admin?.active &&
            openUser?.userId !== currentUser?._id && (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setOpenBlock(true);
                }}
              >
                <MaterialCommunityIcons
                  name="block-helper"
                  size={19}
                  color="red"
                />
              </Pressable>
            )}
          <Pressable
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              setOpenUser(null);
            }}
          >
            <MaterialCommunityIcons
              name="close"
              size={30}
              color={theme.active}
            />
          </Pressable>
        </View>
      </View>
      <User userItem={{ ...openUser, _id: openUser?.userId }} />
    </BlurView>
  );
};

export default UserPopup;

const styles = StyleSheet.create({});

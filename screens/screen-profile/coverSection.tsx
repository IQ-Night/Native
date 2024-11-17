import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useProfileContext } from "../../context/profile";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import axios from "axios";
import Img from "../../components/image";

const CoverSection = () => {
  /**
   * App state
   */
  const { apiUrl, theme, haptics, setAlert } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Profile context
   */
  const { setUpdateState, setLoading } = useProfileContext();

  // upload img from device

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: 8, position: "relative", gap: 16 },
      ]}
    >
      <View>
        <Pressable
          onPress={() => {
            setUpdateState("Avatars");
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
          }}
          style={{ borderRadius: 8, overflow: "hidden" }}
        >
          <View
            style={{
              width: 70,
              aspectRatio: 1,
              borderRadius: 8,
              backgroundColor: "gray",
            }}
          >
            {!currentUser?.editOptions?.paidForCover && (
              <Text
                style={{
                  position: "absolute",
                  right: 8,
                  zIndex: 60,
                  color: "white",
                  fontWeight: 600,
                  marginVertical: 6,
                  fontSize: 12,
                }}
              >
                1500{" "}
                <FontAwesome5 name="coins" size={12} color={theme.active} />
              </Text>
            )}
            <Img uri={currentUser.cover} onLoad={() => setLoading(false)} />
          </View>
        </Pressable>
      </View>

      <View style={{ gap: 4 }}>
        <View
          style={{
            width: "70%",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "bold" }}>
            {currentUser?.name}
          </Text>
          <Pressable
            style={{}}
            onPress={() => {
              setUpdateState("Edit Name");
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
            }}
          >
            <MaterialIcons
              name="drive-file-rename-outline"
              size={24}
              color={theme.text}
              style={{ position: "relative", bottom: 1 }}
            />
          </Pressable>
        </View>
        <Text
          style={{
            color: theme.text,
            opacity: 0.8,
            fontSize: 14,
            fontWeight: "normal",
          }}
        >
          {currentUser?.email}
        </Text>
      </View>
    </View>
  );
};

export default CoverSection;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginTop: 2,
    borderColor: "rgba(255,255,255,0.05)",
    // borderRadius: 12,
  },
});

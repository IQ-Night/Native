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
  const { apiUrl, theme, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser, setCurrentUser } = useAuthContext();

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const ChangeProfileCover = async () => {
      try {
        await axios.patch(apiUrl + "/api/v1/users/" + currentUser?._id, {
          cover: currentUser.cover,
        });
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    if (currentUser.cover) {
      ChangeProfileCover();
    }
  }, [currentUser?.cover]);

  /**
   * Profile context
   */
  const { setUpdateState, setLoading } = useProfileContext();
  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: 8, position: "relative", gap: 16 },
      ]}
    >
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
          <Img uri={currentUser.cover} onLoad={() => setLoading(false)} />
        </View>
      </Pressable>

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

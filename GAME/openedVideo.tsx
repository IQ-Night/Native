import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RTCView } from "react-native-webrtc";
import Img from "../components/image";
import { useAppContext } from "../context/app";

const OpenVideo = ({ streamUrl, setOpenVideo, user, setOpenUser }: any) => {
  const { theme, haptics } = useAppContext();
  // Animation for confirmation popup
  const slideAnim = useRef(new Animated.Value(0)).current; // Start off-screen

  useEffect(() => {
    if (streamUrl) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [streamUrl]);

  const closePopup = () => {
    Animated.timing(slideAnim, {
      toValue: 0, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setOpenVideo(null));
  };
  return (
    <BlurView tint="dark" intensity={120} style={styles?.container}>
      <Pressable
        onPress={closePopup}
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* ლოკალური ნაკადი */}
        <Animated.View
          style={[
            styles?.video,
            {
              opacity: slideAnim,
              transform: [{ scale: slideAnim }],
              alignItems: "center",
              gap: 24,
              position: "relative",
              bottom: "10%",
            },
          ]}
        >
          <View style={{}}>
            {user?.playerNumber ? (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setOpenUser(user);
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 100,
                    overflow: "hidden",
                  }}
                >
                  <Img uri={user.userCover} />
                </View>
                <Text
                  style={{ color: theme.text, fontSize: 32, fontWeight: 500 }}
                >
                  N:{user?.playerNumber}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setOpenUser(user);
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 100,
                    overflow: "hidden",
                  }}
                >
                  <Img uri={user.userCover} />
                </View>
                <Text
                  style={{ color: theme.text, fontSize: 28, fontWeight: 500 }}
                >
                  {user?.userName}
                </Text>
              </Pressable>
            )}
          </View>
          <RTCView
            key="local"
            streamURL={streamUrl}
            style={styles.video}
            objectFit="cover"
          />

          {/* <FontAwesome
            style={{}}
            size={32}
            color={theme.text}
            name={user?.audio === "active" ? "microphone" : "microphone-slash"}
          /> */}
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "absolute",
    top: 0,
    zIndex: 90,
    padding: 16,
  },
  video: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 1000,
  },
});

export default OpenVideo;

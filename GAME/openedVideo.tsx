import { BlurView } from "expo-blur";
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
import { useAppContext } from "../context/app";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const OpenVideo = ({ streamUrl, setOpenVideo, user }: any) => {
  const { theme } = useAppContext();
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
              <Text
                style={{ color: theme.text, fontSize: 32, fontWeight: 500 }}
              >
                N:{user?.playerNumber}
              </Text>
            ) : (
              <Text
                style={{ color: theme.text, fontSize: 32, fontWeight: 500 }}
              >
                {user?.userName}
              </Text>
            )}
          </View>
          <RTCView
            key="local"
            streamURL={streamUrl}
            style={styles.video}
            objectFit="cover"
          />

          <FontAwesome
            style={{}}
            size={32}
            color={theme.text}
            name={user?.microphone ? "microphone" : "microphone-slash"}
          />
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

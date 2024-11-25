import { Pressable, StyleSheet, Text, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { BlurView } from "expo-blur";
import { useGameContext } from "../context/game";
import { useAppContext } from "../context/app";
import Img from "../components/image";
import * as Haptics from "expo-haptics";

const Spectators = ({ setOpenSpectators, setOpenUser }: any) => {
  const { theme, haptics, activeLanguage } = useAppContext();
  const { spectators } = useGameContext();
  const slideAnim = useRef(new Animated.Value(500)).current; // Start off-screen

  useEffect(() => {
    if (spectators?.length < 1) {
      setOpenSpectators(false);
    }
  }, [spectators]);

  useEffect(() => {
    // Slide up when the component mounts
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const closeSpectators = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    // Slide down when the component unmounts
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setOpenSpectators(false));
  };

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={[StyleSheet.absoluteFill, { zIndex: 60 }]}
    >
      <Pressable
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={closeSpectators}
      >
        <Animated.View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 18,
              fontWeight: "700",
              position: "relative",
              bottom: 24,
            }}
          >
            {activeLanguage?.spectators}
          </Text>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 8,
              width: "90%",
              height: "60%",
              padding: 16,
            }}
          >
            {spectators?.map((spectator: any, index: number) => (
              <Pressable
                key={index}
                style={{ gap: 4 }}
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setOpenUser(spectator);
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 50,
                    overflow: "hidden",
                  }}
                >
                  <Img uri={spectator.userCover} />
                </View>
                <Text style={{ color: theme.text, fontWeight: "500" }}>
                  {spectator?.userName}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default Spectators;

const styles = StyleSheet.create({});

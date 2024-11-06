import React, { useEffect, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import { useAppContext } from "../../context/app";
import Button from "../../components/button";
import { warnings } from "../../context/content";

const Warnings = ({
  setOpenWarnings,
  SendWarning,
  warningLoading,
  warningType,
  setWarningType,
}: any) => {
  const { theme } = useAppContext();
  // Animated values for scale and opacity
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger scale and opacity animations for opening
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeAnimation = () => {
    // Trigger scale and opacity animations for closing
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Set open state to false after animation completes
      setOpenWarnings(false);
    });
  };

  return (
    <BlurView intensity={140} tint="dark" style={styles.blurView}>
      <Pressable onPress={closeAnimation} style={styles.pressable}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
              gap: 16,
            },
          ]}
        >
          <View
            style={{
              width: "100%",
              gap: 8,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {warnings?.map((item: any, index: number) => {
              return (
                <Pressable
                  onPress={() => {
                    if (item?.value === warningType) {
                      setWarningType(null);
                    } else {
                      setWarningType(item?.value);
                    }
                  }}
                  style={{
                    width: "30%",
                    aspectRatio: 1,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: 8,
                    alignItems: "center",
                    borderWidth: 1.5,
                    borderColor:
                      item?.value === warningType
                        ? theme.active
                        : "rgba(255,255,255,0.1)",
                    padding: 12,
                  }}
                  key={item.id}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: 500,
                      fontSize: 12,
                      lineHeight: 18,
                      letterSpacing: 0.5,
                    }}
                  >
                    {item.en}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            title="Send"
            style={{
              width: "100%",
              backgroundColor: theme.active,
              color: "white",
            }}
            loading={warningLoading}
            onPressFunction={() => SendWarning()}
            disabled={!warningType}
          />
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default Warnings;

const styles = StyleSheet.create({
  blurView: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 70,
  },
  pressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    bottom: 50,
  },
  animatedContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    width: "96%",
    flexShrink: 1,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

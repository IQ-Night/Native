import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { BlurView } from "expo-blur";
import Button from "./button";
import { useAppContext } from "../context/app";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const Confirm = ({ confirm, setConfirm }: any) => {
  const { theme, haptics } = useAppContext();

  return (
    <>
      {confirm && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            width: "100%",
            height: SCREEN_HEIGHT,
            position: "absolute",
            top: 0,
            zIndex: 70,
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            paddingHorizontal: 16,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            {confirm?.text}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Button
              title="Cancel"
              style={{
                backgroundColor: theme.text,
                color: "white",
                width: "45%",
              }}
              onPressFunction={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setConfirm(null);
              }}
            />
            <Button
              loading={confirm?.loading}
              title={confirm?.confirmText}
              style={{
                backgroundColor: theme.active,
                color: "white",
                width: "45%",
              }}
              onPressFunction={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                confirm?.confirmAction();
              }}
            />
          </View>
        </BlurView>
      )}
    </>
  );
};

const styles = StyleSheet.create({});

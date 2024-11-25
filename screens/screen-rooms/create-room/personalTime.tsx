import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppContext } from "../../../context/app";
import * as Haptics from "expo-haptics";

const PersonalTime = ({ roomState, setRoomState }: any) => {
  /**
   * App context
   */
  const { theme, haptics, activeLanguage } = useAppContext();
  // styles
  const styles = createStyles(theme);
  return (
    <View
      style={[
        styles.fieldContainer,
        {
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 8,
          height: "auto",
          marginTop: 8,
        },
      ]}
    >
      <Text style={styles.title}>{activeLanguage?.personalTime}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          marginTop: 16,
          gap: 8,
        }}
      >
        <Pressable
          onPress={() => {
            setRoomState((prev: any) => ({ ...prev, personalTime: 30 }));
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              roomState.personalTime === 30
                ? theme.active
                : "rgba(255,255,255,0.05)",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: roomState.personalTime === 30 ? "white" : theme.text,
              fontWeight: 600,
            }}
          >
            30 {activeLanguage?.sec}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setRoomState((prev: any) => ({ ...prev, personalTime: 45 }));
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              roomState.personalTime === 45
                ? theme.active
                : "rgba(255,255,255,0.05)",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: roomState.personalTime === 45 ? "white" : theme.text,
              fontWeight: 600,
            }}
          >
            45 {activeLanguage?.sec}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setRoomState((prev: any) => ({ ...prev, personalTime: 60 }));
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              roomState.personalTime === 60
                ? theme.active
                : "rgba(255,255,255,0.05)",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: roomState.personalTime === 60 ? "white" : theme.text,
              fontWeight: 600,
            }}
          >
            1 {activeLanguage?.min}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PersonalTime;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      zIndex: 20,
    },
    header: {
      width: "100%",
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      position: "absolute",
      top: 0,
      zIndex: 20,
    },
    fieldContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      height: 30,
    },
    title: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 16,
    },
    subtitle: {
      color: theme.text,
      fontWeight: "500",
    },
    numericValue: {
      padding: 4,
      paddingHorizontal: 12,
      backgroundColor: "gray",
      borderRadius: 8,
      width: 80,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
  });

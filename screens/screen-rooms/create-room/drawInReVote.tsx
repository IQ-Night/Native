import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppContext } from "../../../context/app";
import * as Haptics from "expo-haptics";

const DrawInReVote = ({ roomState, setRoomState }: any) => {
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
      <Text style={styles.title}>{activeLanguage?.drawInReVote}</Text>
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
            setRoomState((prev: any) => ({
              ...prev,
              drawInReVote: "Release all",
            }));
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              roomState.drawInReVote === "Release all"
                ? theme.active
                : "rgba(255,255,255,0.05)",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color:
                roomState.drawInReVote === "Release all" ? "white" : theme.text,
              fontWeight: 600,
            }}
            numberOfLines={1}
          >
            {activeLanguage?.releaseAll}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setRoomState((prev: any) => ({
              ...prev,
              drawInReVote: "Jail all",
            }));
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              roomState.drawInReVote === "Jail all"
                ? theme.active
                : "rgba(255,255,255,0.05)",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color:
                roomState.drawInReVote === "Jail all" ? "white" : theme.text,
              fontWeight: 600,
            }}
            numberOfLines={1}
          >
            {activeLanguage?.jailAll}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setRoomState((prev: any) => ({
              ...prev,
              drawInReVote: "People decide",
            }));
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
          }}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor:
              roomState.drawInReVote === "People decide"
                ? theme.active
                : "rgba(255,255,255,0.05)",
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color:
                roomState.drawInReVote === "People decide"
                  ? "white"
                  : theme.text,
              fontWeight: 600,
            }}
            numberOfLines={1}
          >
            {activeLanguage?.peopleDecide}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default DrawInReVote;

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

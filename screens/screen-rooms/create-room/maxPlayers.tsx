import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppContext } from "../../../context/app";
import * as Haptics from "expo-haptics";

const MaxPlayers = ({ setNumericPopup, setRoomState, roomState }: any) => {
  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

  // styles
  const styles = createStyles(theme);
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.title}>Max Players</Text>
      <Pressable
        style={styles.numericValue}
        onPress={() => {
          setNumericPopup({
            title: "Max Players",
            min: 4,
            max: 16,
            selectedValue: roomState.options.maxPlayers,
            step: 1,
            active: true,
            setValue: (e: number) => {
              setRoomState((prev: any) => ({
                ...prev,
                options: { ...prev.options, maxPlayers: e },
              }));
              setNumericPopup({
                title: "",
                min: 0,
                max: 0,
                selectedValue: 0,
                step: 0,
                active: false,
                setValue: undefined,
              });
            },
          });
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        }}
      >
        <Text style={{ color: theme.text, fontWeight: 500 }}>
          {roomState.options.maxPlayers}
        </Text>
      </Pressable>
    </View>
  );
};

export default MaxPlayers;

const createStyles = (theme: any) =>
  StyleSheet.create({
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
    numericValue: {
      padding: 4,
      paddingHorizontal: 12,
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 8,
      width: 80,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
  });

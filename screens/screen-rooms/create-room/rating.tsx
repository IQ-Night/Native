import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppContext } from "../../../context/app";
import * as Haptics from "expo-haptics";
import { DefineUserLevel } from "../../../functions/userLevelOptimizer";
import { useAuthContext } from "../../../context/auth";

const Rating = ({ setNumericPopup, setRoomState, roomState }: any) => {
  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  // styles
  const styles = createStyles(theme);

  const currentUserRating = DefineUserLevel({ user: currentUser });
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.title}>Minimum Rating</Text>
      <Pressable
        style={styles.numericValue}
        onPress={() => {
          setNumericPopup({
            title: "Minimum Rating",
            min: 1,
            max: currentUserRating?.current,
            selectedValue: roomState.rating.min,
            step: 1,
            active: true,
            setValue: (e: number) => {
              setRoomState((prev: any) => ({
                ...prev,
                rating: { ...prev.rating, min: e },
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
          {roomState.rating.min}
        </Text>
      </Pressable>
    </View>
  );
};

export default Rating;

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

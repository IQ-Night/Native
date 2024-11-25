import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/app";
import * as Haptics from "expo-haptics";

const MaxMafias = ({ setNumericPopup, setRoomState, roomState }: any) => {
  /**
   * App context
   */
  const { theme, haptics, activeLanguage } = useAppContext();

  const [maxValue, setMaxValue] = useState(6);

  useEffect(() => {
    if (roomState?.options.maxPlayers) {
      let maxMafias = 6; // Default value

      // Convert maxPlayers to a number before comparing
      const maxPlayers = Number(roomState.options.maxPlayers);

      // Check if maxPlayers is 4 or 5, then set maxMafias to 1
      if (maxPlayers === 4 || maxPlayers === 5) {
        maxMafias = 1; // Set maxMafias to 1 when maxPlayers is 4 or 5
      } else if (maxPlayers > 5 && maxPlayers < 9) {
        maxMafias = 2;
      } else if (maxPlayers === 9 || maxPlayers === 10) {
        maxMafias = 3;
      } else if (maxPlayers > 10 && maxPlayers < 14) {
        maxMafias = 4;
      } else if (maxPlayers === 14 || maxPlayers === 15) {
        maxMafias = 5;
      } else {
        maxMafias = 6;
      }

      setMaxValue(maxMafias);

      if (maxMafias === 1) {
        let don = roomState?.roles.find((r: any) => r.value === "mafia-don");
        if (don) {
          setRoomState((prev: any) => ({
            ...prev,
            roles: prev.roles?.filter((r: any) => r.value !== "mafia"),
          }));
        }
      }

      setRoomState((prev: any) => {
        // Only update the state if maxMafias has changed
        if (prev?.options?.maxMafias !== maxMafias) {
          return {
            ...prev,
            options: {
              ...prev.options,
              maxMafias,
            },
          };
        }

        // No state update required
        return prev;
      });
    }
  }, [roomState?.options.maxPlayers, setRoomState]);

  useEffect(() => {
    if (parseInt(roomState?.options?.maxMafias) === 1) {
      let don = roomState?.roles.find((r: any) => r.value === "mafia-don");
      if (don) {
        setRoomState((prev: any) => ({
          ...prev,
          roles: prev.roles?.filter((r: any) => r.value !== "mafia"),
        }));
      }
    }
  }, [roomState?.options?.maxMafias]);

  // styles
  const styles = createStyles(theme);
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.title}>{activeLanguage?.maxMafias}</Text>
      <Pressable
        style={styles.numericValue}
        onPress={() => {
          setNumericPopup({
            title: activeLanguage?.maxMafias,
            min: 1,
            max: maxValue,
            selectedValue: roomState.options.maxMafias,
            step: 1,
            active: true,
            setValue: (e: number) => {
              setRoomState((prev: any) => ({
                ...prev,
                options: { ...prev.options, maxMafias: e },
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
          {roomState.options.maxMafias}
        </Text>
      </Pressable>
    </View>
  );
};

export default MaxMafias;

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

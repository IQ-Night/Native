import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import Input from "../../../components/input";
import { useAppContext } from "../../../context/app";
import { Switch } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";

const Private = ({ roomState, setRoomState, totalPrice }: any) => {
  /**
   * App context
   */
  const { theme, activeLanguage } = useAppContext();

  // styles
  const styles = createStyles(theme);
  return (
    <View style={{ width: "100%", gap: 8 }}>
      <View style={styles.fieldContainer}>
        <Text style={styles.title}>{activeLanguage?.private}</Text>
        <View
          style={{
            width: 80,
            alignItems: "center",
          }}
        >
          {Platform.OS === "ios" ? (
            <Switch
              trackColor={{
                false: theme.background2,
                true: theme.active,
              }}
              value={roomState.private.value}
              style={{
                transform: [{ scaleX: 1 }, { scaleY: 1 }],
              }}
              onValueChange={() => {
                setRoomState((prev: any) => ({
                  ...prev,
                  private: {
                    ...prev.private,
                    value: !prev.private.value,
                  },
                }));
              }}
            />
          ) : (
            <Pressable
              onPress={async () => {
                setRoomState((prev: any) => ({
                  ...prev,
                  private: {
                    ...prev.private,
                    value: !prev.private.value,
                  },
                }));
              }}
            >
              <Text style={{ color: theme.active }}>
                {activeLanguage?.active}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {roomState.private.value && (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View style={{ width: "50%" }}>
            <Input
              value={roomState.private.code}
              placeholder={`${activeLanguage.code}*`}
              maxLength={8}
              type="numeric"
              onChangeText={(e: string) =>
                setRoomState((prev: any) => ({
                  ...prev,
                  private: { ...roomState.private, code: e },
                }))
              }
            />
          </View>

          {totalPrice?.private > 0 && roomState?.private?.active && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FontAwesome5 name="coins" size={14} color={theme.active} />
              <Text style={{ fontWeight: 500, color: theme.text }}> 4</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Private;

const createStyles = (theme: any) =>
  StyleSheet.create({
    fieldContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    title: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 16,
    },
  });

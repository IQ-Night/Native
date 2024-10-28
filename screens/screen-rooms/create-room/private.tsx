import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import Input from "../../../components/input";
import { useAppContext } from "../../../context/app";
import { Switch } from "react-native-paper";

const Private = ({ roomState, setRoomState }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  // styles
  const styles = createStyles(theme);
  return (
    <View style={{ width: "100%", gap: 8 }}>
      <View style={styles.fieldContainer}>
        <Text style={styles.title}>Private</Text>
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
              <Text style={{ color: theme.active }}>Active</Text>
            </Pressable>
          )}
        </View>
      </View>

      {roomState.private.value && (
        <View style={{ width: "70%" }}>
          <Input
            value={roomState.private.code}
            placeholder="Code*"
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
    },
    title: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 16,
    },
  });

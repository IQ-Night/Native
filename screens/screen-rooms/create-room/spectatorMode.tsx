import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Switch } from "react-native-paper";
import { useAppContext } from "../../../context/app";

const SpectatorMode = ({ roomState, setRoomState }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();
  return (
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
          value={roomState.spectatorMode}
          style={{
            transform: [{ scaleX: 1 }, { scaleY: 1 }],
          }}
          onValueChange={() => {
            setRoomState((prev: any) => ({
              ...prev,
              spectatorMode: !prev.spectatorMode,
            }));
          }}
        />
      ) : (
        <Pressable
          onPress={async () => {
            setRoomState((prev: any) => ({
              ...prev,
              spectatorMode: !prev.spectatorMode,
            }));
          }}
        >
          <Text style={{ color: theme.active }}>Active</Text>
        </Pressable>
      )}
    </View>
  );
};

export default SpectatorMode;

const styles = StyleSheet.create({});

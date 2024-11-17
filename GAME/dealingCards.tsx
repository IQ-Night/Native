import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Button from "../components/button";
import { useAppContext } from "../context/app";
import { BlurView } from "expo-blur";
import { useGameContext } from "../context/game";
import { useAuthContext } from "../context/auth";
import { roles } from "../context/rooms";

const DealingCards = ({ timeController, loading, setLoading }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Game context
   */
  const { gamePlayers, socket, activeRoom } = useGameContext();

  /**
   * როლის დადასტურების ფუნქცია
   */

  const ConfirmRole = () => {
    if (socket) {
      setLoading(true);
      socket.emit("confirmRole", {
        roomId: activeRoom._id,
        userId: currentUser._id,
      });
    }
  };

  const currentUserRole = gamePlayers.find(
    (user: any) => user.userId === currentUser._id
  )?.role;
  const roleLabel = roles?.find(
    (r: any) => r.value === currentUserRole?.value
  )?.label;

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        position: "absolute",
        top: 0,
        zIndex: 60,
        width: "100%",
        height: "100%",
      }}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          paddingVertical: "10%",
        }}
      >
        <View
          style={{
            width: "60%",
            aspectRatio: 0.8,
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: theme.text, fontSize: 24 }}>{roleLabel}</Text>
        </View>
        <View style={{ width: "90%" }}>
          <Button
            loading={loading}
            title={
              timeController > 0 ? `Confirm ${timeController}s.` : "Confirm"
            }
            onPressFunction={ConfirmRole}
            style={{
              backgroundColor: theme.active,
              color: "white",
              width: "100%",
            }}
          />
        </View>
      </View>
    </BlurView>
  );
};

export default DealingCards;

const styles = StyleSheet.create({});

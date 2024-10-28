import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { BlurView } from "expo-blur";
import { useAppContext } from "../context/app";

// sticky loader with overlay background

export const BackDrop = ({ loading, setLoading }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  const toggleLoader = () => {
    setLoading(!loading);
  };

  return (
    <View style={styles.container}>
      <Modal transparent visible={loading} onRequestClose={toggleLoader}>
        <BlurView intensity={20} tint="dark" style={styles.backdrop}>
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <BlurView intensity={60} tint="dark" style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.active} />
            </BlurView>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 10000,
  },
  button: {
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    padding: 20,
    borderRadius: 20,
  },
});

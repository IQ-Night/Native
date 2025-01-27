import { BlurView } from "expo-blur";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../components/button";
import { useAppContext } from "../context/app";
import * as Haptics from "expo-haptics";

const DeleteConfirm = ({
  text,
  closeDeleteConfirm,
  slideAnim,
  loadingDelete,
  Function,
}: any) => {
  const { activeLanguage, haptics } = useAppContext();
  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        zIndex: 90,
      }}
    >
      <Pressable
        onPress={() => {
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
          closeDeleteConfirm();
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Animated.View
          style={[
            styles.confirmPopup,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <BlurView intensity={120} tint="dark" style={styles.confirmBlur}>
            <Text style={styles.confirmText}>{text}</Text>
            <View style={styles.confirmButtons}>
              <Button
                title={activeLanguage?.cancel}
                style={styles.cancelButton}
                onPressFunction={closeDeleteConfirm}
              />
              <Button
                loading={loadingDelete}
                title={activeLanguage?.delete}
                style={styles.removeButton}
                onPressFunction={Function}
              />
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default DeleteConfirm;

const styles = StyleSheet.create({
  confirmPopup: {
    height: 300,
    zIndex: 80,
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  confirmBlur: {
    width: "100%",
    height: 300,
    padding: 24,
    paddingTop: 48,
    gap: 32,
  },
  confirmText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  cancelButton: {
    width: "45%",
    backgroundColor: "#888",
    color: "white",
  },
  removeButton: {
    width: "45%",
    backgroundColor: "red",
    color: "white",
  },
});

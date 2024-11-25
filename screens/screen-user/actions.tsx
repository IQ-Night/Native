import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Easing,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import * as Haptics from "expo-haptics";

const Actions = ({
  loading,
  user,
  setOpenReport,
  setOpenSendWarnings,
  from,
  setOpenBlock,
  usersClans,
  setOpenClanBan,
}: any) => {
  const { theme, haptics, activeLanguage } = useAppContext();
  const { currentUser } = useAuthContext();

  // Ref for the animated scale value
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Determine if any button should be visible
  const canShowReport =
    currentUser?._id !== user?._id &&
    user?.admin.role !== "App Admin" &&
    !currentUser?.admin.active;

  const canShowWarning =
    currentUser?._id !== user?._id &&
    !user?.admin?.active &&
    currentUser?.admin?.active;

  const canShowBlock =
    currentUser?.admin?.active &&
    user?.userId !== currentUser?._id &&
    !user?.admin?.active &&
    from !== "room";

  const canShowClanBan = usersClans?.length > 0;

  // Trigger scale animation when component mounts
  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    return () => {
      // Optional scale-out effect on component unmount
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    };
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {!loading && (
        <View style={styles.actionWrapper}>
          {canShowReport && (
            <Pressable
              onPress={() => {
                if (haptics)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                setOpenReport(true);
              }}
              style={styles.actionButton}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.active, fontSize: 16 },
                ]}
              >
                {activeLanguage?.report}
              </Text>
              <MaterialIcons name="report" size={16} color={theme.active} />
            </Pressable>
          )}

          {canShowWarning && (
            <Pressable
              onPress={() => {
                if (haptics)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                setOpenSendWarnings(true);
              }}
              style={styles.actionButton}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.active, fontSize: 16 },
                ]}
              >
                {activeLanguage?.warning}
              </Text>
              <MaterialIcons name="warning" size={14} color={theme.active} />
            </Pressable>
          )}

          {canShowBlock && (
            <Pressable
              onPress={() => {
                if (haptics)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                setOpenBlock(true);
              }}
              style={styles.actionButton}
            >
              <Text style={[styles.buttonText, { color: "red", fontSize: 16 }]}>
                {activeLanguage?.block}
              </Text>
              <MaterialCommunityIcons
                name="block-helper"
                size={12}
                color="red"
              />
            </Pressable>
          )}

          {canShowClanBan && (
            <Pressable
              onPress={() => {
                if (haptics)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                setOpenClanBan(true);
              }}
              style={styles.actionButton}
            >
              <Text style={[styles.buttonText, { color: "red", fontSize: 16 }]}>
                {activeLanguage?.clanBan}
              </Text>
              <MaterialCommunityIcons
                name="block-helper"
                size={12}
                color="red"
              />
            </Pressable>
          )}

          {/* If no actions are available, show a message */}
          {!canShowReport &&
            !canShowWarning &&
            !canShowBlock &&
            !canShowClanBan && (
              <Text style={styles.noActionsText}>
                {activeLanguage?.no_action_for_user}
              </Text>
            )}
        </View>
      )}
    </Animated.View>
  );
};

export default Actions;

const styles = StyleSheet.create({
  container: {
    width: 250,
    backgroundColor: "black",
    padding: 8,
    position: "absolute",
    right: 0,
    zIndex: 80,
    marginTop: 60,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 }, // Large vertical offset
    shadowOpacity: 1,
    shadowRadius: 50, // Large blur radius

    // Box Shadow for Android
    elevation: 50,
  },
  actionWrapper: {
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    justifyContent: "center",
    padding: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  noActionsText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});

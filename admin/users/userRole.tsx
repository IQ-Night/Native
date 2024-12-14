import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useGameContext } from "../../context/game";
import { useNotificationsContext } from "../../context/notifications";
import { MaterialIcons } from "@expo/vector-icons";

const UserRole = ({ setManageRoles, userId, manageRoles, setUsers }: any) => {
  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();
  const { socket, activeRoom } = useGameContext();
  const { currentUser } = useAuthContext();

  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const closeBlock = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setManageRoles(false));
  };

  /**
   * Notification context
   */
  const { SendNotification } = useNotificationsContext();
  const [loading, setLoading] = useState(false);
  const oldRole = manageRoles?.admin;
  const [adminRole, setAdminRole] = useState<any>(manageRoles?.admin);

  const SaveRole = async () => {
    setLoading(true);

    try {
      const response = await axios.patch(`${apiUrl}/api/v1/users/${userId}`, {
        admin: adminRole,
      });

      if (response?.data?.status === "success") {
        socket.emit("rerenderAuthUser", { userId });

        SendNotification({
          userId: userId,
          type: adminRole?.active ? "becomeAdmin" : "removedFromAdminList",
        });
        setUsers((prev: any) =>
          prev.map((user: any) => {
            if (user?._id === userId) {
              return { ...user, admin: adminRole };
            } else {
              return user;
            }
          })
        );
        setManageRoles(null);
      }
    } catch (error: any) {
      console.log("Error:", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={[StyleSheet.absoluteFill, { zIndex: 80 }]}
    >
      <Pressable style={styles.container} onPress={closeBlock}>
        <Animated.View
          style={[
            styles.animatedView,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: theme.text }]}>
              {activeLanguage?.manage_role_for} {manageRoles?.name}
            </Text>
          </View>

          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.pickerContainer}
          >
            <Pressable
              onPress={
                adminRole?.role === "App Admin"
                  ? () => setAdminRole({ active: false, fole: "" })
                  : () => setAdminRole({ active: true, role: "App Admin" })
              }
              style={{
                width: "100%",
                padding: 12,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor:
                  adminRole?.role === "App Admin"
                    ? theme.active
                    : "rgba(255,255,255,0.1)",
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  color:
                    adminRole?.role === "App Admin" ? theme.active : theme.text,
                }}
              >
                {activeLanguage?.app_admin}
              </Text>

              {adminRole?.role === "App Admin" && (
                <MaterialIcons
                  name="done"
                  color={theme.active}
                  style={{ marginLeft: "auto" }}
                  size={18}
                />
              )}
            </Pressable>
            <Pressable
              onPress={
                adminRole?.role === "Game Admin"
                  ? () => setAdminRole({ active: false, fole: "" })
                  : () => setAdminRole({ active: true, role: "Game Admin" })
              }
              style={{
                width: "100%",
                padding: 12,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor:
                  adminRole?.role === "Game Admin"
                    ? theme.active
                    : "rgba(255,255,255,0.1)",
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  color:
                    adminRole?.role === "Game Admin"
                      ? theme.active
                      : theme.text,
                }}
              >
                {activeLanguage?.game_admin}{" "}
              </Text>

              {adminRole?.role === "Game Admin" && (
                <MaterialIcons
                  name="done"
                  color={theme.active}
                  style={{ marginLeft: "auto" }}
                  size={18}
                />
              )}
            </Pressable>
          </Pressable>

          <Button
            title={activeLanguage?.save}
            style={{
              backgroundColor: theme.active,
              width: "100%",
              color: "white",
            }}
            loading={loading}
            onPressFunction={() => SaveRole()}
            disabled={_.isEqual(oldRole, adminRole)}
          />
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default UserRole;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    bottom: 60,
  },
  animatedView: {
    width: "90%",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
  },
  pickerContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    width: "100%",
    padding: 8,
    gap: 8,
  },
});

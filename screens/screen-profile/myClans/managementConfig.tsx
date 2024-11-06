import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../../context/app";
import Img from "../../../components/image";
import Button from "../../../components/button";
import { useProfileContext } from "../../../context/profile";
import axios from "axios";
import * as Haptics from "expo-haptics";
import { useContentContext } from "../../../context/content";
import { useClansContext } from "../../../context/clans";
import { useNotificationsContext } from "../../../context/notifications";
import { useAuthContext } from "../../../context/auth";

const ManagementConfig = ({
  clan,
  openConfig,
  setOpenConfig,
  setItem,
}: any) => {
  const { theme, apiUrl, haptics } = useAppContext();
  const { GetClans, setConfirm, setClans } = useProfileContext();
  const oldRole = clan?.admin.find(
    (a: any) => a.user._id === openConfig?._id
  )?.role;
  const [newRole, setNewRole] = useState<any>(null);
  useEffect(() => {
    setNewRole(
      clan?.admin.find((a: any) => a.user._id === openConfig?._id)?.role
    );
  }, [oldRole]);

  const { currentUser } = useAuthContext();

  /**
   * Notifications context
   */
  const { setClansNotifications, clansNotifications, SendNotification } =
    useNotificationsContext();

  const [loadingSave, setLoadingSave] = useState(false);
  const SaveRole = async () => {
    setLoadingSave(true);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + clan?._id + "/addRole",
        {
          user: openConfig?._id,
          role: newRole,
        }
      );
      if (response.data.status === "success") {
        GetClans();
        setLoadingSave(false);
        setItem((prev: any) => ({ ...prev, admin: response.data.data.admin }));
        SendNotification({
          userId: openConfig?._id,
          type:
            "Founder has given new role '" +
            newRole +
            "' in clan '" +
            clan?.title +
            "' ",
        });
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };
  console.log(clan.members);
  const ChangeFounder = async (role: any) => {
    try {
      let newRoles = clan?.admin.filter(
        (a: any) => a.user._id !== openConfig?._id
      );

      newRoles = newRoles?.map((a: any) => {
        if (a.role === "founder") {
          return { ...a, role: "director" };
        } else {
          return a;
        }
      });
      newRoles.push({ user: openConfig, role: "founder" });

      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + clan?._id,
        {
          admin: newRoles?.map((nr: any) => {
            return { user: nr.user?._id, role: nr.role };
          }),
        }
      );
      if (response?.data.status === "success") {
        setItem((prev: any) => ({ ...prev, admin: newRoles }));
        setClans((prev: any) =>
          prev?.map((c: any) => {
            if (c._id === clan._id) {
              return { ...c, admin: newRoles };
            } else {
              return c;
            }
          })
        );
        setOpenConfig(null);
        setConfirm(null);
        clan.members?.map((m: any) => {
          if (m.userId !== currentUser?._id) {
            if (m?.userId === openConfig?._id) {
              return SendNotification({
                userId: m.userId,
                type:
                  "Founder has given you main founder role" +
                  "' in clan '" +
                  clan?.title +
                  "' ",
              });
            } else {
              return SendNotification({
                userId: m.userId,
                type:
                  "Founder has changed " + "' in clan '" + clan?.title + "'",
              });
            }
          }
        });
      }
    } catch (error: any) {
      console.log(error.response);
    }
  };

  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <Pressable
        onPress={() => {
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
          setOpenConfig(null);
        }}
        style={{ position: "absolute", top: 24, right: 24, zIndex: 80 }}
      >
        <MaterialCommunityIcons name="close" size={28} color={theme.active} />
      </Pressable>
      <View
        style={{
          width: "90%",
          position: "relative",
          bottom: "5%",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <BlurView
          intensity={100}
          tint="dark"
          style={{
            width: "100%",
            padding: 16,
            gap: 16,
          }}
        >
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View
              style={{
                width: "25%",
                aspectRatio: 1,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <Img uri={openConfig?.cover} />
            </View>
            <View style={{ gap: 8 }}>
              <Text
                style={{ color: theme.text, fontWeight: 500, fontSize: 16 }}
              >
                Name:{" "}
                <Text style={{ color: theme.active }}>{openConfig?.name}</Text>
              </Text>

              <Text
                style={{ color: theme.text, fontWeight: 500, fontSize: 16 }}
              >
                Role:{" "}
                <Text style={{ color: theme.active }}>
                  {newRole
                    ? newRole?.charAt(0).toUpperCase() + newRole?.slice(1)
                    : "No role"}
                </Text>
              </Text>
            </View>
          </View>
          <Text style={{ fontWeight: 600, color: theme.text }}>
            Give a role to user:
          </Text>
          <View style={{ gap: 8, alignItems: "center" }}>
            {clan?.admin.find((a: any) => a.role === "founder")?.user._id ===
              currentUser?._id && (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  if (newRole === "founder") {
                    setNewRole(null);
                  } else {
                    setNewRole("founder");
                  }
                }}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor:
                    newRole === "founder"
                      ? theme.active
                      : "rgba(255,255,255,0.05)",
                }}
              >
                <Text
                  style={{
                    fontWeight: 500,
                    color: newRole === "founder" ? "white" : theme.text,
                    textAlign: "center",
                  }}
                >
                  Founder
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                if (newRole === "director") {
                  setNewRole(null);
                } else {
                  setNewRole("director");
                }
              }}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                backgroundColor:
                  newRole === "director"
                    ? theme.active
                    : "rgba(255,255,255,0.05)",
              }}
            >
              <Text
                style={{
                  fontWeight: 500,
                  color: newRole === "director" ? "white" : theme.text,
                  textAlign: "center",
                }}
              >
                Director
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                if (newRole === "manager") {
                  setNewRole(null);
                } else {
                  setNewRole("manager");
                }
              }}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                backgroundColor:
                  newRole === "manager"
                    ? theme.active
                    : "rgba(255,255,255,0.05)",
              }}
            >
              <Text
                style={{
                  fontWeight: 500,
                  color: newRole === "manager" ? "white" : theme.text,
                  textAlign: "center",
                }}
              >
                Manager
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                if (newRole === "wiser") {
                  setNewRole(null);
                } else {
                  setNewRole("wiser");
                }
              }}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                backgroundColor:
                  newRole === "wiser" ? theme.active : "rgba(255,255,255,0.05)",
              }}
            >
              <Text
                style={{
                  fontWeight: 500,
                  color: newRole === "wiser" ? "white" : theme.text,
                  textAlign: "center",
                }}
              >
                Wiser
              </Text>
            </Pressable>
          </View>
          <Button
            style={{
              width: "100%",
              backgroundColor: theme.active,
              color: "white",
            }}
            title="Save"
            onPressFunction={
              newRole === "founder"
                ? () =>
                    setConfirm({
                      active: true,
                      text: "After give the founde role to user, you no longer will be founder of this clan. are you sure?",
                      confirmText: "Change Founder",
                      confirmAction: () => ChangeFounder(newRole),
                    })
                : SaveRole
            }
            disabled={oldRole === newRole}
            loading={loadingSave}
          />
        </BlurView>
      </View>
    </BlurView>
  );
};

export default ManagementConfig;

const styles = StyleSheet.create({});

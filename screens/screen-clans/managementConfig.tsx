import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useNotificationsContext } from "../../context/notifications";
import { useProfileContext } from "../../context/profile";
import { useClansContext } from "../../context/clans";
import { Confirm } from "../../components/confirm";

const ManagementConfig = ({
  clan,
  openConfig,
  setOpenConfig,
  setItem,
}: any) => {
  /**
   * App context
   */
  const { theme, apiUrl, haptics, activeLanguage } = useAppContext();

  /**
   * Clan context
   */
  const { GetClans, confirm, setConfirm, setClans } = useClansContext();

  /**
   * roles options
   */
  const oldRole = clan?.admin.find(
    (a: any) => a.user.id === openConfig?._id
  )?.role;

  const [newRole, setNewRole] = useState<any>(null);

  useEffect(() => {
    setNewRole(
      clan?.admin.find((a: any) => a.user.id === openConfig?._id)?.role
    );
  }, [oldRole]);

  /**
   * Auth context
   */

  const { currentUser } = useAuthContext();

  /**
   * Notifications context
   */
  const { SendNotification } = useNotificationsContext();

  /**
   * Role actions
   */
  const [loadingSave, setLoadingSave] = useState(false);

  const SaveRole = async () => {
    setLoadingSave(true);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + clan?._id + "/addRole",
        {
          user: { id: openConfig?._id, name: openConfig?.name },
          role: newRole,
        }
      );
      if (response.data.status === "success") {
        GetClans();
        setLoadingSave(false);
        setItem((prev: any) => ({ ...prev, admin: response.data.data.admin }));
        SendNotification({
          userId: openConfig?._id,
          type: "newRoleByFounder",
          newRole,
          title: clan?.title,
        });
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  const ChangeFounder = async (role: any) => {
    try {
      let newRoles = clan?.admin.filter(
        (a: any) => a.user.id !== openConfig?._id
      );

      newRoles = newRoles?.map((a: any) => {
        if (a.role === "founder") {
          return { ...a, role: "director" };
        } else {
          return a;
        }
      });
      newRoles.push({
        user: { id: openConfig?._id, name: openConfig?.name },
        role: "founder",
      });

      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + clan?._id,
        {
          admin: newRoles?.map((nr: any) => {
            return {
              user: { id: nr.user?.id, name: nr.user?.name },
              role: nr.role,
            };
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
                type: "mainFounderRoleAssigned",
                title: clan?.title,
              });
            } else {
              return SendNotification({
                userId: m.userId,
                type: "founderChanged",
                title: clan?.title,
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
    <>
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
                  {activeLanguage?.name}:{" "}
                  <Text style={{ color: theme.active }}>
                    {openConfig?.name}
                  </Text>
                </Text>

                <Text
                  style={{
                    color: theme.text,
                    fontWeight: 500,
                    fontSize: 16,
                    maxWidth: "85%",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {activeLanguage?.role}:{" "}
                  <Text style={{ color: theme.active, maxWidth: 40 }}>
                    {newRole ? activeLanguage[newRole] : activeLanguage?.noRole}
                  </Text>
                </Text>
              </View>
            </View>
            <Text style={{ fontWeight: 600, color: theme.text }}>
              {activeLanguage?.giveRole}
            </Text>
            <View style={{ gap: 8, alignItems: "center" }}>
              {clan?.admin.find((a: any) => a.role === "founder")?.user.id ===
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
                    {activeLanguage?.founder}
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
                  {activeLanguage?.director}
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
                  {activeLanguage?.manager}
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
                    newRole === "wiser"
                      ? theme.active
                      : "rgba(255,255,255,0.05)",
                }}
              >
                <Text
                  style={{
                    fontWeight: 500,
                    color: newRole === "wiser" ? "white" : theme.text,
                    textAlign: "center",
                  }}
                >
                  {activeLanguage?.wiser}
                </Text>
              </Pressable>
            </View>
            <Button
              style={{
                width: "100%",
                backgroundColor: theme.active,
                color: "white",
              }}
              title={activeLanguage?.save}
              onPressFunction={
                newRole === "founder"
                  ? () =>
                      setConfirm({
                        active: true,
                        text: activeLanguage?.after_founder_change,
                        confirmText: activeLanguage?.changeFounder,
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
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default ManagementConfig;

const styles = StyleSheet.create({});

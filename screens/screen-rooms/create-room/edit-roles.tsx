import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { roles } from "../../../context/rooms";
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import FlipCard from "../../../context/flipCard";
import roleImageGenerator from "../../../functions/roleImageGenerator";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Roles = ({ roomState, setRoomState, setOpenRoleInfo, oldData }: any) => {
  /**
   * App context
   */
  const { theme, haptics, language } = useAppContext();
  /**
   * App context
   */
  const { currentUser } = useAuthContext();

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {roles.map((item: any, index: number) => {
        const roleImage: any = roleImageGenerator({
          role: item.value,
          language,
        });
        return (
          <Pressable
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              if (
                roomState.roles.find((r: any) => r.value.includes(item.value))
              ) {
                if (roomState?.options?.maxMafias > 1) {
                  if (roomState.roles?.find((r: any) => r.value === "mafia")) {
                    setRoomState((prev: any) => ({
                      ...prev,
                      roles: prev.roles.filter(
                        (i: any) => i.value !== item.value
                      ),
                    }));
                  } else {
                    setRoomState((prev: any) => ({
                      ...prev,
                      roles: [...prev?.roles, item],
                    }));
                  }
                }
              } else {
                if (
                  roomState?.options?.maxMafias === 1 &&
                  item?.value === "mafia-don"
                ) {
                  const updatedRoles = roomState?.roles?.filter(
                    (r: any) => r.value !== "mafia"
                  );
                  setRoomState((prev: any) => ({
                    ...prev,
                    roles: [...updatedRoles, item],
                  }));
                }
                if (
                  roomState?.options?.maxMafias === 1 &&
                  item?.value === "mafia"
                ) {
                  const updatedRoles = roomState?.roles?.filter(
                    (r: any) => r.value !== "mafia-don"
                  );
                  setRoomState((prev: any) => ({
                    ...prev,
                    roles: [...updatedRoles, item],
                  }));
                } else {
                  setRoomState((prev: any) => ({
                    ...prev,
                    roles: [...prev.roles, item],
                  }));
                }
              }
            }}
            key={index}
            style={{
              width: (SCREEN_WIDTH - 49) / 3,
              height: 180,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <View
              style={{
                overflow: "hidden",
                width: (SCREEN_WIDTH - 49) / 3,
                height: 180,
              }}
            >
              <FlipCard
                img={roleImage}
                setOpenRoleInfo={setOpenRoleInfo}
                item={item}
                roomState={roomState}
                sizes={{ width: (SCREEN_WIDTH - 58) / 3, height: 180 }}
              />
            </View>
            {item.price && !currentUser?.vip?.active && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                }}
              >
                <FontAwesome5 name="coins" size={14} color="orange" />
                <Text style={{ color: theme.text, fontWeight: 500 }}>
                  {item.price}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default Roles;

const styles = StyleSheet.create({});

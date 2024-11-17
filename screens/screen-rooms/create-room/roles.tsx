import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { roles } from "../../../context/rooms";
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Roles = ({ roomState, setRoomState, setOpenRoleInfo }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();
  /**
   * Auth context
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
        return (
          <Pressable
            onPress={() => {
              if (
                roomState.roles.find((r: any) => r.value.includes(item.value))
              ) {
                if (
                  item.value !== "mafia" ||
                  (item.value === "mafia" &&
                    roomState.roles?.find((r: any) => r.value === "mafia-don"))
                ) {
                  if (roomState?.options?.maxMafias > 1) {
                    if (
                      roomState.roles?.find((r: any) => r.value === "mafia")
                    ) {
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
                }
              } else {
                console.log("run");
                if (
                  roomState?.options?.maxMafias === 1 &&
                  item?.value === "mafia-don"
                ) {
                  console.log("run");
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
                  console.log("run");
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
              height: 150,
              backgroundColor: "#333",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              borderWidth: 2,
              borderColor: roomState.roles.find(
                (i: any) => i.value === item.value
              )
                ? theme.active
                : "gray",
            }}
          >
            <FontAwesome6
              onPress={() => setOpenRoleInfo(item)}
              name="circle-info"
              size={18}
              color={theme.text}
              style={{ position: "absolute", top: 8, right: 8 }}
            />
            <Text>{item.label}</Text>
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
            {roomState.roles.includes(item) && (
              <MaterialIcons
                name="done"
                size={18}
                color={theme.active}
                style={{ position: "absolute", bottom: 8, right: 8 }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default Roles;

const styles = StyleSheet.create({});

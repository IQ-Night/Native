import { FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import FlipCard from "../../../components/flipCard";
import { roles } from "../../../context/rooms";
import roleImageGenerator from "../../../functions/roleImageGenerator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Roles = ({ roomState, setRoomState, setOpenRoleInfo }: any) => {
  /**
   * App context
   */
  const { theme, language, haptics } = useAppContext();
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
        const roleImage: any = roleImageGenerator({
          role: item,
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
              borderRadius: 10,
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
                sizes={{
                  width: (SCREEN_WIDTH - 58) / 3,
                  height: 180,
                  borderRadius: 16,
                }}
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

import { createStackNavigator } from "@react-navigation/stack";
import { useState } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { Confirm } from "../components/confirm";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import Chats from "../screens/screen-chat/main";
import Clan from "../screens/screen-clans/clan-screen";
import Coins from "../screens/screen-coins/coins";
import Logs from "../screens/screen-logs/main";
import Rooms from "../screens/screen-rooms/main";
import User from "../screens/screen-user/main";
import Vip from "../screens/screen-VIP/main";
import Chat from "../screens/screen-chat/chat/main";
import Img from "../components/image";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";

const RoomssStackNavigator = () => {
  /**
   * Screen stacks
   */
  const RoomStack = createStackNavigator();
  /**
   * Auth stacks
   */
  const { currentUser } = useAuthContext();

  /**
   * App context
   */
  const { theme, haptics, activeLanguage } = useAppContext();

  const [confirm, setConfirm] = useState<any>(null);

  return (
    <>
      <RoomStack.Navigator
        screenOptions={{
          cardStyle: { backgroundColor: "#111" }, // Set the entire navigator background to transparent
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#111",
          },
          headerTintColor: theme.text,
        }}
      >
        <RoomStack.Screen
          name="Rooms List"
          component={Rooms}
          options={{
            headerShown: false,
          }}
        />

        <RoomStack.Screen
          name="User"
          component={User}
          options={({ route, navigation }: any) => ({
            headerTitle: "",
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.goBack();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="arrow-left" size={42} color={theme.text} />
                <Text
                  style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
                >
                  {route.params?.item?.name || "User"}
                </Text>
              </Pressable>
            ),
          })}
        />

        <RoomStack.Screen
          name="Logs"
          component={Logs}
          options={({ route, navigation }: any) => ({
            headerTitle: "",
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.goBack();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="arrow-left" size={42} color={theme.text} />
                <Text
                  numberOfLines={1}
                  style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
                >
                  {activeLanguage?.logs}
                </Text>
              </Pressable>
            ),
          })}
        />
        <RoomStack.Screen
          name="Coins"
          options={({ route, navigation }: any) => ({
            headerTitle: "",
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.goBack();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="arrow-left" size={42} color={theme.text} />
                <Text
                  style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
                >
                  {activeLanguage?.coins}
                </Text>
              </Pressable>
            ),
          })}
          component={Coins}
        />
        <RoomStack.Screen
          name="Vip"
          component={Vip}
          options={({ route, navigation }: any) => ({
            headerTitle: "",
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.goBack();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="arrow-left" size={42} color={theme.text} />
                <Text
                  style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
                >
                  VIP
                </Text>
              </Pressable>
            ),
          })}
        />
        <RoomStack.Screen
          name="Chats"
          options={({ route, navigation }: any) => ({
            headerTitle: "",
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.goBack();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="arrow-left" size={42} color={theme.text} />
                <Text
                  style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
                >
                  {activeLanguage?.chats}
                </Text>
              </Pressable>
            ),
          })}
          component={Chats}
        />
        <RoomStack.Screen
          name="Chat"
          component={Chat}
          options={({ route, navigation }: any) => ({
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.goBack();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="arrow-left" size={42} color={theme.text} />
              </Pressable>
            ),

            headerTitle: () => {
              const user = route.params?.chat?.members?.find(
                (member: any) => member.id !== currentUser?._id
              );
              return (
                <Pressable
                  onPress={() => {
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                    if (route?.params?.chat?.type?.value === "user") {
                      navigation.navigate("User", {
                        item: { ...user, _id: user?.id },
                      });
                    } else {
                      navigation.navigate("Clan", {
                        item: route?.params?.chat?.type?.clan,
                      });
                    }
                  }}
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 50,
                      overflow: "hidden",
                    }}
                  >
                    {route?.params?.chat?.type?.value === "user" ? (
                      <Img uri={user?.cover} />
                    ) : (
                      <Img uri={route?.params?.chat?.type?.clan?.cover} />
                    )}
                  </View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      maxWidth: "70%",
                      color: theme.text,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {route?.params?.chat?.type?.value === "user" ? (
                      user?.name
                    ) : (
                      <Text>
                        <Text style={{ color: theme.active }}>Clan: </Text>
                        {route?.params?.chat?.type?.clan?.title}
                      </Text>
                    )}
                  </Text>
                </Pressable>
              );
            },
          })}
        />
        <RoomStack.Screen
          name="Clan"
          component={Clan}
          options={({ route, navigation }: any) => ({
            headerTitle: "",
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.goBack();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MaterialIcons name="arrow-left" size={42} color={theme.text} />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      borderRadius: 2,
                      overflow: "hidden",
                      marginRight: 8,
                    }}
                  >
                    <CountryFlag
                      isoCode={route.params?.item?.language} // Assuming language code is passed in the item
                      size={16} // Adjust the size as needed
                    />
                  </View>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 18,
                      maxWidth: "80%",
                      fontWeight: 600,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {route.params?.item?.title || "Clan"}
                  </Text>
                </View>
              </Pressable>
            ),
          })}
        />
      </RoomStack.Navigator>
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default RoomssStackNavigator;

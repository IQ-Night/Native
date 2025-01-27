import { createStackNavigator } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { Confirm } from "../components/confirm";
import Img from "../components/image";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import Chat from "../screens/screen-chat/chat/main";
import Chats from "../screens/screen-chat/main";
import Clan from "../screens/screen-clans/clan-screen";
import Clans from "../screens/screen-clans/main";
import Members from "../screens/screen-clans/members";
import Coins from "../screens/screen-coins/coins";
import User from "../screens/screen-user/main";
import Vip from "../screens/screen-VIP/main";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useClansContext } from "../context/clans";

const ClansStackNavigator = () => {
  /**
   * Screen stacks
   */
  const ClanStack = createStackNavigator();

  /**
   * App context
   */
  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();
  /**
   * Clan context
   */
  const { setUpdateClanState, openDeleteConfirm } = useClansContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  const [confirm, setConfirm] = useState<any>(null);

  return (
    <>
      <ClanStack.Navigator
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
        <ClanStack.Screen
          name="Clans List"
          component={Clans}
          options={{
            headerShown: false,
          }}
        />
        <ClanStack.Screen
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
        <ClanStack.Screen
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
        <ClanStack.Screen
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
        <ClanStack.Screen
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
        {/* <ClanStack.Screen
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
        /> */}
        <ClanStack.Screen
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      borderRadius: 2,
                      overflow: "hidden",
                      marginRight: 8,
                    }}
                  >
                    <CountryFlag
                      isoCode={route.params?.item?.language}
                      size={16}
                    />
                  </View>

                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 18,
                      width: "65%",
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

            headerRight: () => (
              <View
                style={{
                  height: 40,
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingHorizontal: 16,
                  gap: 12,
                }}
              >
                {currentUser._id ===
                  route.params.item.admin.find((a: any) => a.role === "founder")
                    .user.id && (
                  <>
                    <MaterialIcons
                      name="edit"
                      size={24}
                      color={theme.active}
                      onPress={() => {
                        setUpdateClanState("Edit Title");
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                      }}
                    />

                    <MaterialCommunityIcons
                      onPress={() => {
                        openDeleteConfirm("clan");
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                      }}
                      name="delete"
                      size={24}
                      color="red"
                    />
                  </>
                )}
              </View>
            ),
            // Add focus and blur event listeners
            listeners: {
              focus: () => {
                console.log("Clan screen is focused");
                // Run any function here when "Clan" screen becomes active
              },
              blur: () => {
                console.log("Clan screen is blurred");
                // Run any cleanup or other function when "Clan" screen loses focus
              },
            },
          })}
        />
        <ClanStack.Screen
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
      </ClanStack.Navigator>
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default ClansStackNavigator;

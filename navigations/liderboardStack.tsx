import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import Block from "../admin/users/block-user";
import { Confirm } from "../components/confirm";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import Clan from "../screens/screen-clans/clan-screen";
import Coins from "../screens/screen-coins/coins";
import Liderboard from "../screens/screen-liderboard/main";
import User from "../screens/screen-user/main";
import Vip from "../screens/screen-VIP/main";

const LiderboardStackNavigator = () => {
  /**
   * Screen stacks
   */
  const LiderboardStack = createStackNavigator();

  /**
   * App context
   */
  const { apiUrl, theme, haptics } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  const [confirm, setConfirm] = useState<any>(null);

  return (
    <>
      <LiderboardStack.Navigator
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
        <LiderboardStack.Screen
          name="Liderboard List"
          component={Liderboard}
          options={{
            headerShown: false,
          }}
        />
        <LiderboardStack.Screen
          name="Clan"
          component={Clan}
          options={({ route, navigation }: any) => ({
            headerTitle: () => (
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
                  style={{ color: theme.text, fontSize: 18, maxWidth: "80%" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {route.params?.item?.title || "Clan"}
                </Text>
              </View>
            ),
          })}
        />
        <LiderboardStack.Screen
          name="User"
          component={User}
          options={({ route }: any) => ({
            title: route.params?.item?.name || "User",
          })}
        />
        <LiderboardStack.Screen name="Coins" component={Coins} />
        <LiderboardStack.Screen name="Vip" component={Vip} />
      </LiderboardStack.Navigator>
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default LiderboardStackNavigator;

import { createStackNavigator } from "@react-navigation/stack";
import React, { useState } from "react";
import { Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useClansContext } from "../context/clans";
import Clan from "../screens/screen-clans/clan-screen";
import Clans from "../screens/screen-clans/main";
import Members from "../screens/screen-clans/members";
import User from "../screens/screen-user/main";
import { Confirm } from "../components/confirm";
import Coins from "../screens/screen-coins/coins";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ClansStackNavigator = () => {
  /**
   * Screen stacks
   */
  const ClanStack = createStackNavigator();

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
                <Text style={{ color: theme.text, fontSize: 18 }}>
                  {route.params?.item?.title || "Clan"}
                </Text>
              </View>
            ),
          })}
        />
        <ClanStack.Screen
          name="User"
          component={User}
          options={({ route }: any) => ({
            title: route.params?.item?.name || "User",
            headerRight: () => (
              <MaterialCommunityIcons
                name="block-helper"
                size={19}
                color="red"
              />
            ),
          })}
        />
        <ClanStack.Screen name="Members" component={Members} />
        <ClanStack.Screen name="Coins" component={Coins} />
      </ClanStack.Navigator>
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default ClansStackNavigator;

import { createStackNavigator } from "@react-navigation/stack";
import React, { useState } from "react";
import { Confirm } from "../components/confirm";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import Coins from "../screens/screen-coins/coins";
import Store from "../screens/screen-store/main";
import Clan from "../screens/screen-clans/clan-screen";
import { Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import User from "../screens/screen-user/main";
import Vip from "../screens/screen-VIP/main";

const StoreStackNavigator = () => {
  /**
   * Screen stacks
   */
  const StoreStack = createStackNavigator();

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
      <StoreStack.Navigator
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
        <StoreStack.Screen
          name="Store List"
          component={Store}
          options={{
            headerShown: false,
          }}
        />

        <StoreStack.Screen name="Coins" component={Coins} />
        <StoreStack.Screen name="Vip" component={Vip} />
        <StoreStack.Screen
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
        <StoreStack.Screen
          name="User"
          component={User}
          options={({ route }: any) => ({
            title: route.params?.item?.name || "User",
          })}
        />
      </StoreStack.Navigator>
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default StoreStackNavigator;

import { createStackNavigator } from "@react-navigation/stack";
import React, { useState } from "react";
import { Confirm } from "../components/confirm";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import Coins from "../screens/screen-coins/coins";
import Store from "../screens/screen-store/main";

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
      </StoreStack.Navigator>
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default StoreStackNavigator;

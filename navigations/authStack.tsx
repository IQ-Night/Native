import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import ChoiceAuth from "../auth/choiceAuth";
import Login from "../auth/login";
import Register from "../auth/register";
import { useAppContext } from "../context/app";
import Landing from "../screens/screen-landing/main";

const AuthStackNavigator = () => {
  /**
   * Screen stacks
   */
  const AuthStack = createStackNavigator();

  /**
   * App context
   */
  const { theme } = useAppContext();

  return (
    <AuthStack.Navigator
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
      <AuthStack.Screen
        name="Landing"
        component={Landing}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Choice Auth" component={ChoiceAuth} />
      <AuthStack.Screen name="Register" component={Register} />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;

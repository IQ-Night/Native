import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import AdminDashboard from "../admin/dashboard/main";
import { useAppContext } from "../context/app";
import Products from "../admin/products/main";
import Users from "../admin/users/main";

const AdminStackNavigator = () => {
  /**
   * Screen stacks
   */
  const AdminStack = createStackNavigator();

  /**
   * App context
   */
  const { theme } = useAppContext();

  return (
    <AdminStack.Navigator
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
      <AdminStack.Screen
        name="Admin-Stack"
        component={AdminDashboard}
        options={{
          headerShown: false,
        }}
      />
      <AdminStack.Screen name="Products" component={Products} />
      <AdminStack.Screen name="Users" component={Users} />
    </AdminStack.Navigator>
  );
};

export default AdminStackNavigator;

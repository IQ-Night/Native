import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import AdminDashboard from "../admin/dashboard/main";
import { useAppContext } from "../context/app";
import Products from "../admin/products/main";
import Users from "../admin/users/main";
import Management from "../admin/Management/main";
import User from "../screens/screen-user/main";
import Clan from "../screens/screen-clans/clan-screen";
import { Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AdminStackNavigator = () => {
  /**
   * Screen stacks
   */
  const AdminStack = createStackNavigator();

  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

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
      <AdminStack.Screen name="Management" component={Management} />
      <AdminStack.Screen name="Users" component={Users} />
      <AdminStack.Screen name="Products" component={Products} />
      <AdminStack.Screen
        name="User"
        component={User}
        options={({ route }: any) => ({
          title: route.params?.item?.name || "User",
          headerRight: () => (
            <MaterialCommunityIcons name="block-helper" size={19} color="red" />
          ),
        })}
      />
      <AdminStack.Screen
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
    </AdminStack.Navigator>
  );
};

export default AdminStackNavigator;

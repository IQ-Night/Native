import { createStackNavigator } from "@react-navigation/stack";
import React, { useState } from "react";
import AdminDashboard from "../admin/dashboard/main";
import { useAppContext } from "../context/app";
import Products from "../admin/products/main";
import Users from "../admin/users/main";
import Management from "../admin/Management/main";
import User from "../screens/screen-user/main";
import Clan from "../screens/screen-clans/clan-screen";
import { Pressable, Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Block from "../admin/users/block-user";
import * as Haptics from "expo-haptics";
import { useAuthContext } from "../context/auth";
import Reports from "../admin/reports/main";
import BlackList from "../admin/blackList/main";
import Incomes from "../admin/incomes/main";
import IncomeStats from "../admin/incomes/statistics";
import { useNavigation } from "@react-navigation/native";
import Messages from "../admin/messages/main";
import Coupons from "../admin/coupons/main";

const AdminStackNavigator = () => {
  /**
   * Screen stacks
   */
  const AdminStack = createStackNavigator();

  /**
   * App context
   */
  const { theme, haptics, activeLanguage } = useAppContext();

  // auth stack
  const { currentUser } = useAuthContext();

  const navigation: any = useNavigation();

  return (
    <>
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
        <AdminStack.Screen
          name="Incomes"
          component={Incomes}
          options={({ route }: any) => ({
            title: activeLanguage?.incomes,
            headerRight: () => (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.navigate("IncomeStats");
                }}
                style={{ padding: 4, marginRight: 12 }}
              >
                <MaterialCommunityIcons
                  color={theme.active}
                  size={20}
                  name="chart-bar"
                />
              </Pressable>
            ),
          })}
        />
        <AdminStack.Screen
          name="IncomeStats"
          options={({ route }: any) => ({
            title: activeLanguage?.statistics,
          })}
          component={IncomeStats}
        />
        <AdminStack.Screen
          name="Management"
          options={({ route }: any) => ({
            title: activeLanguage?.management,
          })}
          component={Management}
        />
        <AdminStack.Screen
          name="Users"
          options={({ route }: any) => ({
            title: activeLanguage?.users,
          })}
          component={Users}
        />
        <AdminStack.Screen
          name="Black List"
          options={({ route }: any) => ({
            title: activeLanguage?.blacklist,
          })}
          component={BlackList}
        />
        <AdminStack.Screen
          name="Products"
          options={({ route }: any) => ({
            title: activeLanguage?.products,
          })}
          component={Products}
        />
        <AdminStack.Screen
          name="Messages"
          options={({ route }: any) => ({
            title: activeLanguage?.notifications,
          })}
          component={Messages}
        />
        <AdminStack.Screen
          name="Reports"
          options={({ route }: any) => ({
            title: activeLanguage?.reports,
          })}
          component={Reports}
        />
        <AdminStack.Screen
          name="Coupons"
          options={({ route }: any) => ({
            title: activeLanguage?.coupons,
          })}
          component={Coupons}
        />
        <AdminStack.Screen
          name="User"
          component={User}
          options={({ route }: any) => ({
            title: route.params?.item?.name || "User",
          })}
        />
        <AdminStack.Screen
          name="Clan"
          component={Clan}
          options={({ route }: any) => ({
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
    </>
  );
};

export default AdminStackNavigator;

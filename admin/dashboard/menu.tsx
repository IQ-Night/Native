import { StyleSheet, Text, View } from "react-native";
import React from "react";
import MenuItem from "./menu-item";
import { useAppContext } from "../../context/app";

const Menu = ({ navigation }: any) => {
  const { activeLanguage } = useAppContext();
  /**
   * Menu items
   */
  const items = [
    {
      screen: "Incomes",
      label: activeLanguage?.incomes,
    },
    {
      screen: "Users",
      label: activeLanguage?.users,
    },
    {
      screen: "Management",
      label: activeLanguage?.management,
    },
    {
      screen: "Products",
      label: activeLanguage?.products,
    },
    {
      screen: "Black List",
      label: activeLanguage?.blacklist,
    },
    {
      screen: "Reports",
      label: activeLanguage?.reports,
    },
  ];
  return (
    <View style={{ flex: 1, padding: 12, paddingHorizontal: 8, gap: 8 }}>
      {items.map((item: any, index: number) => {
        return <MenuItem key={index} item={item} navigation={navigation} />;
      })}
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({});

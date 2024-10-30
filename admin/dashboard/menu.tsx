import { StyleSheet, Text, View } from "react-native";
import React from "react";
import MenuItem from "./menu-item";

const Menu = ({ navigation }: any) => {
  /**
   * Menu items
   */
  const items = [
    {
      screen: "Management",
      label: "Management",
    },
    {
      screen: "Users",
      label: "Users",
    },
    {
      screen: "Products",
      label: "Products",
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

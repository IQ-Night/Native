import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Menu from "./menu";

const AdminDashboard = ({ navigation }: any) => {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 48,
      }}
    >
      <View
        style={{
          width: "100%",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.1)",
        }}
      >
        <Text style={{ color: "white", fontSize: 24, fontWeight: 600 }}>
          Admin Dashboard
        </Text>
      </View>

      <Menu navigation={navigation} />
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({});

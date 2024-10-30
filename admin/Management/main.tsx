import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/app";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";

const Management = () => {
  /**
   * App context
   */
  const { apiUrl, theme } = useAppContext();

  /**
   * Management team
   */
  const [management, setManagement] = useState([]);

  useEffect(() => {
    const GetManagement = async () => {
      try {
        const response = await axios.get(apiUrl + "/api/v1/admin/management");
        if (response.data.status === "success") {
          setManagement(response.data.data.management);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    GetManagement();
  }, []);

  console.log(management);

  return (
    <View style={{ padding: 16 }}>
      {management?.map((member: any, index: number) => {
        return (
          <View
            key={index}
            style={{
              padding: 12,
              backgroundColor: "rgba(255,255,255,0.05)",
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
              {member?.name}
            </Text>
            <Text
              style={{ color: theme.active, fontSize: 16, fontWeight: 500 }}
            >
              {member?.admin?.role}
            </Text>
            <MaterialIcons
              style={{ marginLeft: "auto" }}
              name="edit"
              color={theme.active}
              size={20}
            />
          </View>
        );
      })}
    </View>
  );
};

export default Management;

const styles = StyleSheet.create({});

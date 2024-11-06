import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/app";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import UserItem from "../users/user-item";
import UserRole from "../users/userRole";

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

  // manage user role
  const [manageRoles, setManageRoles] = useState<any>(null);
  return (
    <>
      <View style={{ padding: 16 }}>
        {management?.map((member: any, index: number) => {
          return (
            <UserItem
              key={index}
              item={member}
              index={index}
              setManageRoles={setManageRoles}
            />
          );
        })}
      </View>
      {manageRoles && (
        <UserRole
          userId={manageRoles?._id}
          manageRoles={manageRoles}
          setManageRoles={setManageRoles}
          setUsers={setManagement}
        />
      )}
    </>
  );
};

export default Management;

const styles = StyleSheet.create({});

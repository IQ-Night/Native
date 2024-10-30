import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/app";
import axios from "axios";
import UserItem from "./user-item";

const Users = () => {
  /**
   * App context
   */
  const { apiUrl, theem } = useAppContext();

  /**
   * Liderboard state
   */
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const GetUsers = async () => {
      try {
        const response = await axios.get(apiUrl + "/api/v1/users");
        if (response.data.status === "success") {
          setUsers(response.data.data.users);
        }
      } catch (error: any) {
        console.log(error);
      }
    };
    GetUsers();
  }, []);

  return (
    <View>
      <ScrollView>
        <View style={styles.row}>
          {users?.map((item: any, index: number) => {
            return <UserItem key={index} item={item} index={index} />;
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Users;

const styles = StyleSheet.create({
  row: {
    paddingBottom: 88,
    position: "relative",
    paddingHorizontal: 4,
  },
});

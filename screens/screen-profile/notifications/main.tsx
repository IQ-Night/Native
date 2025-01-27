import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import List from "./list";
import axios from "axios";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useNotificationsContext } from "../../../context/notifications";
import { BlurView } from "expo-blur";
import { ActivityIndicator } from "react-native-paper";
import * as Haptics from "expo-haptics";
import DeleteConfirm from "../../../components/deleteConfirm";

const Notifications = () => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  /**
   * Notifications context
   */
  const { setNotifications } = useNotificationsContext();
  /**
   * Delete notification
   */
  const [loading, setLoading] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const DeleteNotification = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        apiUrl +
          "/api/v1/users/" +
          currentUser?._id +
          "/notifications/" +
          deleteItem
      );
      if (response.data.status === "success") {
        setNotifications((prev: any) =>
          prev.filter((notif: any) => notif.notificationId !== deleteItem)
        );
        closeDeleteConfirm();
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * Delete
   */

  // Animation for confirmation popup
  const deleteAnim = useRef(new Animated.Value(300)).current; // Start off-screen

  const openDeleteConfirm = (data: any) => {
    setDeleteItem(data);
    Animated.timing(deleteAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeDeleteConfirm = () => {
    Animated.timing(deleteAnim, {
      toValue: 300, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setDeleteItem(null));
  };

  return (
    <View style={{ minHeight: "100%" }}>
      <List openDeleteConfirm={openDeleteConfirm} />
      {deleteItem && (
        <DeleteConfirm
          closeDeleteConfirm={closeDeleteConfirm}
          text={activeLanguage?.confirm}
          Function={DeleteNotification}
          loadingDelete={loading}
          slideAnim={deleteAnim}
        />
      )}
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({});

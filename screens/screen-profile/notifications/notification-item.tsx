import axios from "axios";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Img from "../../../components/image";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useNotificationsContext } from "../../../context/notifications";
import GetTimesAgo from "../../../functions/getTimesAgo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const NotificationItem = ({ item, setDeleteItem }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  /**
   * Notifications context
   */
  const { setNotifications } = useNotificationsContext();

  /**
   * Read notification
   */

  const ReadNotification = async () => {
    try {
      setNotifications((prev: any) =>
        prev.map((notif: any) => {
          // Check if the notification is the one being marked as read
          if (notif.notificationId === item.notificationId) {
            // Return updated notification with status "read"
            return { ...notif, status: "read" };
          }
          // Return the notification unchanged
          return notif;
        })
      );
      const response = await axios.patch(
        `${apiUrl}/api/v1/users/${currentUser?._id}/notifications/${item.notificationId}`,
        {
          ...item,
          status: "read",
        }
      );

      if (response.data.status !== "success") {
        setNotifications((prev: any) => prev);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <TouchableOpacity
      onPress={
        item.status === "unread"
          ? () => ReadNotification()
          : () => setDeleteItem(item.notificationId)
      }
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          borderColor:
            item.status === "unread" ? theme.active : "rgba(255,255,255,0.1)",
        },
      ]}
    >
      <View style={styles.wrapper}>
        <View
          style={{
            width: "100%",
            gap: 8,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              height: 30,
              width: 30,
              borderRadius: 100,
              overflow: "hidden",
            }}
          >
            <Img uri={item?.sender?.cover} />
          </View>
          <View
            style={{ maxWidth: "45%", height: 30, justifyContent: "center" }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {item?.sender?.name}
            </Text>
          </View>
          <View style={{ height: 30, justifyContent: "center" }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 14,

                fontWeight: 500,
              }}
            >
              {GetTimesAgo(item.createdAt)}
            </Text>
          </View>
        </View>

        <View
          style={{ minHeight: 30, width: "100%", justifyContent: "center" }}
        >
          <Text
            style={{
              width: "100%",
              color: item.status === "unread" ? theme.active : theme.text,
              fontSize: 14,
              fontWeight: 500,
              // textAlign: "center",
              flexWrap: "wrap",
              lineHeight: 22,
            }}
          >
            {item?.type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 18,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    // Box shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 4,
  },

  wrapper: {
    width: "100%",
    padding: 12,
    gap: 4,
  },
});

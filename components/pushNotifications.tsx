import axios from "axios";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";

export default function PushNotificationsActivation() {
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const { apiUrl, appStatePosition } = useAppContext();
  const { currentUser, setCurrentUser } = useAuthContext();

  // Change notification value
  const changeNotifValue = async (token: string) => {
    try {
      const response = await axios.patch(
        `${apiUrl}/api/v1/users/${currentUser?._id}`,
        {
          pushNotificationsToken: token,
          pushNotifications: true,
        }
      );
      if (response.data.status === "success") {
        setCurrentUser((prev: any) => ({ ...prev, pushNotifications: true }));
      }
    } catch (error: any) {
      console.log("change notif value error");
      console.log(error.response?.data);
    }
  };

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowAlert: appStatePosition === "active" ? false : true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
  useEffect(() => {
    if (currentUser?._id) {
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          changeNotifValue(token);
        }
      });
    }

    notificationListener.current =
      Notifications.addNotificationReceivedListener(
        (notification: Notifications.Notification) => {
          setNotification(notification);
        }
      );

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response: Notifications.NotificationResponse) => {
          console.log("Notification response received:", response);
        }
      );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [currentUser?._id]);

  return <View></View>;
}

// Function to register for push notifications
export async function registerForPushNotificationsAsync() {
  let token: string | undefined;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants?.expoConfig?.extra?.eas.projectId,
      })
    ).data;
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

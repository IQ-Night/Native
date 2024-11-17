import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { usePushNotifications } from "../context/pushNotifications";
import Constants from "expo-constants";
import axios from "axios";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import CryptoJS from "crypto-js";

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function PushNotificationsActivation() {
  const { setActive } = usePushNotifications();
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const { apiUrl } = useAppContext();
  const { currentUser } = useAuthContext();

  // Change notification value
  const changeNotifValue = async (token: string) => {
    // Hash the token with SHA-256
    const hashedToken = CryptoJS.SHA256(token).toString();
    try {
      const response = await axios.patch(
        `${apiUrl}/api/v1/users/${currentUser?._id}`,
        {
          pushNotificationsToken: hashedToken,
        }
      );
      if (response.data.status === "success") {
        console.log("push token has been set to user");
      }
    } catch (error: any) {
      console.log("change notif value error");
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      console.log(token);
      if (token) {
        await AsyncStorage.setItem("IQ-Night:pushNotifications", "true");
        await AsyncStorage.setItem(
          "IQ-Night:pushNotificationsToken",
          JSON.stringify(token)
        );
        changeNotifValue(token);
        setActive(true);
      } else {
        await AsyncStorage.setItem("IQ-Night:pushNotifications", "false");
        setActive(false);
      }
    });

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
  }, []);

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

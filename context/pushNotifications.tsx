import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const PushNotificationsContext = createContext<any>(null);

export const usePushNotifications = () => useContext(PushNotificationsContext);

export const PushNotificationsProvider = ({ children }: any) => {
  const [active, setActive] = useState<any>(false);

  useEffect(() => {
    const GetPushNotifications = async () => {
      const pushNotif = await AsyncStorage.getItem(
        "IQ-Night:pushNotifications"
      );
      setActive(pushNotif || false);
    };
    GetPushNotifications();
  }, []);

  return (
    <PushNotificationsContext.Provider value={{ active, setActive }}>
      {children}
    </PushNotificationsContext.Provider>
  );
};

import React, { useEffect } from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";
import Alert from "./components/alert";
import BgSound from "./components/backgroundMusic";
import Loading from "./components/loading";
import { useAppContext } from "./context/app";
import { useContentContext } from "./context/content";
import BottomTabNavigator from "./navigations/bottomTabNavigator";
import { useGameContext } from "./context/game";
import { useAuthContext } from "./context/auth";
import PushNotificationsActivation from "./components/pushNotifications";
import ConfirmAction from "./components/confirmAction";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Content = () => {
  /**
   * App context
   */
  const { loading, alert, setAlert, apptheme, theme, haptics } =
    useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  /**
   * Content context
   */
  const { confirmAction, setConfirmAction } = useContentContext();
  console.log(confirmAction);
  return (
    <View style={styles.background}>
      <BgSound />
      {currentUser && <PushNotificationsActivation />}
      <StatusBar
        barStyle={apptheme === "light" ? `dark-content` : "light-content"}
      />

      <BottomTabNavigator />

      {loading && <Loading />}

      {confirmAction?.active && (
        <ConfirmAction
          openState={confirmAction}
          setOpenState={setConfirmAction}
          Function={confirmAction?.Function}
        />
      )}

      {alert.active && (
        <Alert
          active={alert.active}
          text={alert.text}
          type={alert.type}
          onClose={() => setAlert({ active: false, text: "", type: "" })}
        />
      )}
    </View>
  );
};

export default Content;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#222",
  },
  container: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

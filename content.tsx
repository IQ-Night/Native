import { useEffect, useRef } from "react";
import {
  AppState,
  AppStateStatus,
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import Alert from "./components/alert";
import BgSound from "./components/backgroundMusic";
import Loading from "./context/loading";
import { useAppContext } from "./context/app";
import { useContentContext } from "./context/content";
import BottomTabNavigator from "./navigations/bottomTabNavigator";
import { useGameContext } from "./context/game";
import { useAuthContext } from "./context/auth";
import PushNotificationsActivation from "./components/pushNotifications";
import ConfirmAction from "./components/confirmAction";
import AddationalFields from "./auth/addationalFields";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Content = () => {
  /**
   * App context
   */
  const { loading, alert, setAlert, apptheme, theme, setAppStatePosition } =
    useAppContext();
  /**
   * Auth context
   */
  const { currentUser, addationalFields, setCurrentUser } = useAuthContext();
  /**
   * Content context
   */
  const { confirmAction, setConfirmAction } = useContentContext();
  /**
   * Game context
   */
  const { socket } = useGameContext();

  /**
   * app position controller
   */
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");
      }

      if (nextAppState === "background") {
        console.log("App is in the background!");
      }

      appState.current = nextAppState;
      setAppStatePosition(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // mannually logout when needed
  useEffect(() => {
    const logout = async () => {
      try {
        // ამოშალე JWT ტოკენები
        await AsyncStorage.removeItem("IQ-Night:jwtToken");
        await AsyncStorage.removeItem("IQ-Night:jwtRefreshToken");

        // მომხმარებლის მონაცემების განულება
        setCurrentUser(null);
      } catch (error) {
        console.log("Logout failed:", error);
      }
    };
    if (socket) {
      socket.on("logout-user", logout);
      return () => {
        socket.off("logout-user", logout);
      };
    }
  }, [socket]);

  return (
    <View style={styles.background}>
      <BgSound />
      {currentUser && <PushNotificationsActivation />}
      <StatusBar
        barStyle={apptheme === "light" ? `dark-content` : "light-content"}
      />

      {addationalFields && <AddationalFields />}
      <BottomTabNavigator />

      {loading && <Loading />}

      {confirmAction?.active && (
        <ConfirmAction
          openState={confirmAction}
          setOpenState={setConfirmAction}
          Function={confirmAction?.Function}
          money={confirmAction?.money}
        />
      )}

      {alert.active && (
        <Alert
          active={alert.active}
          text={alert.text}
          type={alert.type}
          onClose={() => setAlert({ active: false, text: "", type: "" })}
          button={alert?.button}
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
    backgroundColor: "#000",
  },
  container: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});

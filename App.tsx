import { Dimensions, StatusBar, View } from "react-native";
import Content from "./content";
import { AdminContextWrapper } from "./context/admin";
import { AppContextWrapper, useAppContext } from "./context/app";
import { AuthContextWrapper } from "./context/auth";
import { ChatContextWrapper } from "./context/chat";
import { ContentContextWrapper } from "./context/content";
import { GameContextWrapper } from "./context/game";
import { NotificationsContextWrapper } from "./context/notifications";
import appConfig from "./app.config";
import { useEffect, useState } from "react";
import axios from "axios";
import { BlurView } from "expo-blur";
import { Update } from "./components/update";
import * as SplashScreen from "expo-splash-screen";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  useEffect(() => {
    const hideSplashScreen = async () => {
      // 3-წამიანი დაგვიანება
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // დამალვა
      await SplashScreen.hideAsync();
    };

    hideSplashScreen();
  }, []);
  /**
   * define app version
   *  */
  const currentVersion = appConfig.expo.version;

  const [appVersion, setAppVersion] = useState(null);

  function versionToNumber(version: any) {
    return version?.split(".").map(Number);
  }

  const current = versionToNumber(currentVersion);
  const app = versionToNumber(appVersion);

  // const apiUrl = "http://192.168.100.2:5000";
  const apiUrl = "https://iq-night-acb3bc094c45.herokuapp.com";

  useEffect(() => {
    const DefineAppVersion = async () => {
      try {
        const response = await axios.get(apiUrl + "/version");
        setAppVersion(response.data);
      } catch (error) {
        console.log("DefineAppVersion error");
        console.log(error);
      }
    };
    DefineAppVersion();
  }, []);

  return (
    <AppContextWrapper>
      {current > app && (
        <BlurView
          intensity={100}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            zIndex: 10000,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
          }}
        >
          <Update currentVersion={currentVersion} appVersion={appVersion} />
        </BlurView>
      )}
      <AuthContextWrapper>
        <ContentContextWrapper>
          <GameContextWrapper>
            <NotificationsContextWrapper>
              <AdminContextWrapper>
                <ChatContextWrapper>
                  <Content />
                </ChatContextWrapper>
              </AdminContextWrapper>
            </NotificationsContextWrapper>
          </GameContextWrapper>
        </ContentContextWrapper>
      </AuthContextWrapper>
    </AppContextWrapper>
  );
}

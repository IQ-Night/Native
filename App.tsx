import { useFonts } from "expo-font";
import Content from "./content";
import { AppContextWrapper } from "./context/app";
import { AuthContextWrapper } from "./context/auth";
import { ContentContextWrapper } from "./context/content";
import { GameContextWrapper } from "./context/game";
import { NotificationsContextWrapper } from "./context/notifications";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { Text } from "react-native";
import { AdminContextWrapper } from "./context/admin";

export default function App() {
  // const [fontsLoaded] = useFonts({
  //   Montserrat_400Regular,
  //   Montserrat_700Bold,
  // });
  return (
    <AppContextWrapper>
      <AuthContextWrapper>
        <ContentContextWrapper>
          <GameContextWrapper>
            <NotificationsContextWrapper>
              <AdminContextWrapper>
                <Content />
              </AdminContextWrapper>
            </NotificationsContextWrapper>
          </GameContextWrapper>
        </ContentContextWrapper>
      </AuthContextWrapper>
    </AppContextWrapper>
  );
}

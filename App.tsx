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
              <Content />
            </NotificationsContextWrapper>
          </GameContextWrapper>
        </ContentContextWrapper>
      </AuthContextWrapper>
    </AppContextWrapper>
  );
}

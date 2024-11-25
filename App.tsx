import Content from "./content";
import { AdminContextWrapper } from "./context/admin";
import { AppContextWrapper } from "./context/app";
import { AuthContextWrapper } from "./context/auth";
import { ChatContextWrapper } from "./context/chat";
import { ContentContextWrapper } from "./context/content";
import { GameContextWrapper } from "./context/game";
import { NotificationsContextWrapper } from "./context/notifications";
import { PushNotificationsProvider } from "./context/pushNotifications";

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
            <PushNotificationsProvider>
              <NotificationsContextWrapper>
                <AdminContextWrapper>
                  <ChatContextWrapper>
                    <Content />
                  </ChatContextWrapper>
                </AdminContextWrapper>
              </NotificationsContextWrapper>
            </PushNotificationsProvider>
          </GameContextWrapper>
        </ContentContextWrapper>
      </AuthContextWrapper>
    </AppContextWrapper>
  );
}

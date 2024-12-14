import { StatusBar, View } from "react-native";
import Content from "./content";
import { AdminContextWrapper } from "./context/admin";
import { AppContextWrapper } from "./context/app";
import { AuthContextWrapper } from "./context/auth";
import { ChatContextWrapper } from "./context/chat";
import { ContentContextWrapper } from "./context/content";
import { GameContextWrapper } from "./context/game";
import { NotificationsContextWrapper } from "./context/notifications";

export default function App() {
  return (
    <AppContextWrapper>
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

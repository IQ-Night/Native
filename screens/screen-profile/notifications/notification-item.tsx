import axios from "axios";
import * as Haptics from "expo-haptics";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Img from "../../../components/image";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useNotificationsContext } from "../../../context/notifications";
import GetTimesAgo from "../../../functions/getTimesAgo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const NotificationItem = ({ item, openDeleteConfirm }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, language } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  /**
   * Notifications context
   */
  const { setNotifications, setUnreadNotifications } =
    useNotificationsContext();

  /**
   * Read notification
   */

  const ReadNotification = async () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    try {
      setNotifications((prev: any) =>
        prev.map((notif: any) => {
          // Check if the notification is the one being marked as read
          if (notif.notificationId === item.notificationId) {
            // Return updated notification with status "read"
            return { ...notif, status: "read" };
          }
          // Return the notification unchanged
          return notif;
        })
      );
      setUnreadNotifications((prev: any) =>
        prev.filter((p: any) => p.notificationId !== item?.notificationId)
      );
      const response = await axios.patch(
        `${apiUrl}/api/v1/users/${currentUser?._id}/notifications/${item.notificationId}`,
        {
          ...item,
          status: "read",
        }
      );

      if (response.data.status !== "success") {
        setNotifications((prev: any) => prev);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  /**
   * modify item text defined by current user language
   */

  const ModifyText = (text: string) => {
    const splitedText = text?.split(" ");
    if (splitedText?.includes("Sent") && splitedText?.includes("coins!")) {
      if (language === "GE") {
        return "გამოგიგზავნათ საჩუქრად " + splitedText[2] + " ქოინი!";
      } else if (language === "RU") {
        return "Oтправили вам подарок " + splitedText[2] + " Монета!";
      } else {
        return text;
      }
    } else if (
      splitedText?.includes("Sent") &&
      splitedText?.includes("asset")
    ) {
      if (language === "GE") {
        return "გამოგიგზავნათ საჩუქრად ავატარი " + splitedText[3];
      } else if (language === "RU") {
        return "Oтправили вам подарок Аватар " + splitedText[3];
      } else {
        return text;
      }
    } else if (splitedText?.includes("userJoinedClan")) {
      if (language === "GE") {
        return "დაეთანხმა კლანში გაწევრიანებას";
      } else if (language === "RU") {
        return "Согласился вступить в клан";
      } else {
        return "Agreed to join the clan";
      }
    } else if (splitedText?.includes("joinRequestDenied")) {
      if (language === "GE") {
        return "უარყო კლანში გაწევრიანება";
      } else if (language === "RU") {
        return "Отказано во вступлении в клан";
      } else {
        return "Denied joining the clan";
      }
    } else if (splitedText?.includes("leftClan")) {
      if (language === "GE") {
        return "დატოვა კლანი";
      } else if (language === "RU") {
        return "Покинул клан";
      } else {
        return "Left the clan";
      }
    } else if (splitedText?.includes("removedFromClan")) {
      if (language === "GE") {
        return "ადმინმა გაგაგდოთ კლანიდან";
      } else if (language === "RU") {
        return "Администратор выгнал вас из клана";
      } else {
        return "The admin has kicked you out of the clan";
      }
    } else if (splitedText?.includes("newRoleByFounder")) {
      if (language === "GE") {
        return "მოგანიჭათ ახალი როლი კლანში";
      } else if (language === "RU") {
        return "Вам назначена новая роль в клане";
      } else {
        return "You have been assigned a new role in the clan";
      }
    } else if (splitedText?.includes("joinRequestDeclinedByAdmin")) {
      if (language === "GE") {
        return "ადმინმა უარყო თქვენი კლანში გაწევრიანების მოთხოვნა";
      } else if (language === "RU") {
        return "Администратор отклонил Ваш запрос на вступление в клан";
      } else {
        return "The admin has denied your request to join the clan";
      }
    } else if (splitedText?.includes("joinRequestApprovedByAdmin")) {
      if (language === "GE") {
        return "გილოცავთ! ადმინმი დაეთანხმა თქვენი კლანში გაწევრიანების მოთხოვნას";
      } else if (language === "RU") {
        return "Поздравляю! Администратор одобрил Вашу заявку на вступление в клан";
      } else {
        return "Congratulations! The admin has approved your request to join the clan";
      }
    } else if (splitedText?.includes("bannedInClan")) {
      if (language === "GE") {
        return "ადმინმა დაგადოთ ბანი კლანში";
      } else if (language === "RU") {
        return "Администратор забанил вас в клане";
      } else {
        return "The admin has banned you from the clan";
      }
    } else if (splitedText?.includes("blockedInApp")) {
      if (language === "GE") {
        return "ადმინმა დაგადოთ ბანი აპში";
      } else if (language === "RU") {
        return "Администратор заблокировал вам доступ к приложению";
      } else {
        return "The admin has banned you from the app";
      }
    } else if (splitedText?.includes("bannedInRoom")) {
      if (language === "GE") {
        return "ადმინმა დაგადოთ ბანი ოთახში";
      } else if (language === "RU") {
        return "Администратор забанил вас в комнате";
      } else {
        return "The admin banned you from the room";
      }
    } else if (splitedText?.includes("mainFounderRoleAssigned")) {
      if (language === "GE") {
        return "თქვენ მოგენიჭათ მთავარი დამფუძნებლის როლი კლანში";
      } else if (language === "RU") {
        return "Вам отведена роль главного основателя клана";
      } else {
        return "You have been given the role of the main founder in the clan";
      }
    } else if (splitedText?.includes("warningByAdmin")) {
      if (language === "GE") {
        return "თქვენ მიიღეთ გაფრთხილება ადმინისგან";
      } else if (language === "RU") {
        return "Вы получили предупреждение от администратора";
      } else {
        return "You have received a warning from the admin";
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={
        item.status === "unread"
          ? () => ReadNotification()
          : () => {
              openDeleteConfirm(item.notificationId);
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
            }
      }
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          borderColor:
            item.status === "unread" ? theme.active : "rgba(255,255,255,0.1)",
        },
      ]}
    >
      <View style={styles.wrapper}>
        <View
          style={{
            width: "100%",
            gap: 8,
            flexDirection: "row",
          }}
        >
          {item?.sender !== "IQ-Night" && (
            <View
              style={{
                height: 30,
                width: 30,
                borderRadius: 100,
                overflow: "hidden",
              }}
            >
              <Img uri={item?.sender?.cover} />
            </View>
          )}
          <View
            style={{ maxWidth: "45%", height: 30, justifyContent: "center" }}
          >
            <Text
              style={{
                color: item?.sender !== "IQ-Night" ? theme.text : theme.active,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {item?.sender !== "IQ-Night" ? item?.sender?.name : "IQ-Night"}
            </Text>
          </View>
          <View style={{ height: 30, justifyContent: "center" }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 14,

                fontWeight: 500,
              }}
            >
              {GetTimesAgo(item.createdAt)}
            </Text>
          </View>
        </View>

        <View
          style={{ minHeight: 30, width: "100%", justifyContent: "center" }}
        >
          <Text
            style={{
              width: "100%",
              color: item.status === "unread" ? theme.active : theme.text,
              fontSize: 14,
              fontWeight: 500,
              // textAlign: "center",
              flexWrap: "wrap",
              lineHeight: 22,
            }}
          >
            {ModifyText(item?.type)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 18,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    // Box shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 4,
  },

  wrapper: {
    width: "100%",
    padding: 12,
    gap: 4,
  },
});

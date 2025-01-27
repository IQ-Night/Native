import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import DeleteConfirm from "../../components/deleteConfirm";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useChatContext } from "../../context/chat";
import { useNotificationsContext } from "../../context/notifications";
import GetTimesAgo from "../../functions/getTimesAgo";
import CreateChat from "./createChat";

const Chats = () => {
  const navigation: any = useNavigation();
  /**
   * App context
   */
  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Chat context
   */
  const { loading, setChats, chats, totalChats, setPage, page } =
    useChatContext();

  /**
   * Create chat
   */
  const [openCreateChat, setOpenCreateChat] = useState(false);

  /**
   * notifications
   */
  const { chatNotifications } = useNotificationsContext();

  /**
   * Delete
   */
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  // Animation for confirmation popup
  const slideAnim = useRef(new Animated.Value(300)).current; // Start off-screen

  const openDeleteConfirm = ({ chatId }: any) => {
    setDeleteConfirm(chatId);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeDeleteConfirm = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setDeleteConfirm(null));
  };

  /// delete
  const Delete = async () => {
    try {
      setLoadingDelete(true);
      const response = await axios.delete(
        apiUrl + "/api/v1/chats/" + deleteConfirm
      );
      if (response?.data?.status === "success") {
        setChats((prev: any) =>
          prev?.filter((p: any) => p?._id !== deleteConfirm)
        );
        closeDeleteConfirm();
        setLoadingDelete(false);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.message);
    }
  };

  return (
    <View style={{ flex: 1, height: "100%" }}>
      {loading && (
        <ActivityIndicator
          size={32}
          color={theme.active}
          style={{ marginTop: 64 }}
        />
      )}
      {!loading && chats?.length < 1 && (
        <Text
          style={{
            width: "100%",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 500,
            fontSize: 16,
            marginVertical: 16,
            textAlign: "center",
            position: "absolute",
          }}
        >
          {activeLanguage?.not_found}
        </Text>
      )}
      {!loading && chats?.length > 0 && (
        <ScrollView
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - 350;

            if (isCloseToBottom) {
              if (totalChats > chats?.length) {
                // AddInvoices();
              }
            }
          }}
          scrollEventThrottle={400}
          contentContainerStyle={{ gap: 6, paddingTop: 8 }}
          // ref={scrollViewRefRooms}
        >
          {chats?.map((chat: any, index: number) => {
            const user = chat?.members.find(
              (member: any) => member.id !== currentUser?._id
            );
            return (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.navigate("Chat", { chat: chat });
                }}
                key={index}
                delayLongPress={300}
                onLongPress={() => {
                  Vibration.vibrate();
                  openDeleteConfirm({ chatId: chat?._id });
                }}
                style={{
                  marginHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.02)",
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 8,
                  gap: 12,
                  borderWidth: 1,
                  borderColor:
                    chat?.lastMessage?.seen?.find(
                      (s: any) => s === chat?.lastMessage?.receiver?.userId
                    ) ||
                    chat?.lastMessage?.sender?.userId === currentUser?._id ||
                    !chat?.lastMessage
                      ? "rgba(255,255,255,0.05)"
                      : theme.active,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 100,
                    overflow: "hidden",
                  }}
                >
                  {chat?.type?.value === "user" ? (
                    <Img uri={user?.cover} />
                  ) : (
                    <Img uri={chat?.type?.clan?.cover} />
                  )}
                </View>
                <View style={{ gap: 4, width: "50%" }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      maxWidth: "100%",
                      fontSize: 16,
                      fontWeight: 600,
                      color:
                        chat?.lastMessage?.seen?.find(
                          (s: any) => s === chat?.lastMessage?.receiver?.userId
                        ) ||
                        chat?.lastMessage?.sender?.userId ===
                          currentUser?._id ||
                        !chat?.lastMessage
                          ? theme.text
                          : theme?.active,
                    }}
                  >
                    {chat?.type?.value === "user" ? (
                      user?.name
                    ) : (
                      <Text>{chat?.type?.clan?.title} </Text>
                    )}
                  </Text>
                  {chat?.type?.value === "user" && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      {
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            maxWidth: "100%",
                            fontSize: 14,
                            fontWeight: 500,
                            color:
                              chat?.lastMessage?.seen?.find(
                                (s: any) =>
                                  s === chat?.lastMessage?.receiver?.userId
                              ) ||
                              chat?.lastMessage?.sender?.userId ===
                                currentUser?._id
                                ? theme.text
                                : theme.active,
                          }}
                        >
                          {chat?.lastMessage?.text}{" "}
                        </Text>
                      }
                      <MaterialIcons
                        name="done-all"
                        color={
                          chat?.lastMessage?.seen?.find(
                            (s: any) =>
                              s === chat?.lastMessage?.receiver?.userId
                          )
                            ? theme.active
                            : "#888"
                        }
                        size={16}
                      />
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    marginLeft: "auto",
                    marginBottom: chat?.type?.value === "user" ? "auto" : 0,
                    fontSize: 12,
                    fontWeight: 500,
                    color: theme.active,
                    margin: chat?.type?.value === "user" ? 8 : 0,
                    marginRight: 8,
                    maxWidth: "20%",
                  }}
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {chat?.type?.value === "user" ? (
                    GetTimesAgo(chat?.lastMessage?.createdAt)
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons name="people" size={14} color={theme.text} />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: theme.text,
                        }}
                      >
                        {
                          chat?.type?.clan?.members?.filter(
                            (m: any) => m.status === "member"
                          )?.length
                        }
                      </Text>
                    </View>
                  )}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <View style={styles.createIcon}>
        <View
          style={{
            borderRadius: 50,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            width: 52,
            aspectRatio: 1,
          }}
        >
          <BlurView
            intensity={120}
            tint="dark"
            style={{
              gap: 16,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Pressable
              onPress={() => {
                setOpenCreateChat(true);
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
              style={{
                // borderWidth: 1.5,
                // borderColor: "rgba(255,255,255,0.05)",

                borderRadius: 50,
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                gap: 4,
                padding: 4,
              }}
            >
              <MaterialCommunityIcons
                name="plus"
                // style={{ position: "absolute", zIndex: 60, left: 19 }}
                size={32}
                color={theme.active}
              />
            </Pressable>
          </BlurView>
        </View>
      </View>
      {openCreateChat && (
        <CreateChat
          openState={openCreateChat}
          setOpenState={setOpenCreateChat}
        />
      )}
      {deleteConfirm && (
        <DeleteConfirm
          closeDeleteConfirm={closeDeleteConfirm}
          text={activeLanguage?.chat_delete_confirmation}
          Function={Delete}
          loadingDelete={loadingDelete}
          slideAnim={slideAnim}
        />
      )}
    </View>
  );
};

export default Chats;

const styles = StyleSheet.create({
  createIcon: {
    borderRadius: 50,
    position: "absolute",
    // right: 14,
    width: "100%",
    bottom: 48,
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: 12,
  },
});

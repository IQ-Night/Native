import React, { useRef, useEffect, useState } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Easing,
  Text,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useGameContext } from "../../../context/game";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Input from "./input";
import Messages from "./messages";
import { useChatContext } from "../../../context/chat";

const Chat = ({ route }: any) => {
  const { theme, apiUrl } = useAppContext();
  const { activeRoom } = useGameContext();
  const { currentUser } = useAuthContext();
  const { socket } = useGameContext();

  const [lastMessage, setLastMessage] = useState(
    route?.params?.chat?.lastMessage
  );

  const navigation: any = useNavigation();

  const inputRef = useRef<TextInput>(null);

  // sender
  const sender = route?.params?.chat?.members?.find(
    (member: any) => member.id === currentUser?._id
  );

  // receiver
  const receiver = route?.params?.chat?.members?.find(
    (member: any) => member.id !== currentUser?._id
  );

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [page, setPage] = useState(1);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Function to update the route's chat data
  const updateChatRoute = (updatedChat: any) => {
    navigation.setParams({ chat: updatedChat });
  };

  const CheckChat = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/chats/members?user1=${sender?.id}&user2=${receiver?.id}`
      );
      if (response?.data.status === "success") {
        if (response?.data.data.chat) {
          updateChatRoute(response?.data.data.chat);
        } else {
          navigation.goBack();
        }
      }
    } catch (error: any) {
      console.log(error.response?.data?.message);
      setLoading(false);
    }
  };

  // Fetch messages for the chat
  const GetMessages = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/chats/${route?.params?.chat?._id}/messages?page=1`
      );
      if (response?.data.status === "success") {
        setMessages(response.data.data.messages);
        setTotalMessages(response.data.totalMessages);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    } catch (error: any) {
      console.log("Error fetching messages:", error.response?.data?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route?.params?.chat?._id) {
      GetMessages();
    } else {
      if (route?.params?.chat?.type?.value === "user") {
        CheckChat();
      }
      setLoading(false);
    }
  }, [route.params.chat]);

  const AddNewMessages = async () => {
    if (totalMessages > messages?.length) {
      const newPage = page + 1;
      try {
        const response = await axios(
          `${apiUrl}/api/v1/rooms/${activeRoom?._id}/chat?page=${newPage}`
        );
        if (response.data.status === "success") {
          setTotalMessages(response.data.totalMessages);
          let messagesList = response.data.data.messages;
          setMessages((prevMessages: any) => {
            const messageMap = new Map(
              prevMessages.map((message: any) => [message.messageId, message])
            );

            messagesList.forEach((newMessage: any) => {
              if (!messageMap.has(newMessage._id)) {
                messageMap.set(newMessage.messageId, newMessage);
              }
            });

            const uniqueMessages = Array.from(messageMap.values());

            return uniqueMessages;
          });
          setPage(newPage);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Define the event handler
    const handleSendMessage = (data: any) => {
      if (data?.message?.sender?.userId !== currentUser?._id) {
        setMessages((prev: any) => [data?.message, ...prev]);
      }
    };

    if (socket) {
      // Attach the event listener
      socket.on("sendMessage", handleSendMessage);

      // Clean up by removing the event listener
      return () => {
        socket.off("sendMessage", handleSendMessage);
      };
    }
  }, [socket, currentUser?._id]);

  // Handle keyboard events
  useEffect(() => {
    const onKeyboardShow = (e: any) => {
      const height = e.endCoordinates?.height || 0;
      setKeyboardHeight(height);
    };

    const onKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      onKeyboardShow
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      onKeyboardHide
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [route]);

  // Animate slide based on keyboard height
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: -keyboardHeight,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [keyboardHeight]);

  /**
   * Members
   */
  const [loadMembers, setLoadMembers] = useState(true);
  const [members, setMembers] = useState<any>([]);

  const GetMembers = async ({ status }: any) => {
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/clans/" +
          route?.params?.chat?.type?.clan?._id +
          "/members?status=" +
          status
      );

      if (response.data.status === "success") {
        setMembers(response.data.members);
        setLoadMembers(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    if (route?.params?.chat?.type?.value === "clan") {
      GetMembers({ status: "member" });
    }
  }, [route?.params?.chat]);

  useEffect(() => {
    if (socket) {
      // Define the event handler
      const handleSeenMessage = (data: any) => {
        setLastMessage(data?.chat?.lastMessage);
      };

      // Attach the event listener
      socket.on("seenMessage", handleSeenMessage);

      // Clean up by removing the event listener
      return () => {
        socket.off("seenMessage", handleSeenMessage);
      };
    }
  }, [socket, currentUser?._id]);

  return (
    <View style={styles.chatContainer}>
      <BlurView intensity={10} tint="dark" style={styles.fullScreen}>
        <Pressable style={styles.fullScreen}>
          <Animated.View
            style={[
              styles.messagesContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator size={24} color={theme.active} />
              </View>
            ) : (
              <Messages
                messages={messages}
                setMessages={setMessages}
                AddNewMessages={AddNewMessages}
                members={members}
                chatId={route?.params?.chat?._id}
                lastMessage={lastMessage}
                chat={route?.params?.chat}
              />
            )}

            <Input
              setMessages={setMessages}
              inputRef={inputRef}
              keyboardHeight={keyboardHeight}
              receiver={receiver}
              chatId={route?.params?.chat?._id}
              setChat={updateChatRoute}
              setLastMessage={setLastMessage}
            />
          </Animated.View>
        </Pressable>
      </BlurView>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    zIndex: 100,
  },
  fullScreen: {
    width: "100%",
    height: "100%",
    paddingTop: 56,
  },
  messagesContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  loader: {
    position: "absolute",
    top: 200,
  },
});

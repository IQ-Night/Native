import axios from "axios";
import React, { useCallback, useEffect, useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useGameContext } from "../../../context/game";
import Message from "./message";
import { useChatContext } from "../../../context/chat";

const Messages = ({
  messages,
  AddNewMessages,
  lastMessage,
  chatId,
  members,
  chat,
}: any) => {
  const flatListRef = useRef<any>(null);

  const { apiUrl } = useAppContext();
  const { currentUser } = useAuthContext();
  const { activeRoom } = useGameContext();
  const { chatNotifications, setChatNotifications, setChats } =
    useChatContext();

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;

    // // Detect if user is close to the top
    // if (contentOffset.y <= 50) {
    //   AddNewMessages();
    // }
  };

  // Memoize the render function for each message to prevent re-renders
  const renderMessage = ({ item, index }: any) => (
    <Message
      key={item.messageId}
      message={item}
      index={index}
      members={members}
      lastMessage={lastMessage}
      chat={chat}
    />
  );
  useEffect(() => {
    const SeenMessages = async () => {
      try {
        const response = await axios.patch(
          apiUrl +
            "/api/v1/chats/" +
            chatId +
            "?type=seen&seenBy=" +
            currentUser?._id,
          {
            lastMessage: {
              ...lastMessage,
              seen: [
                ...lastMessage?.seen?.filter(
                  (id: any) => id !== currentUser?._id
                ),
                currentUser?._id,
              ],
            },
          }
        );
        if (response?.data?.status === "success") {
          setChats((prev: any) =>
            prev?.map((p: any) => {
              if (p?._id === chatId) {
                return {
                  ...p,
                  lastMessage: {
                    ...p.lastMessage,
                    seen: [...p.lastMessage?.seen, currentUser?._id],
                  },
                };
              } else {
                return p;
              }
            })
          );

          setChatNotifications((prev: any) =>
            prev?.filter((p: any) => p?.chatId !== chatId)
          );
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    if (lastMessage?.sender?.userId !== currentUser?._id) {
      SeenMessages();
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId.toString()}
        inverted
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="always"
      />
    </View>
  );
};

// Memoize Message component to avoid unnecessary re-renders
const MemoizedMessage = React.memo(Message);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-end",
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
});

export default Messages;

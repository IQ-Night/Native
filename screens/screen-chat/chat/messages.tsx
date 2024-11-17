import React, { useRef, useEffect, useState, useCallback } from "react";
import { FlatList, StyleSheet, View, ActivityIndicator } from "react-native";
import Message from "./message";
import axios from "axios";
import { useAuthContext } from "../../../context/auth";
import { useGameContext } from "../../../context/game";
import { useAppContext } from "../../../context/app";

const Messages = ({ messages, AddNewMessages, setUnreadMessages }: any) => {
  const flatListRef = useRef<any>(null);

  const { apiUrl } = useAppContext();
  const { currentUser } = useAuthContext();
  const { activeRoom } = useGameContext();

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;

    // Detect if user is close to the top
    if (contentOffset.y <= 50) {
      AddNewMessages();
    }
  };

  // Memoize the render function for each message to prevent re-renders
  const renderMessage = useCallback(
    ({ item, index }: any) => (
      <Message key={item.messageId} message={item} index={index} />
    ),
    []
  );

  useEffect(() => {
    const SeenMessages = async () => {
      try {
        const response = await axios.patch(
          apiUrl +
            "/api/v1/rooms/" +
            activeRoom?._id +
            "/chat/seen/" +
            currentUser?._id
        );
        if (response?.data?.status === "success") {
          setUnreadMessages(false);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    SeenMessages();
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
    marginTop: 350,
  },
  contentContainer: {
    paddingHorizontal: 12,
  },
});

export default Messages;

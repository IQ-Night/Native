import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  KeyboardEvent,
  Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useAppContext } from "../../../context/app";
import Header from "./header";
import Input from "./input";
import Messages from "./messages";
import { useAuthContext } from "../../../context/auth";
import { useGameContext } from "../../../context/game";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";

const Chat = ({
  loading,
  setLoading,
  messages,
  setMessages,
  totalMessages,
  setTotalMessages,
  page,
  setPage,
  setOpenChat,
  setUnreadMessages,
}: any) => {
  const { haptics, theme, apiUrl } = useAppContext();
  const { currentUser } = useAuthContext();
  const { activeRoom, socket } = useGameContext();

  const rotate = React.useRef(new Animated.Value(45)).current; // Correct initial rotation angle (in degrees)
  const opacityAnim = React.useRef(new Animated.Value(0)).current; // Start invisible
  const translateXAnim = React.useRef(new Animated.Value(500)).current; // Start off-screen to the right
  const translateYAnim = React.useRef(new Animated.Value(-750)).current; // Start off-screen to the top

  // Reference to TextInput for focusing the input and triggering keyboard
  const inputRef = useRef<TextInput>(null);

  // Open chat animation
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(rotate, {
        toValue: 0, // Rotate to 0 degrees
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1, // Fade in
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0, // Move to the center
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0, // Move to the center
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => inputRef?.current?.focus());
  }, []);

  const handleClose = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }

    inputRef?.current?.blur();
    setKeyboardHeight(0);
    setOpenChat(false);
  };

  const AddNewMessages = async () => {
    if (totalMessages > messages?.length) {
      const newPage = page + 1;
      try {
        const response = await axios(
          apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/chat?page=" + newPage
        );
        if (response.data.status === "success") {
          setTotalMessages(response.data.totalMessages);
          let messagesList = response.data.data.messages;
          setMessages((prevMessages: any) => {
            // Create a Map with existing rooms using roomId as the key
            const messageMap = new Map(
              prevMessages.map((message: any) => [message.messageId, message])
            );

            // Iterate over new rooms and add them to the Map if they don't already exist
            messagesList.forEach((mewMessage: any) => {
              if (!messageMap.has(mewMessage._id)) {
                messageMap.set(mewMessage.messageId, mewMessage);
              }
            });

            // Convert the Map values back to an array
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

  // keyboard configs

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    function onKeyboardDidShow(e: KeyboardEvent) {
      // Remove type here if not using TypeScript
      setKeyboardHeight(e.endCoordinates.height);
    }

    function onKeyboardDidHide() {
      setKeyboardHeight(0);
    }

    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      onKeyboardDidShow
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      onKeyboardDidHide
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Animation for confirmation popup
  const slideAnim = useRef(new Animated.Value(0)).current; // Start off-screen

  useEffect(() => {
    // Define and type the animation
    const slideAnimation: Animated.CompositeAnimation = Animated.timing(
      slideAnim,
      {
        toValue: -keyboardHeight,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }
    );

    // Start the animation
    slideAnimation.start();

    // Cleanup function to stop the animation on component unmount
    return () => {
      slideAnimation.stop();
    };
  }, [keyboardHeight]);

  return (
    <Animated.View
      style={[
        styles.chatContainer,
        {
          transform: [
            {
              rotate: rotate.interpolate({
                inputRange: [0, 45],
                outputRange: ["0deg", "45deg"],
              }),
            },
            { translateX: translateXAnim },
            { translateY: translateYAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <BlurView
        intensity={150}
        tint="dark"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Pressable
          style={{
            width: "100%",
            height: "100%",

            paddingTop: 56,
          }}
        >
          <Header
            handleClose={handleClose}
            setMessages={setMessages}
            totalMessages={messages?.length}
          />
          {/* Messages container with keyboard avoidance */}
          <Animated.View
            style={[
              styles.messagesContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Messages section */}
            {loading ? (
              <View
                style={{
                  position: "absolute",
                  top: 200,
                }}
              >
                <ActivityIndicator size={32} color={theme.active} />
              </View>
            ) : (
              <Messages
                messages={messages}
                setMessages={setMessages}
                AddNewMessages={AddNewMessages}
                setUnreadMessages={setUnreadMessages}
              />
            )}

            {/* Input for new messages */}

            <Input
              setMessages={setMessages}
              inputRef={inputRef}
              keyboardHeight={keyboardHeight}
            />
          </Animated.View>
        </Pressable>
      </BlurView>
    </Animated.View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  chatContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    zIndex: 100,
  },
  messagesContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

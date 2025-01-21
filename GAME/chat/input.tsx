import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useGameContext } from "../../context/game";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Input = ({ setMessages, inputRef, keyboardHeight }: any) => {
  const { theme, apiUrl, haptics, activeLanguage } = useAppContext();
  const { activeRoom } = useGameContext();
  const { currentUser } = useAuthContext();

  const [input, setInput] = useState("");

  // Function to send a new message
  const SendMessage = async () => {
    if (input?.length < 1) {
      return;
    }
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }

    if (!input.trim()) return; // Prevent sending empty messages

    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
    const messageId = generateUUID();

    const newMessage = {
      messageId,
      text: input,
      sender: { userId: currentUser?._id },
      createdAt: new Date(),
    };

    // Add new message to state and send it to the server
    try {
      setMessages((prev: any) => [newMessage, ...prev]);
      setInput(""); // Clear input after sending message
      await axios.post(
        apiUrl + "/api/v1/rooms/" + activeRoom?._id + "/chat",
        newMessage
      );
    } catch (error: any) {
      console.log(error.response?.data?.message || "Error sending message");
    }
  };

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={[
        styles.blurView,
        { transform: [{ scale: keyboardHeight > 0 ? 1 : 0 }] },
      ]}
    >
      <TextInput
        placeholder={activeLanguage?.typeHere}
        placeholderTextColor={"#888"}
        value={input}
        onChangeText={setInput}
        style={[styles.textInput, { color: theme.text }]}
        ref={inputRef}
        // returnKeyType="send"
        blurOnSubmit={false}
        multiline
      />
      <MaterialCommunityIcons
        onPress={SendMessage}
        name="send"
        size={32}
        color="orange"
      />
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blurView: {
    width: "100%",
    zIndex: 110,
    minHeight: 70,
    maxHeight: 280,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 16,
  },
  textInput: {
    width: "88%",
    height: "100%",
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    textAlignVertical: "center",
    minHeight: 50,
    overflow: "scroll",
    paddingVertical: 12,
  },
  sendButton: {
    height: "100%",
    justifyContent: "center",
  },
});

export default Input;

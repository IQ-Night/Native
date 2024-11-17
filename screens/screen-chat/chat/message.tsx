import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useAppContext } from "../../../context/app";
import { BlurView } from "expo-blur";
import { useAuthContext } from "../../../context/auth";
import GetTimesAgo from "../../../functions/getTimesAgo";
import * as Haptics from "expo-haptics";
import Img from "../../../components/image";

const Message = ({ message, index }: any) => {
  const { theme, haptics } = useAppContext();
  const { currentUser } = useAuthContext();

  const [openMessage, setOpenMessage] = useState(false);

  return (
    <Pressable
      onPress={() => {
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        setOpenMessage((prev: boolean) => !prev);
      }}
      style={{
        overflow: "hidden",
        borderRadius: 8,
        marginBottom: index === 0 ? 12 : 8,
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.01)", // Light transparent background
          borderRadius: 8, // Rounded corners
          padding: 4,
          alignItems:
            message?.sender?.userId === currentUser?._id
              ? "flex-end"
              : "flex-start",
          justifyContent: "center", // Vertically align text and sender avatar
          gap: 8,
        }}
      >
        {message?.sender?.userId !== currentUser?._id && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 100,
                overflow: "hidden",
                marginRight: 8, // Space between avatar and message text
              }}
            >
              <Img uri={message.sender.cover} />
            </View>
            <Text style={{ fontWeight: 500, color: theme.text }}>
              {message.sender.name} {index}
            </Text>
          </View>
        )}
        <View
          style={{
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12, // Padding to give some space around the text
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        >
          <Text
            style={{
              color:
                message?.sender?.userId === currentUser?._id
                  ? theme.active
                  : theme.text,
              fontWeight: "500",
              flexWrap: "wrap", // Ensures text wraps within the view
            }}
          >
            {message.text}
          </Text>
        </View>
        {openMessage && (
          <View
            style={{
              alignItems:
                message?.sender?.userId === currentUser?._id
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <Text style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
              {GetTimesAgo(message?.createdAt)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default Message;

const styles = StyleSheet.create({
  message: {
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    gap: 8,
    width: "auto",
  },
});

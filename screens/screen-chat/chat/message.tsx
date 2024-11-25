import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Img from "../../../components/image";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import GetTimesAgo from "../../../functions/getTimesAgo";

const Message = ({ chat, message, index, members, lastMessage }: any) => {
  const { theme, haptics } = useAppContext();
  const { currentUser } = useAuthContext();

  const [openMessage, setOpenMessage] = useState(false);
  let sender;
  if (members?.length > 0) {
    const senderObj = members?.find(
      (member: any) => member?._id === message?.sender?.userId
    );
    sender = { ...senderObj, userId: senderObj?._id };
  }
  const navigation: any = useNavigation();

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
        marginBottom: index === 0 ? 12 : 10,
      }}
    >
      <View
        style={{
          borderRadius: 8, // Rounded corners
          alignItems:
            message?.sender?.userId === currentUser?._id
              ? "flex-end"
              : "flex-start",
          justifyContent: "center", // Vertically align text and sender avatar
          gap: 8,
        }}
      >
        {sender && sender?.userId !== currentUser?._id && (
          <Pressable
            onPress={() => navigation.navigate("User", { item: sender })}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 100,
                overflow: "hidden",
                marginRight: 8, // Space between avatar and message text
              }}
            >
              <Img uri={sender.cover} />
            </View>
            <Text style={{ fontWeight: 500, color: theme.text }}>
              {sender.name}
            </Text>
          </Pressable>
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

        {index === 0 &&
          lastMessage?.seen?.find(
            (userId: any) => userId === message?.receiver?.userId
          ) &&
          lastMessage?.sender?.userId === currentUser?._id && (
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 100,
                overflow: "hidden",
                marginLeft: 8, // Space between avatar and message text
              }}
            >
              <Img
                uri={
                  chat?.members?.find(
                    (m: any) => m.id === lastMessage?.receiver?.userId
                  )?.cover
                }
              />
            </View>
          )}

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

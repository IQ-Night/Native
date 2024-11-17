import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import Button from "../../components/button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const Chats = () => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Chats
   */
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(1);
  const [totalChats, setTotalChats] = useState(null);
  const [chats, setChats] = useState([]);

  // get chats
  const GetChats = async () => {
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/chats?page=1&search=" +
          search +
          "userId=" +
          currentUser?._id
      );
      if (response?.data?.status === "success") {
        setChats(response?.data?.data?.chats);
        setTotalChats(response?.data?.totalChats);
        setPage(1);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetChats();
  }, [search]);

  /**
   * Create chat
   */
  const [openCreateChat, setOpenCreateChat] = useState(false);

  //      /**
  //    * chat
  //    */
  //   const [openChat, setOpenChat] = useState(false);
  //   const [unreadMessages, setUnreadMessages] = useState(false);

  //   /**
  //    * messages state
  //    */
  //   const [loadingChat, setLoadingChat] = useState(true);
  //   const [messages, setMessages] = useState<any>([]);
  //   const [page, setPage] = useState(1);
  //   const [totalMessages, setTotalMessages] = useState<any>(null);

  //   useEffect(() => {
  //     const GetChat = async () => {
  //       try {
  //         const response = await axios(
  //           apiUrl + "/api/v1/clans/" + item?._id + "/chat?page=1"
  //         );
  //         if (response?.data.status === "success") {
  //           setTotalMessages(response.data.totalMessages);
  //           setMessages(response?.data?.data?.messages);
  //           if (
  //             !response?.data?.data?.lastMessagesSeen?.find(
  //               (i: any) => i === currentUser?._id
  //             )
  //           ) {
  //             setUnreadMessages(true);
  //           }
  //           setTimeout(() => {
  //             setLoadingChat(false);
  //           }, 1000);
  //         }
  //       } catch (error: any) {
  //         console.log(error.response.data.message);
  //         setLoading(false);
  //       }
  //     };
  //     GetChat();
  //   }, []);

  //   useEffect(() => {
  //     // Define the event handler
  //     const handleSendMessage = (data: any) => {
  //       if (data?.message?.sender?.userId !== currentUser?._id) {
  //         setMessages((prev: any) => [data?.message, ...prev]);
  //         setUnreadMessages(true);
  //       }
  //     };

  //     // Attach the event listener
  //     socket.on("sendMessage", handleSendMessage);

  //     // Clean up by removing the event listener
  //     return () => {
  //       socket.off("sendMessage", handleSendMessage);
  //     };
  //   }, [socket, currentUser?._id]); // Add currentUser._id as a dependency

  return (
    <View style={{ flex: 1, height: "100%" }}>
      {loading && (
        <ActivityIndicator
          size={32}
          color={theme.active}
          style={{ marginTop: 64 }}
        />
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

              {/* <Text
                  style={{ fontSize: 16, fontWeight: 600, color: theme.active }}
                >
                  Create
                </Text> */}
            </Pressable>
          </BlurView>
        </View>
      </View>
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
    bottom: 100,
    overflow: "hidden",
    alignItems: "flex-end",
    paddingHorizontal: 12,
  },
});

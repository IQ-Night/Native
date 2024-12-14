import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import * as Haptics from "expo-haptics";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";
import GetTimesAgo from "../../functions/getTimesAgo";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNotificationsContext } from "../../context/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Ticket = ({ openState, setOpenState, setTickets }: any) => {
  const { currentUser } = useAuthContext();
  const { apiUrl, theme, setAlert, activeLanguage, haptics } = useAppContext();
  const slideAnim = useRef(new Animated.Value(220)).current; // Start off-screen

  // Animation to slide the popup in and out
  useEffect(() => {
    if (openState) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [openState]);

  // notifications context
  const { setSupportTickets, setNoAuthTickets } = useNotificationsContext();

  const issuesList: any = [
    {
      id: 1,
      value: "game",
      label: activeLanguage?.game,
    },
    {
      id: 2,
      value: "payments",
      label: activeLanguage?.payments,
    },
    {
      id: 3,
      value: "user_access",
      label: activeLanguage?.userAccess,
    },
    {
      id: 4,
      value: "offer",
      label: activeLanguage?.offer,
    },
    {
      id: 5,
      value: "review",
      label: activeLanguage?.review,
    },
    {
      id: 6,
      value: "other",
      label: activeLanguage?.other,
    },
  ];

  // read message
  useEffect(() => {
    const Seen = async () => {
      try {
        const response = await axios.patch(
          apiUrl + "/api/v1/tickets/" + openState?.data?._id,
          {
            status: { admin: "seen", user: "seen" },
          }
        );
        if (response?.data?.status === "success") {
          setTickets((prev: any) => {
            return prev?.map((p: any) => {
              if (p?._id === openState?.data?._id) {
                // Update the ticket with the matching _id
                return { ...p, status: { admin: "seen", user: "seen" } };
              } else {
                // Return the ticket unchanged if it doesn't match
                return p;
              }
            });
          });
          setOpenState((prev: any) => {
            if (prev?.data?._id === openState?.data?._id) {
              return {
                ...prev,
                data: {
                  ...prev.data,
                  status: { admin: "seen", user: "seen" },
                },
              };
            }
            return prev;
          });
          if (currentUser) {
            setSupportTickets((prev: any) =>
              prev?.filter((p: any) => p._id !== openState?.data?._id)
            );
          } else {
            setNoAuthTickets((prev: any) =>
              prev?.filter((p: any) => p._id !== openState?.data?._id)
            );
          }
        }
      } catch (error: any) {
        console.log(error?.response?.data.message);
      }
    };
    Seen();
  }, []);

  // state
  const [state, setState] = useState("messages");
  // Function to close the confirmation popup
  const closeComponent = () => {
    if (state === "messages") {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      Animated.timing(slideAnim, {
        toValue: 1000, // Slide back down
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setOpenState({ state: "tickets", data: null });
      });
    } else {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      setState("messages");
    }
  };

  // text
  const [textInput, setTextInput] = useState("");

  const [loading, setLoading] = useState(false);
  const SendText = async () => {
    if (textInput?.length < 1) {
      return;
    }
    const noAuthUserId = await AsyncStorage.getItem("IQ-Night:noAuthUserId");
    const newMessage = {
      text: textInput,
      sender: { id: currentUser?._id || noAuthUserId, type: "user" },
      createdAt: new Date(),
    };
    try {
      setLoading(true);
      const response = await axios.post(
        apiUrl + "/api/v1/tickets/" + openState?.data?._id,
        newMessage
      );
      if (response?.data?.status === "success") {
        setTickets((prev: any) => {
          return prev?.map((p: any) => {
            if (p?._id === openState?.data?._id) {
              // Update the ticket with the matching _id
              return { ...p, messages: [...p.messages, newMessage] };
            } else {
              // Return the ticket unchanged if it doesn't match
              return p;
            }
          });
        });
        setOpenState((prev: any) => {
          if (prev?.data?._id === openState?.data?._id) {
            return {
              ...prev,
              data: {
                ...prev.data,
                messages: [...prev.data.messages, newMessage],
              },
            };
          }
          return prev;
        });
        setTextInput("");
        setState("messages");
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        bottom: 0,
      }}
    >
      <View style={{ width: "100%", height: "100%" }}>
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            height: "100%",
            width: "100%",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: "hidden",
            transform: [{ translateY: slideAnim }],
          }}
        >
          <BlurView
            intensity={120}
            tint="dark"
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <View
              style={{
                width: "100%",
                height: "80%",
                gap: 24,
                alignItems: "center",
                padding: 16,
              }}
            >
              <MaterialCommunityIcons
                onPress={closeComponent}
                name="close"
                size={32}
                color={theme.active}
                style={{ position: "absolute", right: 12, top: 12 }}
              />
              <View style={{ gap: 8, alignItems: "center" }}>
                <Text
                  style={{ color: theme.text, fontWeight: 500, fontSize: 20 }}
                >
                  {
                    issuesList.find(
                      (i: any) => i.value === openState?.data?.issue
                    )?.label
                  }
                </Text>
              </View>
              {state === "messages" && (
                <>
                  <ScrollView
                    contentContainerStyle={{
                      paddingVertical: 16,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <View style={{ gap: 8 }}>
                      {openState?.data?.messages
                        ?.sort(
                          (a: any, b: any) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((message: any, index: number) => {
                          return (
                            <View
                              key={index}
                              style={{
                                width: "100%",
                                backgroundColor:
                                  message?.sender?.type === "admin"
                                    ? "rgba(255,255,255,0.1)"
                                    : "rgba(255,255,255,0.05)",
                                borderRadius: 10,
                                padding: 8,
                                gap: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: theme.active,
                                  fontWeight: 500,
                                }}
                              >
                                {message?.sender?.type === "user"
                                  ? activeLanguage?.user
                                  : activeLanguage?.admin}{" "}
                                - {GetTimesAgo(message?.createdAt)}
                              </Text>
                              <Text
                                style={{ color: theme.text, fontWeight: 500 }}
                              >
                                {message?.text}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  </ScrollView>

                  <Pressable
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      setState("new Message");
                    }}
                  >
                    <Text style={{ color: theme.active, fontWeight: 600 }}>
                      {activeLanguage?.newMessage}
                    </Text>
                  </Pressable>
                </>
              )}
              {state !== "messages" && (
                <View
                  style={{
                    width: "100%",
                    marginTop: 16,
                    height: 240,
                    gap: 16,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    {activeLanguage?.message}:{" "}
                    <Text
                      style={{
                        color: textInput?.length > 200 ? "red" : theme.text,
                      }}
                    >
                      ({200 - textInput?.length})
                    </Text>
                  </Text>
                  <TextInput
                    placeholder={activeLanguage?.typeHere}
                    placeholderTextColor={"#888"}
                    value={textInput}
                    onChangeText={setTextInput}
                    numberOfLines={10}
                    multiline
                    style={[styles.textInput, { color: theme.text }]}
                  />
                  <Button
                    title={activeLanguage?.send}
                    style={{
                      width: "100%",
                      color: "white",
                      backgroundColor: theme.active,
                    }}
                    loading={loading}
                    disabled={textInput?.length > 200}
                    onPressFunction={SendText}
                  />
                  <Pressable
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      setState("messages");
                    }}
                  >
                    <Text
                      style={{
                        color: theme.active,
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      {activeLanguage?.messages}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </BlurView>
  );
};

export default Ticket;

const styles = StyleSheet.create({
  textInput: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});

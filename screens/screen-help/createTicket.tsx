import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
import { v4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateTicket = ({ openState, setOpenState, setTickets }: any) => {
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

  // Function to close the confirmation popup
  const closeComponent = () => {
    Animated.timing(slideAnim, {
      toValue: 1000, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setOpenState({ active: false });
    });
  };

  /**
   * input states
   */
  const [issue, setIssue] = useState<any>(null);

  const issuesList = [
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

  // text
  const [textInput, setTextInput] = useState("");

  const [loading, setLoading] = useState(false);
  const SendTicket = async () => {
    const noAuthUserId = await AsyncStorage.getItem("IQ-Night:noAuthUserId");
    console.log(noAuthUserId);
    const newTicket = {
      issue: issue,
      messages: [
        {
          text: textInput,
          sender: {
            id: currentUser?._id || noAuthUserId,
            type: "user",
          },
          createdAt: new Date(),
        },
      ],
      user: {
        id: currentUser?._id || noAuthUserId,
        name: currentUser?.name || "No authorized",
        cover: currentUser?.cover || "",
      },
    };
    try {
      setLoading(true);
      const response = await axios.post(apiUrl + "/api/v1/tickets", newTicket);
      if (response?.data?.status === "success") {
        setTickets((prev: any) => [...prev, response?.data?.data?.ticket]);
        setLoading(false);
        setAlert({
          active: true,
          text: "Ticket created successfully!",
          type: "success",
        });
        setOpenState({ state: false });
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
        top: 24,
      }}
    >
      <Pressable
        onPress={closeComponent}
        style={{ width: "100%", height: "100%" }}
      >
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
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                gap: 24,
                alignItems: "center",
                padding: 16,
              }}
            >
              <View style={{ gap: 8, alignItems: "center" }}>
                <Text
                  style={{ color: theme.text, fontWeight: 500, fontSize: 20 }}
                >
                  {activeLanguage?.createTicket}
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 12,
                    fontStyle: "italic",
                    fontWeight: 500,
                  }}
                >
                  {activeLanguage?.answersWithin}
                </Text>
              </View>
              <View style={{ width: "100%", marginBottom: 16 }}>
                <Text
                  style={{ color: theme.text, fontWeight: 500, fontSize: 14 }}
                >
                  {activeLanguage?.selectIssue}:
                </Text>
                <View style={{ width: "100%", gap: 6, marginTop: 16 }}>
                  {issuesList?.map((iss: any, index: number) => {
                    if (issue === iss.value || !issue) {
                      return (
                        <Pressable
                          onPress={() => {
                            if (haptics) {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Soft
                              );
                            }
                            setIssue(iss?.value === issue ? null : iss?.value);
                          }}
                          key={iss.id}
                          style={{
                            width: "100%",
                            backgroundColor:
                              issue === iss.value
                                ? theme.active
                                : "rgba(255,255,255,0.1)",
                            borderRadius: 10,
                            padding: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: issue === iss.value ? "white" : theme.text,
                              fontWeight: 500,
                              fontSize: 14,
                            }}
                          >
                            {iss?.label}
                          </Text>
                        </Pressable>
                      );
                    }
                  })}
                </View>
                {issue && (
                  <View
                    style={{
                      width: "100%",
                      marginTop: 16,
                      height: 140,
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    >
                      Explain issue:{" "}
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
                      // onSubmitEditing={SendMessage}
                      style={[styles.textInput, { color: theme.text }]}
                      // ref={inputRef}
                      blurOnSubmit={false}
                    />
                  </View>
                )}
              </View>
              <Button
                title={activeLanguage?.send}
                style={{
                  width: "100%",
                  color: "white",
                  backgroundColor: theme.active,
                }}
                loading={loading}
                disabled={
                  !issue || textInput?.length < 1 || textInput?.length > 200
                }
                onPressFunction={SendTicket}
              />
            </Pressable>
          </BlurView>
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default CreateTicket;

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

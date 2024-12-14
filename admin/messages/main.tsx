import axios from "axios";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import GetTimesAgo from "../../functions/getTimesAgo";
import Ticket from "./ticket";

const Messages = () => {
  const { apiUrl, activeLanguage, theme, haptics } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * tickets
   */
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  const GetTickets = async () => {
    try {
      const response = await axios.get(apiUrl + "/api/v1/tickets");
      if (response?.data?.status === "success") {
        setTickets(response?.data?.data?.tickets);
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetTickets();
  }, []);

  /**
   * active state
   */
  const [activeState, setActiveState] = useState({
    state: "start",
    data: null,
  });

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
  return (
    <>
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
          paddingBottom: 108,
          gap: 16,
        }}
      >
        <View style={{ width: "100%", height: "100%", alignItems: "center" }}>
          <ScrollView
            style={{
              width: "100%",
            }}
            contentContainerStyle={{ gap: 6 }}
          >
            {tickets?.map((ticket: any, index: number) => {
              return (
                <Pressable
                  onPress={() => {
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                    setActiveState({ state: "ticket", data: ticket });
                  }}
                  key={index}
                  style={{
                    backgroundColor:
                      ticket?.status?.admin === "unread"
                        ? theme.active
                        : "rgba(255,255,255,0.1)",
                    padding: 12,
                    borderRadius: 10,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          ticket?.status?.admin === "unread"
                            ? "white"
                            : theme.text,
                        fontWeight: 600,
                        fontSize: 16,
                      }}
                    >
                      {
                        issuesList.find((i: any) => i.value === ticket?.issue)
                          ?.label
                      }
                    </Text>
                    <Text
                      style={{
                        color:
                          ticket?.status?.admin === "unread"
                            ? "white"
                            : theme.active,
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {GetTimesAgo(ticket?.messages[0]?.createdAt)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color:
                        ticket?.status?.admin === "unread"
                          ? "white"
                          : theme.text,
                      fontWeight: 400,
                    }}
                  >
                    {ticket?.messages[0]?.text}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
      {activeState?.state === "ticket" && (
        <Ticket
          openState={activeState}
          setOpenState={setActiveState}
          setTickets={setTickets}
        />
      )}
    </>
  );
};

export default Messages;

const styles = StyleSheet.create({});

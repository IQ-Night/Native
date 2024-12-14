import axios from "axios";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import CreateTicket from "./createTicket";
import GetTimesAgo from "../../functions/getTimesAgo";
import { useAuthContext } from "../../context/auth";
import { ActivityIndicator } from "react-native-paper";
import Ticket from "./ticket";
import { Badge } from "react-native-elements";
import { useNotificationsContext } from "../../context/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Help = () => {
  const { apiUrl, activeLanguage, theme, haptics } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  /**
   * Notifications context
   */
  const { supportTickets, noAuthTickets } = useNotificationsContext();

  /**
   * create ticket
   */
  const [openCreateTicket, setOpenCreateTicket] = useState({ active: false });

  /**
   * tickets
   */
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  const GetTickets = async () => {
    try {
      const noAuthId = await AsyncStorage.getItem("IQ-Night:noAuthUserId");
      const userId = currentUser ? currentUser?._id : noAuthId;
      const response = await axios.get(
        apiUrl + "/api/v1/tickets?userId=" + userId
      );
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
  }, [currentUser]);

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
        {activeState?.state === "start" && (
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: 16,
                fontStyle: "italic",
                fontWeight: 500,
                textAlign: "center",
                lineHeight: 24,
              }}
              numberOfLines={2}
            >
              {activeLanguage?.answersWithin}
            </Text>
            <Button
              title={activeLanguage?.start}
              style={{
                width: "100%",
                backgroundColor: theme?.active,
                color: "white",
              }}
              onPressFunction={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setOpenCreateTicket({ active: true });
              }}
            />
          </View>
        )}
        {activeState?.state === "tickets" && (
          <View style={{ width: "100%", height: "100%", alignItems: "center" }}>
            <View
              style={{
                width: "100%",
                zIndex: 80,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}
              >
                {activeLanguage?.ticketHistory}
              </Text>
            </View>
            <ScrollView
              style={{
                width: "100%",
                marginTop: 12,
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
                        ticket?.status?.user === "unread"
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
                            ticket?.status?.user === "unread"
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
                            ticket?.status?.user === "unread"
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
                          ticket?.status?.user === "unread"
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

            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setActiveState({ state: "start", data: null });
              }}
            >
              <Text
                style={{
                  color: theme.active,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {activeLanguage?.newTicket}
              </Text>
            </Pressable>
          </View>
        )}

        {activeState?.state === "start" && (
          <View style={{ height: 50 }}>
            {loading ? (
              <ActivityIndicator size={24} color={theme.active} />
            ) : (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setActiveState({ state: "tickets", data: null });
                }}
              >
                {currentUser && supportTickets?.length > 0 && (
                  <Badge
                    value={supportTickets?.length}
                    status="success"
                    badgeStyle={{ backgroundColor: theme.active }}
                    containerStyle={{
                      position: "absolute",
                      top: -6,
                      right: -12,
                    }}
                  />
                )}
                {!currentUser && noAuthTickets?.length > 0 && (
                  <Badge
                    value={noAuthTickets?.length}
                    status="success"
                    badgeStyle={{ backgroundColor: theme.active }}
                    containerStyle={{
                      position: "absolute",
                      top: -6,
                      right: -12,
                    }}
                  />
                )}
                <Text
                  style={{
                    color: theme.active,
                    fontSize: 16,
                    fontWeight: 500,
                    textDecorationColor: theme.active,
                    textDecorationStyle: "solid",
                    textDecorationLine: "underline",
                  }}
                >
                  {activeLanguage?.ticketHistory}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
      {activeState?.state === "ticket" && (
        <Ticket
          openState={activeState}
          setOpenState={setActiveState}
          setTickets={setTickets}
        />
      )}
      {openCreateTicket?.active && (
        <CreateTicket
          openState={openCreateTicket}
          setOpenState={setOpenCreateTicket}
          setTickets={setTickets}
        />
      )}
    </>
  );
};

export default Help;

const styles = StyleSheet.create({});

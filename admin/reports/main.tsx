import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/app";
import axios from "axios";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { FormatDate } from "../../functions/formatDate";
import { warnings } from "../../context/content";
import { useNavigation } from "@react-navigation/native";
import Img from "../../components/image";
import { useAdminContext } from "../../context/admin";
import { ActivityIndicator } from "react-native-paper";

const Reports = () => {
  const navigation: any = useNavigation();
  /**
   * App context
   */
  const { apiUrl, theme, activeLanguage, language } = useAppContext();

  /**
   * Reports team
   */
  const [reports, setReports] = useState<any>([]);
  const [totalReports, setTotalReports] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const GetReports = async () => {
      try {
        const response = await axios.get(apiUrl + "/api/v1/reports?page=1");
        if (response.data.status === "success") {
          setPage(1);
          setReports(response.data.data.reports);
          setTotalReports(response.data.data.totalReports);
          setLoading(false);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
        setLoading(false);
      }
    };
    GetReports();
  }, []);

  const AddReports = async () => {
    const newPage = page + 1;
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/reports?page=" + newPage
      );
      if (response.data.status === "success") {
        let newReports = response.data.data.reports;
        setPage(newPage);
        setReports((prevReports: any) => {
          // Create a Map with existing rooms using roomId as the key
          const reportMap = new Map(
            prevReports.map((room: any) => [room._id, room])
          );

          // Iterate over new rooms and add them to the Map if they don't already exist
          newReports.forEach((newReport: any) => {
            if (!reportMap.has(newReport._id)) {
              reportMap.set(newReport._id, newReport);
            }
          });

          // Convert the Map values back to an array
          const uniqueReports = Array.from(reportMap.values());

          return uniqueReports;
        });
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  // read report
  const { setAdminNotifications } = useAdminContext();
  const [readLoading, setReadLoading] = useState(false);
  const ReadReport = async ({ reportId }: any) => {
    try {
      setReadLoading(reportId);
      const response = await axios.patch(
        apiUrl + "/api/v1/reports/" + reportId,
        { status: "read" }
      );
      if (response.data.status === "success") {
        // Update the reports state to mark the relevant report as "read"
        setReports((prev: any) =>
          prev?.map(
            (p: any) => (p._id === reportId ? { ...p, status: "read" } : p) // Set status to "read" for the report being updated
          )
        );

        // Filter out the notification that corresponds to the updated report
        setAdminNotifications((prev: any) =>
          prev?.filter((p: any) => p._id !== reportId)
        );

        // Delay the loading state update
        setTimeout(() => {
          setReadLoading(false);
        }, 300);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setTimeout(() => {
        setReadLoading(false);
      }, 300);
    }
  };

  return (
    <View style={{ padding: 16, width: "100%", height: "100%" }}>
      {loading && (
        <View
          style={{
            width: "100%",
            alignItems: "center",
            height: 300,
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size={32} color={theme.active} />
        </View>
      )}
      {reports?.length < 1 && !loading && (
        <Text
          style={{
            color: "rgba(255,255,255,0.3)",
            fontWeight: 500,
            fontSize: 16,
            margin: 16,
          }}
        >
          {activeLanguage?.not_found}
        </Text>
      )}
      <ScrollView
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 350;
          if (isCloseToBottom) {
            if (totalReports > reports?.length) {
              AddReports();
            }
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.row}>
          {reports?.map((item: any, index: number) => {
            return (
              <Pressable
                onPress={
                  item?.status === "unread"
                    ? () => ReadReport({ reportId: item?._id })
                    : undefined
                }
                key={index}
                style={{
                  padding: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  gap: 8,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor:
                    item?.status === "unread"
                      ? theme.active
                      : "rgba(255,255,255,0.05)",
                }}
              >
                {readLoading === item?._id && (
                  <ActivityIndicator
                    size={16}
                    color={theme.active}
                    style={{ position: "absolute", top: 12, right: 12 }}
                  />
                )}
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Pressable
                    onPress={() =>
                      navigation.navigate("User", { item: item.sender })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {activeLanguage?.sender}:
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("User", { item: item.sender })
                    }
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 100,
                      overflow: "hidden",
                    }}
                  >
                    <Img uri={item?.sender?.cover} />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("User", { item: item.sender })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {item?.sender?.name}
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Pressable
                    onPress={() =>
                      navigation.navigate("User", { item: item.receiver })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {activeLanguage?.receiver}:
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      navigation.navigate("User", { item: item.receiver })
                    }
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 100,
                      overflow: "hidden",
                    }}
                  >
                    <Img uri={item.receiver.cover} />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      navigation.navigate("User", { item: item.receiver })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {item?.receiver?.name}
                    </Text>
                  </Pressable>
                </View>
                <Text
                  style={{
                    marginVertical: 8,
                    color: theme.active,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  {activeLanguage?.report_type}:{" "}
                  {language === "GB"
                    ? warnings?.find((w: any) => w.value === item?.reportType)
                        ?.en
                    : language === "GE"
                    ? warnings?.find((w: any) => w.value === item?.reportType)
                        ?.ka
                    : warnings?.find((w: any) => w.value === item?.reportType)
                        ?.ru}
                </Text>
                <Text
                  style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}
                >
                  <FontAwesome name="calendar" size={16} color={theme.active} />
                  {"  "}
                  {FormatDate(item?.createdAt, "")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Reports;

const styles = StyleSheet.create({
  row: {
    paddingBottom: 88,
    position: "relative",
    gap: 8,
  },
});

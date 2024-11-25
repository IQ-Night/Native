import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";

const DailyStats = ({
  selectDate,
  setSelectDate,
  dailyChartData,
  statistics,
}: any) => {
  const { theme, activeLanguage } = useAppContext();

  const [showPicker, setShowPicker] = useState({
    start: false,
    end: false,
  });

  const handleDateChange = (event: any, selectedDate: any, type: any) => {
    if (event.type === "set") {
      // Update date based on picker type (start or end)
      setSelectDate((prev: any) => ({
        ...prev,
        [type]: selectedDate || prev[type],
      }));
    }
    // Close the picker
    setShowPicker((prev) => ({ ...prev, [type]: false }));
  };

  const vips = statistics?.find((item: any) => item.type === "Vip");
  const coins = statistics?.find((item: any) => item.type === "Coins");

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: theme.text,
          marginVertical: 16,
        }}
      >
        {activeLanguage?.daily_stats}:
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          gap: "3%",
        }}
      >
        {/* Start Date Picker */}
        <View style={{ flex: 1, gap: 4, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>
            {activeLanguage?.startDate}:
          </Text>
          <Button
            style={{
              width: "100%",
              backgroundColor: theme.active,
              color: "white",
              opacity: showPicker?.start ? 1 : 0.6,
            }}
            title={`${selectDate.start.toDateString()}`}
            onPressFunction={() => {
              if (showPicker?.start) {
                setShowPicker((prev) => ({
                  ...prev,
                  end: false,
                  start: false,
                }));
              } else {
                setShowPicker((prev) => ({ ...prev, end: false, start: true }));
              }
            }}
          />
        </View>

        {/* End Date Picker */}
        <View style={{ flex: 1, gap: 4, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>
            {activeLanguage?.endDate}:
          </Text>
          <Button
            style={{
              width: "100%",
              backgroundColor: theme.active,
              color: "white",
              opacity: showPicker?.end ? 1 : 0.6,
            }}
            title={`${selectDate.end.toDateString()}`}
            onPressFunction={() => {
              if (showPicker?.end) {
                setShowPicker((prev) => ({
                  ...prev,
                  end: false,
                  start: false,
                }));
              } else {
                setShowPicker((prev) => ({ ...prev, end: true, start: false }));
              }
            }}
          />
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          backgroundColor: theme.active,
          zIndex: 80,
          borderRadius: 8,
          top: 120,
        }}
      >
        {showPicker.start && (
          <DateTimePicker
            value={selectDate.start}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => handleDateChange(event, date, "start")}
          />
        )}
      </View>
      <View
        style={{
          position: "absolute",
          backgroundColor: theme.active,
          zIndex: 80,
          borderRadius: 8,
          top: 120,
        }}
      >
        {showPicker.end && (
          <DateTimePicker
            value={selectDate.end}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => handleDateChange(event, date, "end")}
          />
        )}
      </View>

      <View
        style={{
          flex: 1,
          gap: 12,
          marginTop: 32,
          alignItems: "center",
          width: "100%",
        }}
      >
        <View style={{ gap: 8, width: "90%", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: theme.text, fontWeight: 600 }}>
            {activeLanguage?.total} {activeLanguage?.invoices}:{" "}
            {(vips?.count || 0) + (coins?.count || 0)}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              padding: 8,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 50,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>
              Vips: {vips?.count || 0}
            </Text>
            <Text style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>
              {activeLanguage?.coins}: {coins?.count || 0}
            </Text>
          </View>
        </View>
        <View style={{ gap: 8, width: "90%", alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              color: theme.text,
              fontWeight: 600,
            }}
          >
            {activeLanguage?.total} {activeLanguage?.price}:{" "}
            <Text style={{ color: "green" }}>
              {parseFloat(coins?.total) || 0 + parseInt(vips?.total) || 0}$
            </Text>
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              padding: 8,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 50,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>
              Vips:{" "}
              <Text style={{ color: "green" }}>
                {parseFloat(vips?.total) || 0}$
              </Text>
            </Text>
            <Text style={{ fontSize: 12, color: theme.text, fontWeight: 600 }}>
              {activeLanguage?.coins}:{" "}
              <Text style={{ color: "green" }}>
                {parseFloat(coins?.total) || 0}$
              </Text>
            </Text>
          </View>
        </View>
        <View style={{ height: 240, width: "100%", marginTop: 16 }}>
          <ScrollView
            horizontal
            contentContainerStyle={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 8,
              borderRadius: 8,
              borderBottomColor: theme.active,
              borderBottomWidth: 2,
              paddingBottom: 8,
            }}
          >
            {dailyChartData?.map((item: any, index: number) => {
              // Find the maximum count value to scale the bar height
              const maxCount = Math.max(
                ...dailyChartData.map((data: any) => data?.count)
              );

              // Calculate the bar height based on the count
              const barHeight = (item?.count / maxCount) * 200;

              return (
                <View key={index} style={{ alignItems: "center", gap: 4 }}>
                  <Text
                    style={{ fontWeight: "500", color: "white", fontSize: 10 }}
                  >
                    {item?.totalIncome}$
                  </Text>
                  <View
                    style={{
                      width: 18,
                      height: barHeight, // Dynamically adjust height based on count
                      backgroundColor: theme.active,
                      alignItems: "center",
                      justifyContent: "center",
                      borderTopLeftRadius: 50,
                      borderTopRightRadius: 50,
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: "white" }}>
                      {item?.count}
                    </Text>
                  </View>
                  <Text
                    style={{ fontWeight: "500", fontSize: 10, color: "white" }}
                  >
                    {item?.date}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default DailyStats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateSummary: {
    marginTop: 20,
    fontSize: 16,
    fontStyle: "italic",
  },
});

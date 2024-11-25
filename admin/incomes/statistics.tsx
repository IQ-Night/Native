import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import DailyStats from "./dailyStats";
import MonthlyStats from "./monthlyStats";

const IncomeStats = () => {
  const { theme, apiUrl } = useAppContext();

  /**
   * Get stats
   */

  /**
   * Select date
   */

  const [selectDate, setSelectDate] = useState<any>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default: 1 month ago
    end: new Date(), // Default: Today
  });

  const [statistics, setStatistics] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [monthlyChartData, setMonthlyChartData] = useState<any>(null);

  const GetStats = async () => {
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/admin/incomes/statistics?startDate=" +
          selectDate?.start +
          "&endDate=" +
          selectDate?.end
      );
      if (response.data.status === "success") {
        setStatistics(response.data.data.stats);
        setChartData(response.data.data.dailyChartData);
        setMonthlyChartData(response.data.data.monthlyChartData);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    GetStats();
  }, [selectDate]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 100,
        gap: 12,
      }}
      style={styles.container}
    >
      <DailyStats
        selectDate={selectDate}
        setSelectDate={setSelectDate}
        statistics={statistics}
        dailyChartData={chartData}
      />
      <MonthlyStats monthlyChartData={monthlyChartData} />
    </ScrollView>
  );
};

export default IncomeStats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
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

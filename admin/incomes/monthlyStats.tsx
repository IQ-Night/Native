import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/app";

const MonthlyStats = ({ monthlyChartData }: any) => {
  const { theme, activeLanguage } = useAppContext();
  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
          color: theme.text,
          marginVertical: 16,
        }}
      >
        {activeLanguage?.monthly}:
      </Text>

      <View
        style={{
          flex: 1,
          gap: 12,
          marginTop: 32,
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Monthly Chart */}
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
            {monthlyChartData?.map((item: any, index: number) => {
              const maxCount = Math.max(
                ...monthlyChartData.map((data: any) => data?.count)
              );
              const barHeight = (item?.count / maxCount) * 200;

              return (
                <View key={index} style={{ alignItems: "center", gap: 4 }}>
                  <Text
                    style={{ fontWeight: "500", color: "white", fontSize: 10 }}
                  >
                    {item?.totalIncome}USD
                  </Text>
                  <View
                    style={{
                      width: 18,
                      height: barHeight,
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

export default MonthlyStats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
});

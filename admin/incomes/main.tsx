import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import BanTimer from "../../components/banTimer";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useGameContext } from "../../context/game";
import { FormatDate } from "../../functions/formatDate";

const Incomes = ({}: any) => {
  const navigation: any = useNavigation();

  const { theme, apiUrl, activeLanguage } = useAppContext();
  const { socket } = useGameContext();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [incomes, setIncomes] = useState<any>([]);
  const [totalIncomes, setTotalIncomes] = useState<any>(null);
  const [totalVips, setTotalVips] = useState<any>(null);
  const [totalCoins, setTotalCoins] = useState<any>(null);

  const GetList = async () => {
    try {
      const response = await axios.get(apiUrl + "/api/v1/admin/incomes?page=1");
      if (response?.data.status === "success") {
        setIncomes(response.data.data.incomes);
        setPage(1);
        setLoading(false);
        setTotalIncomes(response.data.totalIncomes);
        setTotalCoins(response?.data?.totalCoins);
        setTotalVips(response?.data?.totalVips);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    GetList();
  }, []);

  /**
   * Add incomes
   */

  const AddIncomes = async () => {
    const newPage = page + 1;

    try {
      const response = await axios.get(
        apiUrl + "/api/v1/admin/incomes?page=" + newPage
      );
      if (response.data.status === "success") {
        const incomesList = response.data.data.incomes;

        setIncomes((prevIncomes: any[]) => {
          // Create a Map with existing incomes using income.id as the key
          const incomesMap = new Map(
            prevIncomes.map((income) => [income._id, income])
          );

          // Iterate over new incomes and add them to the Map if they don't already exist
          incomesList.forEach((newIncome: any) => {
            if (!incomesMap.has(newIncome._id)) {
              incomesMap.set(newIncome._id, newIncome);
            }
          });

          // Convert the Map values back to an array
          return Array.from(incomesMap.values());
        });

        setTotalIncomes(response.data.total);
        setTotalCoins(response?.data?.totalCoins);
        setTotalVips(response?.data?.totalVips);
        setPage(newPage);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  return (
    <View style={styles.blurView}>
      <View style={styles.pressable}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={32} color={theme.active} />
          </View>
        )}
        {incomes?.length < 1 && !loading && (
          <Text style={styles.noIncomesText}> {activeLanguage?.not_found}</Text>
        )}
        {!loading && incomes?.length > 0 && (
          <View
            style={[
              styles.animatedContainer,
              {
                gap: 16,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.text,
              }}
            >
              <Text style={{ color: theme.text }}>
                {activeLanguage?.total}:{" "}
                <Text style={{ color: theme.active }}>{totalIncomes}</Text>
              </Text>
              <Text style={{ color: theme.text }}>
                {" "}
                / Vip: <Text style={{ color: theme.active }}>{totalVips}</Text>
              </Text>
              <Text style={{ color: theme.text }}>
                {" "}
                / {activeLanguage?.coins}:{" "}
                <Text style={{ color: theme.active }}>{totalCoins}</Text>
              </Text>
            </Text>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } =
                  nativeEvent;
                const isCloseToBottom =
                  layoutMeasurement.height + contentOffset.y >=
                  contentSize.height - 350;

                if (isCloseToBottom) {
                  if (totalIncomes > incomes?.length) {
                    AddIncomes();
                  }
                }
              }}
              scrollEventThrottle={400}
            >
              {incomes?.map((item: any, index: number) => {
                return (
                  <View style={styles.incomeItem} key={index}>
                    <View style={{ gap: 4 }}>
                      <View>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: theme.text,
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ color: "green" }}>{item?.price}$</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: theme.text,
                          }}
                        >
                          <Text style={{ color: theme.text }}>
                            {FormatDate(item?.createdAt, "")}
                          </Text>
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: theme.text,
                        }}
                      >
                        <Text style={{ color: theme.active }}>
                          {item?.type?.value === "Coins"
                            ? activeLanguage?.coins
                            : item?.type?.value}
                        </Text>
                      </Text>
                      {item?.type?.value === "Vip" ? (
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: theme.text,
                          }}
                        >
                          {activeLanguage?.duration}:{" "}
                          <Text style={{ color: theme.active }}>
                            {item?.type?.duration.includes("Weeks")
                              ? item?.type?.duration.split(" ")[0] +
                                " " +
                                activeLanguage?.weeks
                              : item?.type?.duration.includes("Week")
                              ? item?.type?.duration.split(" ")[0] +
                                " " +
                                activeLanguage?.week
                              : item?.type?.duration.includes("Months")
                              ? item?.type?.duration.split(" ")[0] +
                                " " +
                                activeLanguage?.months
                              : item?.type?.duration.includes("Month")
                              ? item?.type?.duration.split(" ")[0] +
                                " " +
                                activeLanguage?.month
                              : activeLanguage?.annually}
                          </Text>
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: theme.text,
                          }}
                        >
                          {activeLanguage?.total}:{" "}
                          <Text style={{ color: theme.active }}>
                            {item?.type?.total}
                          </Text>
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          navigation.navigate("User", {
                            item: { ...item.user, _id: item?.user.id },
                          })
                        }
                        style={styles.imageContainer}
                      >
                        <Img uri={item?.user?.cover} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

export default Incomes;

const styles = StyleSheet.create({
  blurView: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 70,
  },
  pressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  animatedContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    flexShrink: 1,
  },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
    height: 300,
    justifyContent: "center",
  },
  noIncomesText: {
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
    fontSize: 14,
    margin: 16,
  },
  IncomesTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
    marginVertical: 8,
  },
  scrollContainer: {
    width: "100%",
    gap: 8,
    alignItems: "center",
    paddingBottom: 100,
  },
  incomeItem: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
  },
  imageContainer: {
    height: 24,
    width: 24,
    borderRadius: 50,
    overflow: "hidden",
  },
  userName: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.5,
  },
});

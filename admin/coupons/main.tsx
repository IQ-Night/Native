import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import CreateCoupon from "./createCoupon";
import EditCoupon from "./editCoupon";
import * as Haptics from "expo-haptics";

const Coupons = () => {
  const navigation: any = useNavigation();
  /**
   * App context
   */
  const { apiUrl, haptics, theme, activeLanguage, language } = useAppContext();

  /**
   * Coupons team
   */
  const [coupons, setCoupons] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const GetCoupons = async () => {
      try {
        const response = await axios.get(apiUrl + "/api/v1/coupons");
        if (response.data.status === "success") {
          setCoupons(response.data.data.coupons);
          setLoading(false);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
        setLoading(false);
      }
    };
    GetCoupons();
  }, []);

  // create coupon
  const [createCoupon, setCreateCoupon] = useState(false);
  // edit coupon
  const [editCoupon, setEditCoupon] = useState(false);

  return (
    <>
      <View style={{ width: "100%", height: "100%" }}>
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
        {coupons?.length < 1 && !loading && (
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
        <ScrollView>
          <View style={styles.row}>
            {coupons?.map((item: any, index: number) => {
              return (
                <Pressable
                  onPress={() => {
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                    setEditCoupon(item);
                  }}
                  key={index}
                  style={{
                    padding: 8,
                    paddingHorizontal: 12,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    gap: 8,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor:
                      item?.status === "unread"
                        ? theme.active
                        : "rgba(255,255,255,0.05)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      marginVertical: 8,
                      color: theme.active,
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    {item?.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          new Date(item?.expiresAt) > new Date()
                            ? theme.active
                            : theme.text,
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {new Date(item?.expiresAt) > new Date()
                        ? activeLanguage?.active
                        : activeLanguage?.unActive}{" "}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            position: "absolute",
            bottom: 80,
            padding: 12,
          }}
        >
          <Button
            title={activeLanguage?.create_coupon}
            style={{
              width: "100%",
              backgroundColor: theme.active,
              color: "white",
            }}
            onPressFunction={() => setCreateCoupon(true)}
          />
        </View>
      </View>
      {createCoupon && (
        <CreateCoupon
          createCopuon={createCoupon}
          setCreateCoupon={setCreateCoupon}
          setCoupons={setCoupons}
        />
      )}
      {editCoupon && (
        <EditCoupon
          editCoupon={editCoupon}
          setEditCoupon={setEditCoupon}
          setCoupons={setCoupons}
        />
      )}
    </>
  );
};

export default Coupons;

const styles = StyleSheet.create({
  row: {
    paddingBottom: 88,
    position: "relative",
    gap: 8,
    padding: 12,
  },
});

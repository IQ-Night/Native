import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Purchases from "react-native-purchases";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { FormatDate } from "../../functions/formatDate";
import Confirm from "./confirm";
import { useContentContext } from "../../context/content";
import { REVENUE_CAT_API_KEY } from "@env";

const Vip = () => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert, activeLanguage } = useAppContext();

  // auth
  const { currentUser, setCurrentUser } = useAuthContext();

  // content context
  const { products, setProducts } = useContentContext();

  /**
   * Buy Vip
   */
  const [loading, setLoading] = useState<any>(null);

  const handlePurchase = async (packageIdentifier: string, data: any) => {
    await Purchases.logOut(); // გადართვა ანონიმურ რეჟიმზე
    Purchases.configure({
      apiKey: REVENUE_CAT_API_KEY, // აქ ჩასვით თქვენი რეალური Public API Key
      appUserID: currentUser?._id,
    });
    setLoading(data?.Vip);

    try {
      // 1. Offerings-ის მოპოვება
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering) {
        throw new Error("No current offering found.");
      }

      // 2. აირჩიე საჭირო Package
      const selectedPackage = currentOffering.availablePackages.find(
        (pkg) => pkg.identifier === packageIdentifier
      );

      if (!selectedPackage) {
        throw new Error(
          `Package not found for identifier: ${packageIdentifier}`
        );
      }

      // 3. შესყიდვის განხორციელება
      const purchaseResult = await Purchases.purchasePackage(selectedPackage);

      if (purchaseResult) {
        BuyVip(data);
        setAlert({
          active: true,
          type: "success",
          text: "Purchase completed successfully!",
        });
      }
    } catch (error: any) {
      if (error.userCancelled) {
        console.log("User cancelled the purchase.");
      } else {
        console.error("Purchase failed:", error);
        setAlert({
          active: true,
          type: "error",
          text: error.message || "Purchase failed. Please try again later.",
        });
      }
      setLoading(false);
    }
  };
  const BuyVip = async ({ Vip, price }: any) => {
    const invoice = {
      type: "Buy Vip",
      Vip: Vip,
      price: price,
      createdAt: new Date(),
    };
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/users/" + currentUser?._id + "/buyVip",
        { ...invoice }
      );
      if (response.data.status === "success") {
        const newUser = {
          ...currentUser,
          vip: response?.data?.data?.vip,
        };

        setCurrentUser(newUser);
        setConfirm(null);
        setAlert({
          active: true,
          type: "success",
          text: activeLanguage?.vipBought,
        });
      }

      setLoading(null);
    } catch (error: any) {
      console.log(error.response);
      setLoading(null);
      setConfirm(null);
    }
  };

  // confirm purchase
  const [confirm, setConfirm] = useState<any>(null);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 8,
          gap: 16,
          paddingHorizontal: 12,
          paddingBottom: 100,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 600, color: theme.text }}>
            {activeLanguage?.advantages}:
          </Text>
          <View style={{ padding: 12, gap: 6, paddingBottom: 0 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <MaterialIcons color={theme.active} size={16} name="done" />
              <Text style={{ color: theme.active, fontWeight: 600 }}>
                {activeLanguage?.allRolesFree}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <MaterialIcons color={theme.active} size={16} name="done" />
              <Text style={{ color: theme.active, fontWeight: 600 }}>
                {activeLanguage?.openRoomFree}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <MaterialIcons color={theme.active} size={16} name="done" />
              <Text style={{ color: theme.active, fontWeight: 600 }}>
                {activeLanguage?.privateRoomFree}
              </Text>
            </View>
          </View>
        </View>
        {products?.length > 0 &&
          products?.map((pc: any, x: number) => {
            const c = pc?.product;
            const indexOfActive = products?.findIndex((p: any) =>
              p.product?.title.includes(currentUser?.vip.duration)
            );

            return (
              <View
                key={x}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  height: 196,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  paddingVertical: 20,
                  opacity: indexOfActive < x ? 0.5 : 1,
                }}
              >
                <MaterialIcons
                  name="diamond"
                  size={100}
                  color={theme.text}
                  style={{
                    position: "absolute",
                    opacity: 0.05,
                    left: 0,
                    top: 0,
                  }}
                />
                <MaterialIcons
                  name="diamond"
                  size={100}
                  color={theme.text}
                  style={{
                    position: "absolute",
                    opacity: 0.05,
                    right: 0,
                    bottom: 0,
                    transform: [{ scaleX: -1 }], // Flip horizontally
                  }}
                />
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      color: theme.active,
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {c?.title?.includes("6 Months")
                      ? 6 + " " + activeLanguage?.months
                      : c?.title?.includes("1 Month")
                      ? 1 + " " + activeLanguage?.month
                      : c?.title?.includes("3 Months")
                      ? 3 + " " + activeLanguage?.months
                      : c?.title?.includes("Week")
                      ? 1 + " " + activeLanguage?.week
                      : activeLanguage?.annually}{" "}
                  </Text>
                  <MaterialIcons
                    name="diamond"
                    size={24}
                    color={theme.active}
                  />
                </View>
                <Text style={{ fontSize: 24, fontWeight: 600, color: "white" }}>
                  {parseFloat(c?.price).toFixed(2)} {c?.currencyCode}
                </Text>
                <Button
                  title={
                    c?.title?.includes(currentUser?.vip?.duration)
                      ? `${activeLanguage?.active} - ${activeLanguage?.expires}: ` +
                        FormatDate(currentUser?.vip?.expiresAt, "onlyDate")
                      : activeLanguage?.buy
                  }
                  style={{
                    width: "100%",
                    backgroundColor: theme.active,
                    color: "white",
                  }}
                  disabled={
                    c?.title?.includes(currentUser?.vip?.duration) ||
                    indexOfActive < x
                  }
                  loading={c?.title?.includes(loading)}
                  onPressFunction={() => {
                    setConfirm({
                      active: true,
                      data: {
                        identity: pc?.identifier,
                        data: {
                          Vip: c?.title,
                          price: parseFloat(c?.price).toFixed(2),
                        },
                      },
                    });

                    // handlePurchase(c?.identity, {
                    //   Vip: c?.duration,
                    //   price: c?.price,
                    //   duration: c?.duration,
                    // });
                  }}
                />
              </View>
            );
          })}
      </ScrollView>
      {confirm && (
        <Confirm
          openState={confirm?.active}
          setOpenState={setConfirm}
          data={confirm?.data}
          handlePurchase={handlePurchase}
        />
      )}
    </>
  );
};

export default Vip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    zIndex: 20,
  },
  header: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
});

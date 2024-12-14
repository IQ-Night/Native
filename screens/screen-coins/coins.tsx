import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useContentContext } from "../../context/content";
import Confirm from "./confirm";
import { identity } from "lodash";
import Purchases from "react-native-purchases";
import { REVENUE_CAT_API_KEY } from "@env";

const Coins = () => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert, activeLanguage } = useAppContext();

  // auth
  const { currentUser, setCurrentUser } = useAuthContext();
  // content
  const { coins } = useContentContext();

  /**
   * Buy coins
   */
  const [loading, setLoading] = useState<any>(null);
  // confirm buying
  const [confirm, setConfirm] = useState<any>(null);

  const purchaseCoins = async (packageIdentifier: string, data: any) => {
    // 1. Switch to the target user
    await Purchases.logOut(); // გადართვა ანონიმურ რეჟიმზე
    Purchases.configure({
      apiKey: REVENUE_CAT_API_KEY, // აქ ჩასვით თქვენი რეალური Public API Key
      appUserID: currentUser?._id,
    });
    setLoading(data?.coins);
    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.all["Coins"]?.availablePackages;

      if (!currentOffering) {
        throw new Error("No current offering found.");
      }

      const selectedPackage = currentOffering.find(
        (pkg) => pkg.identifier === packageIdentifier
      );

      if (!selectedPackage) {
        throw new Error(
          `Package not found for identifier: ${packageIdentifier}`
        );
      }

      const purchaseResult = await Purchases.purchasePackage(selectedPackage);

      if (purchaseResult) {
        BuyCoins({ ...data });
        setConfirm(null);
      }
    } catch (error: any) {
      if (error.userCancelled) {
        console.log("User cancelled the purchase.");
      } else {
        console.error("Purchase failed:", error);
      }
      setLoading(false);
    }
  };

  const BuyCoins = async ({ coins, price }: any) => {
    const invoice = {
      type: "Buy coins",
      coins: coins,
      price: parseFloat(price),
      createdAt: new Date(),
    };
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/users/" + currentUser?._id + "/buyCoins",
        { ...invoice }
      );
      if (response.data.status === "success") {
        const newUser = {
          ...currentUser,
          coins: {
            ...currentUser.coins,
            total: (currentUser.coins.total || 0) + coins,
          }, // Safely update total
        };

        setCurrentUser(newUser);
        setConfirm(null);
        setAlert({
          active: true,
          type: "success",
          text: activeLanguage?.coinsBought,
        });
      }

      setLoading(null);
    } catch (error: any) {
      console.log(error.response);
      setLoading(null);
      setConfirm(null);
    }
  };

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
        {coins?.map((pc: any, x: number) => {
          const c = pc.product;
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
              }}
            >
              <MaterialCommunityIcons
                name="hand-coin-outline"
                size={100}
                color={theme.text}
                style={{ position: "absolute", opacity: 0.05, left: 0, top: 0 }}
              />
              <MaterialCommunityIcons
                name="hand-coin-outline"
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
              <Text
                style={{ color: theme.active, fontSize: 24, fontWeight: 700 }}
              >
                {c?.identifier?.split("_")[1]}{" "}
                <FontAwesome6 name="coins" size={24} color={theme.active} />
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 600, color: "white" }}>
                {parseFloat(c?.price).toFixed(2)}
                {c?.currencyCode}
              </Text>
              <Button
                title={
                  confirm === c?.size
                    ? `${activeLanguage.confirm} (" + clearTimeoutValue + ")`
                    : activeLanguage?.buy
                }
                style={{
                  width: "100%",
                  backgroundColor: confirm === c?.size ? "green" : theme.active,
                  color: "white",
                }}
                loading={loading === parseFloat(c?.identifier?.split("_")[1])}
                onPressFunction={() =>
                  setConfirm({
                    active: true,
                    data: {
                      identity: pc?.identifier,
                      coins: parseInt(c?.identifier?.split("_")[1]),
                      price: parseFloat(c?.price).toFixed(2),
                    },
                  })
                }
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
          handlePurchase={purchaseCoins}
        />
      )}
    </>
  );
};

export default Coins;

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

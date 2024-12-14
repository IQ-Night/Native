import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppContext } from "../../context/app";
import Button from "../../components/button";
import axios from "axios";
import { useAuthContext } from "../../context/auth";
import { ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Img from "../../components/image";
import { useContentContext } from "../../context/content";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const SendGift = ({ openState, setOpenState, user, setUser }: any) => {
  const { theme, haptics, apiUrl, setAlert, activeLanguage } = useAppContext();
  const { currentUser, setCurrentUser } = useAuthContext();
  const { setConfirmAction } = useContentContext();

  // animation component
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // Start off-screen

  // Animation to slide the popup in and out
  useEffect(() => {
    if (openState) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [openState]);

  // Function to close the confirmation popup
  const closeComponent = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setOpenState(false);
    });
  };

  // assets
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any>([]);

  const GetAssets = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/products/user/" + currentUser?._id
      );
      if (response?.data?.status === "success") {
        setAssets(response.data.data.products);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    GetAssets();
  }, []);
  /**
   * Sending
   */
  const [selectGift, setSelectGift] = useState<any>(null);

  const Send = async () => {
    if (selectGift?.type === "vip") {
      setSelectGift(null);
      try {
        const newGift = {
          sender: currentUser?._id,
          receiver: user?._id,
          gift: selectGift,
        };
        const response = await axios.patch(
          apiUrl + "/api/v1/sendGift",
          newGift
        );
        if (response.data.status === "success") {
          setAlert({
            active: true,
            text: activeLanguage?.giftSent,
            type: "success",
          });
        }
      } catch (error: any) {
        setAlert({
          active: true,
          text: error.response.data.message,
          type: "error",
        });
        console.log(error.response.data.message);
      }
    } else if (selectGift.type === "asset") {
      try {
        const newGift = {
          sender: currentUser?._id,
          receiver: user?._id,
          gift: selectGift,
        };
        const response = await axios.patch(
          apiUrl + "/api/v1/sendGift",
          newGift
        );
        if (response.data.status === "success") {
          setCurrentUser((prev: any) => ({
            ...prev,
            coins: {
              ...prev.coins,
              total: prev.coins.total - parseInt(selectGift?.price),
            },
          }));

          setAlert({
            active: true,
            text: activeLanguage?.giftSent,
            type: "success",
          });
        }
      } catch (error: any) {
        setAlert({
          active: true,
          text: error.response.data.message,
          type: "error",
        });
        console.log(error.response.data.message);
      }
    } else if (selectGift.type === "coins") {
      try {
        const newGift = {
          sender: currentUser?._id,
          receiver: user?._id,
          gift: selectGift,
        };
        const response = await axios.patch(
          apiUrl + "/api/v1/sendGift",
          newGift
        );
        if (response.data.status === "success") {
          setCurrentUser((prev: any) => ({
            ...prev,
            coins: {
              ...prev.coins,
              total: prev.coins.total - parseInt(selectGift?.price),
            },
          }));
          setAlert({
            active: true,
            text: activeLanguage?.giftSent,
            type: "success",
          });
        }
      } catch (error: any) {
        setAlert({
          active: true,
          text: error.response.data.message,
          type: "error",
        });
        console.log(error.response.data.message);
      }
    }
  };

  /**
   * Store state
   */
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(null);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");

  //Get Products
  const GetProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        apiUrl + "/api/v1/products?type=" + type + "&search=" + search
      );
      if (response.data.status === "success") {
        setProducts(response.data.data.products);
        setTotalProducts(response.data.totalProducts);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetProducts();
  }, [type, search]);
  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={() => {
          if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          closeComponent();
        }}
      >
        <MaterialIcons name="arrow-drop-down" size={42} color={theme.active} />
      </Pressable>
      <Animated.View
        style={{
          position: "absolute",
          bottom: "14%",
          height: "80%",
          width: "95%",
          borderRadius: 24,
          overflow: "hidden",
          transform: [{ translateY: slideAnim }],
          backgroundColor: "rgba(255,255,255,0.05)",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme.active,
            paddingBottom: 8,
          }}
        >
          {activeLanguage?.select_gift}
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: "100%" }}
          contentContainerStyle={styles.gridContainer}
        >
          <View style={{ flex: 1, marginTop: 8, gap: 4 }}>
            {/* <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.text,
                marginVertical: 4,
              }}
            >
              VIP
            </Text>
            {user?.vip?.active ? (
              <Text
                style={{
                  marginVertical: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.active,
                }}
              >
                The User already has VIP status!
              </Text>
            ) : (
              <View style={styles.gridContainer}>
                {loading ? (
                  <View style={{ width: "100%", alignItems: "center" }}>
                    <ActivityIndicator
                      size={32}
                      color={theme.active}
                      style={{ marginTop: 48 }}
                    />
                  </View>
                ) : (
                  vips.map((item: any, index: number) => {
                    return (
                      <VipItem
                        key={index}
                        item={item}
                        selectGift={selectGift}
                        setSelectGift={setSelectGift}
                      />
                    );
                  })
                )}
              </View>
            )} */}

            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.text,
                marginVertical: 4,
              }}
            >
              {activeLanguage?.coins} / {activeLanguage?.total}:{" "}
              {currentUser?.coins.total}{" "}
              <FontAwesome5 name="coins" size={14} color={theme.active} />
            </Text>
            <View style={styles.gridContainer}>
              {loading ? (
                <View style={{ width: "100%", alignItems: "center" }}>
                  <ActivityIndicator
                    size={32}
                    color={theme.active}
                    style={{ marginTop: 48 }}
                  />
                </View>
              ) : (
                coins.map((item: any, index: number) => {
                  return (
                    <CoinItem
                      key={index}
                      item={item}
                      selectGift={selectGift}
                      setSelectGift={setSelectGift}
                    />
                  );
                })
              )}
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.text,
                marginVertical: 4,
              }}
            >
              {activeLanguage?.assets}
            </Text>
            <View style={styles.gridContainer}>
              {loading ? (
                <View style={{ width: "100%", alignItems: "center" }}>
                  <ActivityIndicator
                    size={32}
                    color={theme.active}
                    style={{ marginTop: 48 }}
                  />
                </View>
              ) : (
                assets.map((item: any, index: number) => {
                  return (
                    <AssetItem
                      key={index}
                      item={item}
                      selectGift={selectGift}
                      setSelectGift={setSelectGift}
                      user={user}
                    />
                  );
                })
              )}
            </View>
            {products.some(
              (item: any) => !assets?.find((a: any) => a._id === item._id)
            ) && (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: theme.text,
                  marginVertical: 4,
                }}
              >
                {activeLanguage?.explore_assets}
              </Text>
            )}

            <View style={styles.gridContainer}>
              {loading ? (
                <View style={{ width: "100%", alignItems: "center" }}>
                  <ActivityIndicator
                    size={32}
                    color={theme.active}
                    style={{ marginTop: 48 }}
                  />
                </View>
              ) : (
                products.map((item: any, index: number) => {
                  if (assets?.find((a: any) => a._id === item._id)) {
                    return null; // თუ ელემენტი უკვე არსებობს assets-ში, არ დააბრუნოს არაფერი
                  }
                  return (
                    <AssetItem
                      key={item._id || index} // უკეთესია _id გამოიყენოთ, თუ უნიკალურია
                      item={item}
                      selectGift={selectGift}
                      setSelectGift={setSelectGift}
                      user={user}
                    />
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>

        <Button
          onPressFunction={() =>
            setConfirmAction({
              active: true,
              text: activeLanguage?.giftSent,
              price: selectGift?.price,
              Function: () => Send(),
              money: selectGift?.moneyType,
              successText: activeLanguage?.giftSent,
            })
          }
          title={activeLanguage?.send}
          style={{
            width: "100%",
            backgroundColor: theme.active,
            color: "white",
          }}
          disabled={!selectGift}
        />
      </Animated.View>
    </BlurView>
  );
};

export default SendGift;

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
    marginBottom: 16,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 70) / 3, // Divide the screen width by 2 for two columns, with padding
    height: (SCREEN_WIDTH - 70) / 3, // Divide the screen width by 2 for two columns, with padding
    overflow: "hidden",
    borderRadius: 10,
  },
});

const AssetItem = ({
  item,
  state,
  setAvatars,
  selectGift,
  setSelectGift,
  user,
}: any) => {
  const { theme, haptics } = useAppContext();
  const navigation: any = useNavigation();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  return (
    <Pressable
      onPress={() => {
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        if (item === selectGift?.item) {
          setSelectGift(null);
        } else {
          setSelectGift({
            item: item,
            price:
              item?.price && item?.founder?.userId !== user?._id
                ? (item.price + (item?.price / 100) * 5).toFixed(0)
                : 5,
            type: "asset",
            moneyType: "coins",
            asset: item?._id,
          });
        }
      }}
      style={[
        styles.gridItem,
        {
          borderWidth: 2,
          borderColor:
            item === selectGift?.item ? theme.active : "rgba(255,255,255,0.1)",
        },
      ]}
    >
      <Img uri={item.file} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          position: "absolute",
          bottom: 8,
          left: 8,
          backgroundColor: theme.active,
          borderRadius: 10,
          padding: 2,
          paddingHorizontal: 8,
        }}
      >
        <FontAwesome5 name="coins" size={12} color="white" />
        {item?.price && item?.founder?.userId !== user?._id ? (
          <Text
            style={{
              color: "white",
              marginLeft: 4,
              fontWeight: "500",
              fontSize: 12,
            }}
          >
            {(item.price + (item?.price / 100) * 5).toFixed(0)}
          </Text>
        ) : (
          <Text
            style={{
              color: "white",
              marginLeft: 4,
              fontWeight: "500",
              fontSize: 12,
            }}
          >
            5
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const CoinItem = ({
  item,
  state,
  setAvatars,
  selectGift,
  setSelectGift,
}: any) => {
  const { theme, haptics } = useAppContext();
  const navigation: any = useNavigation();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  return (
    <Pressable
      onPress={() => {
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        if (item === selectGift?.item) {
          setSelectGift(null);
        } else {
          setSelectGift({
            item: item,
            price: (item.size + (item?.size / 100) * 5).toFixed(0),
            type: "coins",
            moneyType: "coins",
          });
        }
      }}
      style={[
        styles.gridItem,
        {
          height: 80,
          padding: 12,
          gap: 12,
          justifyContent: "center",
          borderWidth: 2,
          borderColor:
            item === selectGift?.item ? theme.active : "rgba(255,255,255,0.1)",
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.active,
          borderRadius: 50,
          padding: 2,
          paddingHorizontal: 8,
        }}
      >
        <FontAwesome5 name="coins" size={18} color="white" />
        <Text
          style={{
            color: "white",
            marginLeft: 4,
            fontWeight: "500",
            fontSize: 18,
          }}
        >
          {item.size}
        </Text>
      </View>
      <Text
        style={{
          color: "white",
          marginLeft: 4,
          fontWeight: "500",
          fontSize: 12,
        }}
      >
        + 5% Tax
      </Text>
    </Pressable>
  );
};

// const VipItem = ({
//   item,
//   state,
//   setAvatars,
//   selectGift,
//   setSelectGift,
// }: any) => {
//   const { theme, haptics, activeLanguage } = useAppContext();
//   const navigation: any = useNavigation();
//   /**
//    * Auth context
//    */
//   const { currentUser } = useAuthContext();

//   return (
//     <Pressable
//       onPress={() => {
//         if (haptics) {
//           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
//         }
//         if (item === selectGift?.item) {
//           setSelectGift(null);
//         } else {
//           setSelectGift({
//             item: item,
//             price: (item.price + (item?.price / 100) * 5).toFixed(0),
//             type: "vip",
//             moneyType: "money",
//             vip: item,
//           });
//         }
//       }}
//       style={[
//         styles.gridItem,
//         {
//           height: 100,
//           padding: 6,
//           gap: 12,
//           justifyContent: "center",
//           alignItems: "center",
//           borderWidth: 2,
//           borderColor:
//             item === selectGift?.item ? theme.active : "rgba(255,255,255,0.1)",
//         },
//       ]}
//     >
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           justifyContent: "center",
//           borderRadius: 50,
//           padding: 2,
//           paddingHorizontal: 8,
//         }}
//       >
//         <MaterialIcons name="diamond" size={16} color={theme.active} />
//         <Text
//           style={{
//             color: "white",
//             marginLeft: 4,
//             fontWeight: "500",
//             fontSize: 16,
//           }}
//         >
//           {item?.duration?.includes("Weeks")
//             ? item.duration.split(" ")[0] + " " + activeLanguage?.weeks
//             : item?.duration?.includes("Week")
//             ? item.duration.split(" ")[0] + " " + activeLanguage?.week
//             : item?.duration?.includes("Months")
//             ? item.duration.split(" ")[0] + " " + activeLanguage?.months
//             : item?.duration?.includes("Month")
//             ? item.duration.split(" ")[0] + " " + activeLanguage?.month
//             : activeLanguage?.annually}
//         </Text>
//       </View>

//       <Text
//         style={{
//           color: "green",
//           marginLeft: 4,
//           fontWeight: 600,
//           fontSize: 16,
//         }}
//       >
//         {(item.price + (item?.price / 100) * 5).toFixed(0)}USD
//       </Text>
//       <Text
//         style={{
//           color: "white",
//           marginLeft: 4,
//           fontWeight: "500",
//           fontSize: 12,
//         }}
//       >
//         + 5% Tax
//       </Text>
//     </Pressable>
//   );
// };

const coins = [
  {
    size: 100,
  },
  {
    size: 200,
  },
  {
    size: 500,
  },
  {
    size: 1000,
  },
  {
    size: 1500,
  },
  {
    size: 2000,
  },
  {
    size: 3500,
  },
];

// const vips = [
//   {
//     duration: "1 Week",
//     price: 210,
//   },
//   {
//     duration: "1 Month",
//     price: 1500,
//   },
//   {
//     duration: "3 Months",
//     price: 50,
//   },
//   {
//     duration: "6 Months",
//     price: 80,
//   },
//   {
//     duration: "Annually",
//     price: 140,
//   },
// ];

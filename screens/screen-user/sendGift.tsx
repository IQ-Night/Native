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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const SendGift = ({ openState, setOpenState, user }: any) => {
  const { theme, haptics, apiUrl, setAlert } = useAppContext();
  const { currentUser, setCurrentUser } = useAuthContext();

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
  const [selectGift, setSelectGift] = useState(null);

  const SendGift = async () => {
    try {
      const newGift = {
        sender: currentUser?._id,
        receiver: user?._id,
        gift: selectGift,
      };
      const response = await axios.patch(
        apiUrl + "/api/v1/users/sendGift",
        newGift
      );
      if (response.data.status === "success") {
        setAlert({
          active: true,
          text: "Gift sent successfully!",
          type: "success",
        });
        setCurrentUser((prev: any) => ({
          ...prev,
          coins: {
            ...prev.coins,
            total: prev.coins.total - response.data.data.price,
          },
        }));
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };
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
          Select Gift
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: "100%" }}
          contentContainerStyle={styles.gridContainer}
        >
          <View style={{ flex: 1, marginTop: 8, gap: 4 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme.text,
                marginVertical: 4,
              }}
            >
              VIP
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
                    <Item
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
              Coins / Total: {currentUser?.coins.total}{" "}
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
                assets.map((item: any, index: number) => {
                  return (
                    <Item
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
              Assets
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
                    <Item
                      key={index}
                      item={item}
                      selectGift={selectGift}
                      setSelectGift={setSelectGift}
                    />
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>

        <Button
          onPressFunction={() => alert("Sent")}
          title="Send"
          style={{
            width: "100%",
            backgroundColor: theme.active,
            color: "white",
          }}
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
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
  },
});

const Item = ({ item, state, setAvatars, selectGift, setSelectGift }: any) => {
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
        if (item === selectGift) {
          setSelectGift(null);
        } else {
          setSelectGift(item);
        }
      }}
      style={[
        styles.gridItem,
        {
          borderWidth: 2,
          borderColor:
            item === selectGift ? theme.active : "rgba(255,255,255,0.1)",
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
        {item?.price ? (
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

import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { useAuthContext } from "../../context/auth";

const BuyItem = ({ item, closeComponent, setState }: any) => {
  const { apiUrl, theme, setAlert } = useAppContext();

  const { currentUser, setCurrentUser } = useAuthContext();

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const close = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => closeComponent());
  };
  const [loading, setLoading] = useState(false);
  const BuyItem = async () => {
    try {
      setLoading(true);
      const response = await axios.patch(
        apiUrl + "/api/v1/products/buyProduct/" + item?._id,
        {
          buyer: currentUser?._id,
          price: item?.price,
        }
      );
      if (response.data.status === "success") {
        setState((prev: any) =>
          prev?.map((i: any) => {
            if (i?._id === item?._id) {
              return { ...i, owners: [...i.owners, currentUser?._id] };
            } else {
              return i; // Return the original item if there's no match
            }
          })
        );
        setCurrentUser((prev: any) => ({
          ...prev,
          coins: {
            ...prev.coins, // Spread the existing coins object
            total: prev.coins.total - item?.price, // Update the total property
          },
        }));

        close();
        setAlert({
          active: true,
          type: "success",
          text: "Product has been bought successfully!",
        });
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 90,
        transform: [{ scale: scaleAnim }],
        opacity: scaleAnim,
        width: "100%",
        height: "100%",
      }}
    >
      <BlurView
        intensity={120}
        tint="dark"
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: 600 }}>
          Buy Product
        </Text>
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Img uri={item?.file} />
        </View>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}>
          Price: {item?.price}{" "}
          <FontAwesome5 name="coins" size={14} color="orange" />
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            gap: 16,
            paddingHorizontal: 12,
          }}
        >
          <Button
            title="Cancel"
            style={{ width: "45%", color: "white", backgroundColor: "#888" }}
            onPressFunction={close}
          />
          <Button
            loading={loading}
            title={`Buy`}
            style={{ width: "45%", color: "white", backgroundColor: "green" }}
            onPressFunction={BuyItem}
          />
        </View>
      </BlurView>
    </Animated.View>
  );
};

export default BuyItem;

const styles = StyleSheet.create({});

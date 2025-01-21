import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../../components/button";
import Input from "../../components/input";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import axios from "axios";

const Confirm = ({ openState, setOpenState, data, handlePurchase }: any) => {
  const { currentUser } = useAuthContext();
  const { theme, haptics, setAlert, apiUrl, activeLanguage } = useAppContext();
  const slideAnim = useRef(new Animated.Value(220)).current; // Start off-screen

  useEffect(() => {
    if (openState) {
      Animated.timing(slideAnim, {
        toValue: 0, // Slide back down
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [openState]);

  // Function to close the confirmation popup
  const closeComponent = () => {
    Animated.timing(slideAnim, {
      toValue: 220, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setOpenState(null);
    });
  };

  // coupons
  const [input, setInput] = useState("");
  const [coupon, setCoupon] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const FindCoupon = async () => {
    try {
      const response = await axios.get(apiUrl + "/api/v1/coupons/" + input);
      if (response?.data?.status === "success") {
        if (response?.data?.data?.coupon) {
          setCoupon(response?.data?.data?.coupon);
        } else {
          alert("Coupon not found!");
        }
        setInput("");
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  // Function to handle user confirmation
  const handleConfirm = () => {
    handlePurchase(data?.identity, { ...data, coupon });
    closeComponent(); // Close popup
  };

  const inputRef = useRef<any>();

  const totalPrice =
    coupon?.type === "solid"
      ? parseFloat(data?.price) - coupon?.discount
      : parseFloat(data?.price) -
        (parseFloat(data?.price) / 100) * coupon?.discount;
  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={{ width: "100%", height: "100%", position: "absolute" }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100} // საჭიროებისამებრ შეცვალე
      >
        <Pressable
          onPress={() => inputRef?.current?.blur()}
          style={{ width: "100%", height: "100%" }}
        >
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              height: 300,
              width: "100%",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              transform: [{ translateY: slideAnim }],
            }}
          >
            <BlurView
              intensity={120}
              tint="dark"
              style={{
                width: "100%",
                height: "100%",
                gap: 24,
                paddingTop: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: theme.text,
                  textAlign: "center",
                }}
              >
                {activeLanguage?.confirm}
              </Text>
              <View style={{ paddingHorizontal: 24, gap: 16, width: "100%" }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: theme.text,
                    textAlign: "center",
                  }}
                >
                  {activeLanguage?.discount_coupon} ({activeLanguage?.optional})
                </Text>
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <View style={{ width: "86%" }}>
                    {coupon ? (
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          color: theme.active,
                        }}
                      >
                        {coupon?.title} -{coupon?.discount}
                        {coupon?.type === "percent" ? "%" : "$"}
                      </Text>
                    ) : (
                      <Input
                        placeholder={activeLanguage?.enter_here}
                        onChangeText={(text: string) => setInput(text)}
                        type="text"
                        value={input}
                        ref={inputRef}
                      />
                    )}
                  </View>
                  <MaterialIcons
                    name={coupon ? "close" : "done"}
                    onPress={() => {
                      if (input?.length > 0) {
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                        return FindCoupon();
                      }
                      if (coupon) {
                        return setCoupon(null);
                      }
                    }}
                    size={32}
                    color={
                      input?.length > 0 ? theme.active : coupon ? "red" : "#888"
                    }
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Button
                  title={activeLanguage?.cancel}
                  onPressFunction={closeComponent}
                  style={{
                    width: "45%",
                    backgroundColor: "#888",
                    color: "white",
                  }}
                />

                <Button
                  title={
                    <Text
                      style={{
                        color: theme.text,
                        fontWeight: 600,
                        marginVertical: 6,
                      }}
                    >
                      {activeLanguage?.buy}
                      <Text style={{ color: theme.active }}>
                        {totalPrice ? totalPrice?.toFixed(2) : data?.price}$
                      </Text>
                    </Text>
                  }
                  onPressFunction={handleConfirm}
                  style={{
                    width: "45%",
                    backgroundColor: "green",
                    color: "white",
                  }}
                />
              </View>
            </BlurView>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </BlurView>
  );
};

export default Confirm;

const styles = StyleSheet.create({});

import axios from "axios";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../../../components/button";
import Input from "../../../components/input";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useProfileContext } from "../../../context/profile";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useContentContext } from "../../../context/content";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const EditSlogan = ({ navigation, item, setItem }: any) => {
  /**
   * App context
   */
  const { apiUrl, haptics, theme, activeLanguage, setAlert } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser, GetUser } = useAuthContext();
  /**
   * content context
   */
  const { setRerenderProfile } = useContentContext();

  /**
   * Edit field
   */
  const [input, setInput] = useState(item.slogan);
  /**
   * Clan context
   */
  const { setUpdateClanState, updateClanState, setClans } = useProfileContext();

  /**
   * Edit slogan
   */
  const [loading, setLoading] = useState(false);

  const EditSlogan = async () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    if (input?.length < 1) {
      return setUpdateClanState(null);
    }
    const needToPay = item.price.slogan < 1;
    if (needToPay && currentUser?.coins?.total < 700) {
      return setAlert({
        active: true,
        text: activeLanguage?.notEnoughCoinsSetPaidSlogan,
        type: "error",
      });
    }
    try {
      // Dismiss keyboard to disable focus
      Keyboard.dismiss();

      setLoading(true);
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item._id + "?type=slogan&paid=" + needToPay,
        {
          slogan: input,
        }
      );
      if (response.data.status === "success") {
        GetUser();
        navigation.setParams({
          item: {
            ...item,
            slogan: input,
            price: needToPay ? { ...item.price, slogan: 700 } : item.price,
          },
        });
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  const slideAnim = useRef(new Animated.Value(220)).current; // Start off-screen

  // Animation to slide the popup in and out
  useEffect(() => {
    if (updateClanState === "Edit Slogan") {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [updateClanState]);

  // Function to close the confirmation popup
  const closeState = () => {
    Animated.timing(slideAnim, {
      toValue: 500, // Slide back down
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setUpdateClanState(null);
    });
  };

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        zIndex: 90,
        alignItems: "center",
      }}
    >
      <Pressable
        style={{ margin: 12, marginBottom: 0 }}
        onPress={() => {
          closeState();
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        }}
      >
        <MaterialIcons name="arrow-drop-down" size={42} color={theme.active} />
      </Pressable>
      <Animated.View
        style={{
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 124,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            borderRadius: 10,
            width: "90%",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Input
            placeholder={activeLanguage?.slogan}
            onChangeText={(text: string) => setInput(text)}
            type="text"
            onSubmitEditing={EditSlogan}
            returnKeyType="go"
            value={input}
          />
          <Button
            style={{
              width: (SCREEN_WIDTH / 100) * 90,
              color: "white",
              backgroundColor: theme.active,
            }}
            disabled={input === item?.slogan}
            icon={
              item?.price.slogan < 1 &&
              input?.length > 0 && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={{ color: "white", fontWeight: 600 }}>
                    (
                    <Text style={{ color: "white", fontWeight: 600 }}>
                      700{" "}
                    </Text>
                    <FontAwesome5 name="coins" size={14} color="white" />)
                  </Text>
                </View>
              )
            }
            title={activeLanguage?.change_slogan}
            loading={loading}
            onPressFunction={() => EditSlogan()}
          />
        </Pressable>
      </Animated.View>
    </BlurView>
  );
};

export default EditSlogan;

const styles = StyleSheet.create({});

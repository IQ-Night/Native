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

const EditTitle = ({ navigation, item, setItem }: any) => {
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
  const [input, setInput] = useState(item.title);
  /**
   * Clan context
   */
  const { updateClanState, setUpdateClanState, setClans } = useProfileContext();

  /**
   * Edit title
   */
  const [loading, setLoading] = useState(false);

  const EditTitle = async () => {
    if (input?.length < 1) {
      return setUpdateClanState(null);
    }
    const needToPay = item.price.title < 1;
    if (needToPay && currentUser?.coins?.total < 800) {
      return setAlert({
        active: true,
        text: "You don't have enough coins to set paid title!",
        type: "error",
      });
    }
    try {
      // Dismiss keyboard to disable focus
      Keyboard.dismiss();

      setLoading(true);
      const response = await axios.patch(
        apiUrl + "/api/v1/clans/" + item._id + "?type=name&paid=" + needToPay,
        {
          title: input,
        }
      );
      if (response.data.status === "success") {
        GetUser();
        navigation.setParams({
          item: {
            ...item,
            title: input,
            price: needToPay ? { ...item.price, title: 800 } : item.price,
          },
        });
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
      if (
        error.response.data.message.includes(
          "E11000 duplicate key error collection"
        )
      ) {
        setAlert({
          active: true,
          text: "The clan with same title already defined, please use different title!",
          type: "error",
        });
      }
    }
  };

  const slideAnim = useRef(new Animated.Value(220)).current; // Start off-screen

  // Animation to slide the popup in and out
  useEffect(() => {
    if (updateClanState === "Edit Title") {
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
        zIndex: 90,
        top: 0,
        alignItems: "center",
      }}
    >
      <Pressable
        style={{ margin: 12, marginBottom: 0 }}
        onPress={() => {
          closeState();
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
            placeholder={activeLanguage.fullName}
            onChangeText={(text: string) => setInput(text)}
            type="text"
            onSubmitEditing={EditTitle}
            returnKeyType="go"
            value={input}
          />
          <Button
            style={{
              width: (SCREEN_WIDTH / 100) * 90,
              color: "white",
              backgroundColor: theme.active,
            }}
            disabled={
              input === item?.title || (input?.length > 0 && input?.length < 3)
            }
            icon={
              item?.price.title < 1 &&
              input?.length > 2 && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={{ color: "white", fontWeight: 600 }}>
                    (
                    <Text style={{ color: "white", fontWeight: 600 }}>
                      800{" "}
                    </Text>
                    <FontAwesome5 name="coins" size={14} color="white" />)
                  </Text>
                </View>
              )
            }
            title={activeLanguage.changeName}
            loading={loading}
            onPressFunction={() => EditTitle()}
          />
        </Pressable>
      </Animated.View>
    </BlurView>
  );
};

export default EditTitle;

const styles = StyleSheet.create({});

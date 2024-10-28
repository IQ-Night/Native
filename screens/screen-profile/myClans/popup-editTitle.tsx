import axios from "axios";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Dimensions, Keyboard, Pressable, StyleSheet } from "react-native";
import Button from "../../../components/button";
import Input from "../../../components/input";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useProfileContext } from "../../../context/profile";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const EditTitle = ({ navigation, item, setItem }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, activeLanguage, setAlert } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Edit field
   */
  const [input, setInput] = useState(item.title);
  /**
   * Clan context
   */
  const { setUpdateClanState, setClans } = useProfileContext();

  /**
   * Edit title
   */
  const [loading, setLoading] = useState(false);

  const EditTitle = async () => {
    try {
      // Dismiss keyboard to disable focus
      Keyboard.dismiss();

      setLoading(true);
      const response = await axios.patch(apiUrl + "/api/v1/clans/" + item._id, {
        title: input,
      });
      if (response.data.status === "success") {
        setClans((prev: any) =>
          prev.map((clan: any) => {
            if (clan._id === item._id) {
              return { ...clan, title: input };
            } else {
              return clan;
            }
          })
        );
        setItem((prevItem: any) => ({
          ...prevItem,
          title: input,
        }));
        navigation.setParams({ item: { ...item, title: input } });

        setLoading(false);
        setUpdateClanState(null);
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

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
      }}
    >
      <Pressable
        onPress={() => setUpdateClanState(null)}
        style={{
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 64,
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
            disabled={input === item?.title}
            icon=""
            title={activeLanguage.changeName}
            loading={loading}
            onPressFunction={() => EditTitle()}
          />
        </Pressable>
      </Pressable>
    </BlurView>
  );
};

export default EditTitle;

const styles = StyleSheet.create({});

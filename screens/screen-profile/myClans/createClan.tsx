import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import Avatars from "../../../components/avatars";
import Button from "../../../components/button";
import Input from "../../../components/input";
import ChoiceLanguage from "../../../components/popup-languages";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useClansContext } from "../../../context/clans";
import Img from "../../../components/image";
import { useProfileContext } from "../../../context/profile";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CreateClan = ({ setCreateClan }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Clan state
   */
  const [clanState, setClanState] = useState({
    admin: [{ user: currentUser._id, role: "founder" }],
    cover:
      "https://firebasestorage.googleapis.com/v0/b/iq-night.appspot.com/o/products%2Fclan-avatars%2FAvatar%203Thu%20Aug%2015%202024%2015%3A03%3A18%20GMT%2B0400?alt=media&token=e611ca31-a386-44af-82ec-67596ccfdbeb",
    title: "",
    language: "GE",
    price: 0,
    members: [
      { userId: currentUser._id, status: "member", joinDate: new Date() },
    ],
  });

  // styles
  const styles = createStyles(theme);

  /**
   * Open popup
   */
  const [openPopup, setOpenPopup] = useState("");

  /**
   * Creat Clan
   */
  const [loading, setLoading] = useState(false);
  const { setClans, GetClans } = useProfileContext();

  const HandleCreateClan = async () => {
    if (clanState.title?.length < 3) {
      return setAlert({
        active: true,
        text: "A clan must include minimum 3 letter",
        type: "error",
      });
    }
    try {
      setLoading(true);
      const response = await axios.post(apiUrl + "/api/v1/clans", {
        ...clanState,
      });
      if (response.data.status === "success") {
        GetClans();
        setLoading(false);
        setCreateClan(false);
        setClanState({
          admin: [{ user: currentUser._id, role: "founder" }],
          cover:
            "https://firebasestorage.googleapis.com/v0/b/iq-night.appspot.com/o/products%2Fclan-avatars%2FAvatar%203Thu%20Aug%2015%202024%2015%3A03%3A18%20GMT%2B0400?alt=media&token=e611ca31-a386-44af-82ec-67596ccfdbeb",
          title: "",
          language: "GE",
          price: 0,
          members: [
            { userId: currentUser._id, status: "member", joinDate: new Date() },
          ],
        });
      }
    } catch (error: any) {
      console.log(error.response.data.message);
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
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: "100%" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <BlurView intensity={120} tint="dark" style={styles.container}>
        <BlurView intensity={120} tint="dark" style={styles.header}>
          <Text style={{ color: theme.active, fontSize: 18, fontWeight: 500 }}>
            Create New Clan
          </Text>
          <Ionicons
            onPress={() => setCreateClan(false)}
            name="caret-down-outline"
            color={theme.text}
            size={24}
          />
        </BlurView>
        <ScrollView
          style={{ paddingHorizontal: 16, paddingTop: 64 }}
          contentContainerStyle={{ gap: 16, paddingBottom: 160 }}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={{ gap: 8 }}>
            <Text style={styles.title}>Cover</Text>
            <Pressable
              onPress={(e) => {
                setOpenPopup("avatars");
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <View style={{ borderRadius: 8, overflow: "hidden" }}>
                <BlurView intensity={10} tint="light" style={{ padding: 4 }}>
                  <View style={styles.image}>
                    <Img uri={clanState.cover} />
                  </View>
                </BlurView>
              </View>
              {clanState.price > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <FontAwesome5 name="coins" size={14} color={theme.active} />
                  <Text
                    style={{
                      color: theme.text,
                      marginLeft: 4,
                      fontWeight: 500,
                    }}
                  >
                    {clanState.price}
                  </Text>
                </View>
              )}
            </Pressable>
          </Pressable>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ gap: 8 }}>
            <Text style={styles.title}>Title</Text>
            <Input
              placeholder="Enter Clans's Title"
              value={clanState.title}
              onChangeText={(text: string) =>
                setClanState((prev: any) => ({ ...prev, title: text }))
              }
              type="text"
              returnKeyType="next"
              //  onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </Pressable>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.fieldContainer}
          >
            <Text style={styles.title}>Language</Text>
            <Pressable
              onPress={() => {
                setOpenPopup("choiceLanguage");
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
              style={{ width: 80, marginLeft: "auto", alignItems: "center" }}
            >
              <View style={{ borderRadius: 2, overflow: "hidden" }}>
                <CountryFlag
                  isoCode={clanState.language}
                  size={18}
                  style={{
                    color: theme.text,
                  }}
                />
              </View>
            </Pressable>
          </Pressable>

          <Button
            title="Create"
            loading={loading}
            style={{
              width: "100%",
              backgroundColor: theme.active,
              color: "white",
            }}
            icon={
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text style={{ color: "white", fontWeight: 600 }}>
                  ({" "}
                  <Text style={{ color: "white", fontWeight: 600 }}>500 </Text>
                  <FontAwesome5 name="coins" size={14} color="white" /> )
                </Text>
              </View>
            }
            onPressFunction={HandleCreateClan}
          />
        </ScrollView>
        {openPopup !== "" && (
          <BlurView
            intensity={120}
            tint="dark"
            style={{
              position: "absolute",
              top: 0,
              zIndex: 50,
              height: "100%",
              width: "100%",
              paddingTop: 72,
            }}
          >
            <FontAwesome
              name="close"
              size={32}
              color={theme.active}
              style={{ position: "absolute", top: 48, right: 16, zIndex: 60 }}
              onPress={() => {
                setOpenPopup("");
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
            />
            {openPopup === "avatars" && (
              <Avatars
                state={clanState}
                setState={setClanState}
                type="clan-avatar"
              />
            )}
            {openPopup === "choiceLanguage" && (
              <ChoiceLanguage
                state={clanState.language}
                setState={(e: any) =>
                  setClanState((prev: any) => ({
                    ...prev,
                    language: e,
                  }))
                }
                setOpenPopup={setOpenPopup}
              />
            )}
          </BlurView>
        )}
      </BlurView>
    </KeyboardAvoidingView>
  );
};

export default CreateClan;

const createStyles = (theme: any) =>
  StyleSheet.create({
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
      justifyContent: "space-between",
      paddingHorizontal: 16,
      position: "absolute",
      zIndex: 20,
    },
    fieldContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      height: 30,
    },
    title: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 16,
    },
    subtitle: {
      color: theme.text,
      fontWeight: "500",
    },
    numericValue: {
      padding: 4,
      paddingHorizontal: 12,
      backgroundColor: "gray",
      borderRadius: 8,
      width: 80,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: 100,
      height: 100,
      resizeMode: "cover",
      borderRadius: 6,
    },
  });

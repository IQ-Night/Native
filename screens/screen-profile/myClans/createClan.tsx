import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
import { create } from "lodash";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CreateClan = ({ setCreateClan }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, setAlert, activeLanguage } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Clan state
   */
  const defaultCover =
    "https://firebasestorage.googleapis.com/v0/b/iq-night.appspot.com/o/products%2FAvatar%202Tue%20Nov%2012%202024%2023%3A09%3A18%20GMT%2B0400?alt=media&token=355befff-2be1-427f-9ecf-92516f5f275c";
  const [clanState, setClanState] = useState<any>({
    admin: [
      {
        user: { id: currentUser._id, name: currentUser?.name },
        role: "founder",
      },
    ],
    cover: defaultCover,
    title: "",
    slogan: "",
    language: "GE",
    members: [
      { userId: currentUser._id, status: "member", joinDate: new Date() },
    ],
    chat: null,
  });

  const [totalPrice, setTotalPrice] = useState<any>({
    all: 0,
    create: 800,
    cover: 0, // "2000"
    title: 0, // "800"
    chat: 0, // "1500"
    slogan: 0, // "700"
  });

  useEffect(() => {
    const coverPrice = clanState?.cover === defaultCover ? 0 : 2000;
    const titlePrice = clanState?.title?.length > 0 ? 800 : 0;
    const sloganPrice = clanState?.slogan?.length > 0 ? 700 : 0;
    const chatPrice = clanState?.chat ? 1500 : 0;
    const all = 800 + coverPrice + titlePrice + sloganPrice + chatPrice;
    setTotalPrice((prev: any) => ({
      ...prev,
      all: all,
      cover: coverPrice,
      title: titlePrice,
      slogan: sloganPrice,
      chat: chatPrice,
    }));
  }, [clanState]);

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
    if (currentUser?.coins?.total < totalPrice?.all) {
      return setAlert({
        active: true,
        text: activeLanguage?.notEnoughCoinsCreateClan,
        type: "error",
      });
    }

    try {
      setLoading(true);
      const response = await axios.post(apiUrl + "/api/v1/clans", {
        ...clanState,
        price: totalPrice,
        title: "Clan - " + currentUser?._id + Date.now(),
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
          members: [
            { userId: currentUser._id, status: "member", joinDate: new Date() },
          ],
          chat: null,
          slogan: "",
        });
        setTotalPrice({
          all: 0,
          create: 800,
          cover: 0, // "2000"
          title: 0, // "800"
          chat: 0, // "1500"
          slogan: 0, // "700"
        });
      }
    } catch (error: any) {
      setLoading(false);
      return setAlert({
        active: true,
        text: error.response.data.message,
        type: "error",
      });
    }
  };

  /** Upload Avatar */
  const [file, setFile] = useState<any>(null);

  /**
   * Open popup
   */

  // open state
  const translateYState = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (openPopup !== "") {
      Animated.timing(translateYState, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [openPopup]);

  const closeState = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    Animated.timing(translateYState, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Once the animation is complete, update the state
      setOpenPopup("");
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: "100%" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <BlurView intensity={120} tint="dark" style={styles.container}>
        <BlurView intensity={120} tint="dark" style={styles.header}>
          <Text style={{ color: theme.active, fontSize: 18, fontWeight: 700 }}>
            {activeLanguage?.create_new_clan}
          </Text>
          <Ionicons
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              setCreateClan(false);
            }}
            name="caret-down-outline"
            color={theme.active}
            size={24}
          />
        </BlurView>
        <ScrollView
          style={{ paddingHorizontal: 12, paddingTop: 64 }}
          contentContainerStyle={{ gap: 16, paddingBottom: 160 }}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={{ gap: 8 }}>
            <Text style={styles.title}>{activeLanguage?.avatar}</Text>
            <Pressable
              onPress={(e) => {
                setOpenPopup("avatars");
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <View
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <BlurView
                    intensity={10}
                    tint="light"
                    style={{
                      padding: 4,
                    }}
                  >
                    <View style={styles.image}>
                      <Img uri={clanState.cover} />
                    </View>
                  </BlurView>
                </View>

                {totalPrice.cover > 0 && (
                  <View style={{ gap: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FontAwesome5
                        name="coins"
                        size={14}
                        color={theme.active}
                      />
                      <Text
                        style={{
                          color: theme.text,

                          fontWeight: 500,
                        }}
                      >
                        {totalPrice.cover}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                        setClanState((prev: any) => ({
                          ...prev,
                          cover: defaultCover,
                        }));
                      }}
                      style={{
                        padding: 6,
                        paddingHorizontal: 12,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: 50,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.active,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {activeLanguage?.defaultFree}
                      </Text>
                      <MaterialCommunityIcons
                        name="reload"
                        size={16}
                        color="white"
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          </Pressable>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ gap: 8 }}>
            <Text style={styles.title}>
              {activeLanguage?.title}
              {"  "}
              {totalPrice?.title > 0 && (
                <>
                  <FontAwesome5 name="coins" size={14} color={theme.active} />{" "}
                  <Text
                    style={{
                      fontWeight: 500,
                      color: theme.text,
                      fontSize: 14,
                    }}
                  >
                    800
                  </Text>
                </>
              )}
            </Text>
            <Input
              placeholder="Default: clan123..."
              value={clanState.title}
              onChangeText={(text: string) =>
                setClanState((prev: any) => ({ ...prev, title: text }))
              }
              type="text"
              returnKeyType="next"
              //  onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </Pressable>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ gap: 8 }}>
            <Text style={styles.title}>
              {activeLanguage?.slogan} {"  "}
              {totalPrice?.slogan > 0 && (
                <>
                  <FontAwesome5 name="coins" size={14} color={theme.active} />{" "}
                  <Text
                    style={{
                      fontWeight: 500,
                      color: theme.text,
                      fontSize: 14,
                    }}
                  >
                    700
                  </Text>
                </>
              )}
            </Text>
            <Input
              placeholder={activeLanguage?.slogan}
              value={clanState.slogan}
              onChangeText={(text: string) =>
                setClanState((prev: any) => ({ ...prev, slogan: text }))
              }
              type="text"
              returnKeyType="next"
              //  onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </Pressable>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[styles.fieldContainer]}
          >
            <Text style={styles.title}>{activeLanguage?.language}</Text>
            <Pressable
              onPress={() => {
                setOpenPopup("choiceLanguage");
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
              style={{ width: 50, alignItems: "center" }}
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
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.fieldContainer}
          >
            <Text style={styles.title}>{activeLanguage?.chat} </Text>
            {totalPrice?.chat > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginLeft: 4,
                }}
              >
                <FontAwesome5 name="coins" size={14} color={theme.active} />
                <Text
                  style={{
                    fontWeight: 500,
                    color: theme.text,
                    fontSize: 14,
                  }}
                >
                  {" "}
                  1500
                </Text>
              </View>
            )}
            {Platform.OS === "ios" ? (
              <Switch
                trackColor={{ false: theme.background2, true: theme.active }}
                value={clanState?.chat}
                style={{
                  transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                  marginLeft: "auto",
                }}
                onValueChange={async () => {
                  const newState = { ...clanState, chat: !clanState.chat };
                  setClanState(newState);
                }}
              />
            ) : (
              <Pressable
                onPress={async () => {
                  setClanState((prev: any) => ({ ...prev, chat: !prev.chat }));
                }}
              >
                <Text style={{ color: theme.active }}>
                  Turned {clanState?.chat ? "on" : "off"}
                </Text>
              </Pressable>
            )}
          </Pressable>
          <Button
            title={activeLanguage?.create}
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
                  <Text style={{ color: "white", fontWeight: 600 }}>
                    {totalPrice?.all}{" "}
                  </Text>
                  <FontAwesome5 name="coins" size={14} color="white" /> )
                </Text>
              </View>
            }
            onPressFunction={HandleCreateClan}
          />
        </ScrollView>
        {openPopup !== "" && (
          <BlurView intensity={120} tint="dark" style={styles.blurContainer}>
            <View style={styles.popupContainer}>
              <Animated.View
                style={{
                  transform: [{ translateY: translateYState }],
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={() => {
                    closeState();
                  }}
                >
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={42}
                    color={theme.active}
                  />
                </Pressable>
                {openPopup === "avatars" && (
                  <Avatars
                    state={clanState}
                    setState={setClanState}
                    type="clan-avatar"
                    file={file}
                    setFile={setFile}
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
              </Animated.View>
            </View>
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
      borderRadius: 8,
      overflow: "hidden",
    },
    popupContainer: {
      height: "100%",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    blurContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      width: "100%",
      zIndex: 90,
      paddingTop: 12,
    },
    blurContainer2: {
      position: "absolute",
      zIndex: 20,
      top: 0,
      left: 0,
      right: 0,
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 90,
    },
  });

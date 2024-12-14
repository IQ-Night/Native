import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../../components/button";
import Input from "../../components/input";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import Search from "../../screens/screen-chat/searchMember";
import Img from "../../components/image";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import Activation from "./activation";
import { FormatDate } from "../../functions/formatDate";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CreateCoupon = ({ createCopuon, setCreateCoupon, setCoupons }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, activeLanguage, setAlert } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  // styles
  const styles = createStyles(theme);

  /**
   * Create coupon State
   */
  const [couponState, setCouponState] = useState<any>({
    title: "",
    type: "percent",
    users: [],
    discount: 0,
    expiresAt: new Date(),
  });
  const [loading, setLoading] = useState(false);

  /**
   * product types
   */
  const types = [
    {
      value: "percent",
      label: "%",
    },
    {
      value: "solid",
      label: activeLanguage?.solid,
    },
  ];

  /** Upload Product */

  async function HandleCreateCoupon() {
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/coupons`,
        couponState
      );
      if (response.data.status === "success") {
        setCoupons((prev: any) => [response.data.data.coupon, ...prev]);
        setCouponState({
          title: "",
          type: "",
          users: [],
          discount: 0,
        });
        closeComponent();
        setAlert({
          active: true,
          type: "success",
          text: activeLanguage?.coupon_created_successfully,
        });
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
      setAlert({
        active: true,
        type: "error",
        text: error.response.data.message,
      });
    }
  }

  const slideAnime = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // Start off-screen

  useEffect(() => {
    if (createCopuon) {
      Animated.timing(slideAnime, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [createCopuon]);

  const closeComponent = () => {
    Animated.timing(slideAnime, {
      toValue: SCREEN_HEIGHT, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setCreateCoupon(false);
    });
  };

  // /**
  //  * Add members
  //  */
  // const navigation: any = useNavigation();
  // const [openSearch, setOpenSearch] = useState(false);
  // const [search, setSearch] = useState("");

  // // players list
  // const [loadPlayers, setLoadUsers] = useState(false);
  // const [players, setUsers] = useState<any>(null);

  // useEffect(() => {
  //   const GetPlayers = async () => {
  //     setLoadUsers(true);
  //     try {
  //       const response = await axios.get(
  //         apiUrl + "/api/v1/users?search=" + search
  //       );
  //       if (response.data.status === "success") {
  //         setTimeout(() => {
  //           setUsers(response.data.data.users);
  //           setLoadUsers(false);
  //         }, 200);
  //       }
  //     } catch (error: any) {
  //       console.log(error.response.data.message);
  //     }
  //   };
  //   if (openSearch) {
  //     GetPlayers();
  //   }
  // }, [openSearch, search, openSearch]);

  // /**
  //  * Search Animation
  //  */

  // // Boolean to track input focus
  // const [isFocused, setIsFocused] = useState(false);
  // // Animated values
  // const slideAnim = useRef(new Animated.Value(-100)).current; // Initial position off-screen
  // const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0

  // // Ref for the TextInput
  // const inputRef = useRef<any>(null);

  // useEffect(() => {
  //   if (openSearch) {
  //     // Animate in
  //     Animated.parallel([
  //       Animated.timing(slideAnim, {
  //         toValue: 0,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(opacityAnim, {
  //         toValue: 1,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }),
  //     ]).start(() => {
  //       inputRef.current?.focus();
  //       setIsFocused(true);
  //     });
  //   } else {
  //     // Animate out
  //     Animated.parallel([
  //       Animated.timing(slideAnim, {
  //         toValue: -100,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }),
  //       Animated.timing(opacityAnim, {
  //         toValue: 0,
  //         duration: 300,
  //         useNativeDriver: true,
  //       }),
  //     ]).start();
  //   }
  // }, [openSearch]);

  /**
   * activation
   */
  const [openActivation, setOpenActivation] = useState<any>(null);
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
      >
        <BlurView intensity={120} tint="dark" style={styles.container}>
          <Animated.View
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              transform: [{ translateY: slideAnime }],
            }}
          >
            <BlurView intensity={120} tint="dark" style={styles.header}>
              <Text
                style={{ color: theme.active, fontSize: 18, fontWeight: 500 }}
              >
                {activeLanguage?.create_coupon}
              </Text>
              <Ionicons
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  closeComponent();
                }}
                name="caret-down-outline"
                color={theme.text}
                size={24}
              />
            </BlurView>
            <ScrollView
              style={{
                paddingHorizontal: 12,
                paddingTop: 64,
              }}
              contentContainerStyle={{ gap: 16 }}
            >
              <View style={{ gap: 8 }}>
                <Text style={styles.title}>{activeLanguage?.title}*</Text>
                <Input
                  placeholder={activeLanguage?.title}
                  value={couponState.title}
                  onChangeText={(text: string) =>
                    setCouponState((prev: any) => ({ ...prev, title: text }))
                  }
                  type="text"
                />
              </View>
              <View style={{ width: "100%", flex: 1, gap: 8 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: theme.text,
                    marginBottom: 4,
                  }}
                >
                  {activeLanguage?.select_type}*
                </Text>

                <View style={{ gap: 8 }}>
                  {types.map((item: any, index: number) => {
                    return (
                      <Pressable
                        onPress={() => {
                          if (haptics) {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Soft
                            );
                          }

                          setCouponState((prev: any) => ({
                            ...prev,
                            type: item?.value,
                          }));
                        }}
                        style={[
                          styles.button,
                          {
                            borderColor:
                              couponState?.type === item?.value
                                ? theme.active
                                : "rgba(255,255,255,0.1)",
                          },
                        ]}
                        key={index}
                      >
                        <Text
                          style={{
                            color: theme.active,
                            fontWeight: 600,
                          }}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={{ gap: 8 }}>
                <View
                  style={{ alignItems: "center", gap: 4, flexDirection: "row" }}
                >
                  <Text style={styles.title}>{activeLanguage?.discount}*</Text>
                </View>
                <Input
                  placeholder={
                    couponState?.type === "percent"
                      ? "%"
                      : activeLanguage?.solid
                  }
                  value={`${couponState.discount}`}
                  onChangeText={(text: string) =>
                    setCouponState((prev: any) => ({ ...prev, discount: text }))
                  }
                  type="numeric"
                />
              </View>
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginVertical: 8,
                  borderWidth: 1,
                  borderColor: theme.active,
                  borderRadius: 10,
                  padding: 8,
                }}
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setOpenActivation(true);
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {activeLanguage?.expireDate}
                </Text>
                <MaterialCommunityIcons
                  name="calendar"
                  color={theme.active}
                  size={24}
                />
                <Text
                  style={{
                    color: theme.active,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {FormatDate(couponState?.expiresAt, "onlyDate")}
                </Text>
              </Pressable>
              {/* <Text
                style={{ fontSize: 16, fontWeight: 600, color: theme.text }}
              >
                {activeLanguage?.users} ({couponState?.users?.length})
              </Text>
              {couponState?.users?.length > 0 && (
                <View style={{ gap: 6 }}>
                  {couponState?.users?.map((member: any, index: any) => {
                    return (
                      <View
                        key={index}
                        style={{
                          width: "100%",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          padding: 8,
                          borderRadius: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          borderWidth: 1,
                          borderColor: couponState?.users?.find(
                            (m: any) => m === member?._id
                          )
                            ? theme.active
                            : "rgba(255,255,255,0.05)",
                        }}
                      >
                        <View
                          style={{
                            width: 24,
                            aspectRatio: 1,
                            overflow: "hidden",
                            borderRadius: 150,
                          }}
                        >
                          <Img uri={member?.cover} />
                        </View>
                        <Text style={{ color: "white", fontWeight: 500 }}>
                          {member?.name}
                        </Text>
                        <MaterialIcons name="delete" size={20} color="red" />
                        <Pressable
                          onPress={() => {
                            if (haptics) {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Soft
                              );
                            }
                            setOpenActivation(member);
                          }}
                        >
                          <Text style={{ color: "#888", fontWeight: 500 }}>
                            {member?.expiresAt
                              ? FormatDate(member?.expiresAt, "onlyDate")
                              : activeLanguage?.unActive}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              )}
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginVertical: 8,
                }}
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  if (openSearch) {
                    setOpenSearch(false);
                  } else {
                    setOpenSearch(true);
                  }
                }}
              >
                <Text
                  style={{
                    color: openSearch ? theme.active : "#888",
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  {activeLanguage?.add}
                </Text>
                <MaterialIcons
                  name={openSearch ? "close" : "add"}
                  color={openSearch ? "red" : theme.active}
                  size={24}
                />
              </Pressable>

              {openSearch && (
                <View>
                  <Search
                    search={search}
                    setSearch={setSearch}
                    open={openSearch}
                    setOpen={setOpenSearch}
                    isFocused={isFocused}
                    setIsFocused={setIsFocused}
                    slideAnim={slideAnim}
                    opacityAnim={opacityAnim}
                    inputRef={inputRef}
                  />
                  <View
                    style={{
                      width: "100%",
                      backgroundColor: "#222",
                      marginTop: 8,
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.15 }}>
                      <View style={[styles.row, { paddingTop: 0 }]}>
                        {loadPlayers && (
                          <ActivityIndicator size={24} color={theme.active} />
                        )}
                        {!loadPlayers && players?.length < 1 && (
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.3)",
                              fontWeight: 500,
                              fontSize: 16,
                              position: "absolute",
                              top: 64,
                            }}
                          >
                            {activeLanguage?.not_found}
                          </Text>
                        )}
                        {!loadPlayers &&
                          players?.map((member: any, index: any) => {
                            return (
                              <Pressable
                                onPress={() => {
                                  if (haptics) {
                                    Haptics.impactAsync(
                                      Haptics.ImpactFeedbackStyle.Soft
                                    );
                                  }
                                  if (
                                    couponState?.users?.find(
                                      (m: any) => m?._id === member?._id
                                    )
                                  ) {
                                    setCouponState((prev: any) => ({
                                      ...prev,
                                      users: prev?.users?.filter(
                                        (p: any) => p?._id !== member?._id
                                      ),
                                    }));
                                  } else {
                                    setCouponState((prev: any) => ({
                                      ...prev,
                                      users: [
                                        ...prev.users,
                                        {
                                          _id: member?._id,
                                          name: member?.name,
                                          cover: member?.cover,
                                        },
                                      ],
                                    }));
                                  }
                                }}
                                key={index}
                                style={{
                                  width: "100%",
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                  padding: 8,
                                  borderRadius: 8,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 12,
                                  borderWidth: 1,
                                  borderColor: couponState?.users?.find(
                                    (m: any) => m?._id === member?._id
                                  )
                                    ? theme.active
                                    : "rgba(255,255,255,0.05)",
                                }}
                              >
                                <View
                                  style={{
                                    width: 24,
                                    aspectRatio: 1,
                                    overflow: "hidden",
                                    borderRadius: 150,
                                  }}
                                >
                                  <Img uri={member?.cover} />
                                </View>
                                <Text
                                  style={{ color: "white", fontWeight: 500 }}
                                >
                                  {member?.name}
                                </Text>
                              </Pressable>
                            );
                          })}
                      </View>
                    </ScrollView>
                  </View>
                </View>
              )} */}

              <Button
                title={activeLanguage?.create}
                loading={loading}
                style={{
                  width: "100%",
                  backgroundColor: theme.active,
                  color: "white",
                }}
                disabled={
                  couponState?.title?.length < 3 || couponState?.discount < 1
                }
                onPressFunction={HandleCreateCoupon}
              />
            </ScrollView>
          </Animated.View>
        </BlurView>
      </KeyboardAvoidingView>
      {openActivation && (
        <Activation
          openActivation={openActivation}
          setCouponState={setCouponState}
          setOpenActivation={setOpenActivation}
        />
      )}
    </View>
  );
};

export default CreateCoupon;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      height: "100%",
      zIndex: 20,
    },
    header: {
      width: "100%",
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      position: "absolute",
      top: 0,
      zIndex: 20,
    },
    row: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      paddingTop: 10,
      gap: 6,
      minHeight: SCREEN_HEIGHT * 0.3,
    },
    title: {
      color: theme.text,
      fontWeight: "500",
      fontSize: 16,
    },

    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      width: "100%",
      borderWidth: 1,

      borderRadius: 8,
    },
    image: {
      width: 100,
      height: 100,
      resizeMode: "cover",
      borderRadius: 6,
    },
  });

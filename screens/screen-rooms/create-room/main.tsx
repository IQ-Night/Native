import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import Avatars from "../../../components/avatars";
import Button from "../../../components/button";
import Img from "../../../components/image";
import Input from "../../../components/input";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useGameContext } from "../../../context/game";
import { roles, useRoomsContext } from "../../../context/rooms";
import NumberPicker from "../numberPicker";
import DrawInReVote from "./drawInReVote";
import MaxMafias from "./maxMafias";
import MaxPlayers from "./maxPlayers";
import PersonalTime from "./personalTime";
import Private from "./private";
import Rating from "./rating";
import RoleInfo from "./roleInfo";
import Roles from "./roles";
import SpectatorMode from "./spectatorMode";
import Rules from "./popup-rules";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CreateRoom = ({ createRoom, setCreateRoom, setDoorReview }: any) => {
  // scroll to top on every room opnening action
  const scrollRef = useRef<any>();
  useEffect(() => {
    if (scrollRef.current && createRoom) {
      scrollRef.current.scrollTo();
    }
  }, [createRoom]);
  /**
   * App context
   */
  const { theme, apiUrl, activeLanguage, haptics, setAlert } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser, setCurrentUser } = useAuthContext();

  /**
   * Game context
   */
  const { setActiveRoom } = useGameContext();

  /**
   * Room state
   */
  const defaultCover =
    "https://firebasestorage.googleapis.com/v0/b/iq-night.appspot.com/o/products%2FAvatar%202Tue%20Nov%2012%202024%2023%3A09%3A18%20GMT%2B0400?alt=media&token=355befff-2be1-427f-9ecf-92516f5f275c";

  const [roomState, setRoomState] = useState<any>({
    admin: {
      founder: {
        id: currentUser._id,
        name: currentUser?.name,
        cover: currentUser?.cover,
      },
    },
    cover: defaultCover,
    title: "",
    roles: [roles[0]],
    private: { value: false, code: "" },
    language: "GE",
    rating: { min: 1 },
    price: 0,
    members: [],
    options: {
      totalPlayers: 0,
      maxPlayers: 16,
      maxMafias: 6,
    },
    status: { value: "default" },
    spectatorMode: true,
    personalTime: 30,
    rules: [],
    drawInReVote: "Release all", // jail all, people decide
  });

  /**
   * Open role info
   */
  const [openRoleInfo, setOpenRoleInfo] = useState({ value: null });

  /**
   * Total price of create room
   */
  const [totalPrice, setTotalPrice] = useState<any>({
    all: 0,
    roles: 0,
    title: 0,
    cover: 0,
    private: 0,
  });

  useEffect(() => {
    let rolesPrice;
    if (!currentUser?.vip?.active) {
      rolesPrice =
        roomState.roles
          .filter((i: any) => i.price) // Filter items that have a price
          .reduce((acc: number, curr: any) => acc + curr.price, 0) || 0; // Sum up the prices
    } else {
      rolesPrice = 0;
    }
    const titlePrice = roomState?.title?.length > 0 ? 500 : 0;
    const coverPrice = roomState?.cover !== defaultCover ? 800 : 0;
    const privatePrice =
      roomState?.private?.value && !currentUser?.vip?.active ? 4 : 0;
    const total = rolesPrice + titlePrice + coverPrice + privatePrice;
    setTotalPrice({
      all: total,
      roles: rolesPrice,
      title: titlePrice,
      cover: coverPrice,
      private: privatePrice,
    });
  }, [roomState]);

  // styles
  const styles = createStyles(theme);

  /**
   * Numeric Popup
   */
  const [numericPopup, setNumericPopup] = useState<any>({
    title: "",
    min: 0,
    max: 0,
    step: 0,
    active: false,
    selectedValue: 0,
    setValue: undefined,
  });

  /**
   * Creat room
   */
  const [loading, setLoading] = useState(false);
  const { setRooms } = useRoomsContext();
  const HandleCreateRoom = async () => {
    if (roomState.private.value && roomState.private.code < 4) {
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage?.addPinCodePrivateRoom,
      });
    }
    if (totalPrice?.all > currentUser?.coins?.total) {
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage?.notEnoughCoinsBuyFeatures,
      });
    }

    try {
      setLoading(true);
      const randomTitle = Date.now() || "";
      const response = await axios.post(apiUrl + "/api/v1/rooms", {
        ...roomState,
        title: roomState?.title?.length > 0 ? roomState?.title : randomTitle,
        price: totalPrice,
      });
      if (response.data.status === "success") {
        setRooms((prev: any) => [response.data.data.room, ...prev]);
        setLoading(false);
        setCreateRoom(false);
        if (totalPrice?.all > 0) {
          setCurrentUser((prev: any) => ({
            ...prev,
            coins: { ...prev.coins, total: prev.coins.total - totalPrice?.all },
          }));
        }
        setDoorReview({ ...response.data.data.room, liveMembers: [] });
        setRoomState({
          admin: {
            founder: {
              id: currentUser._id,
              name: currentUser?.name,
              cover: currentUser?.cover,
            },
          },
          cover: defaultCover,
          title: "",
          roles: [roles[0]],
          private: { value: false, code: "" },
          language: "GE",
          rating: { min: 1 },
          price: 1,
          members: [],
          options: {
            totalPlayers: 0,
            maxPlayers: 16,
            maxMafias: 6,
          },
          status: { value: "default" },
          spectatorMode: true,
          personalTime: 30,
          rules: [],
          drawInReVote: "Release all", // jail all, people decide
        });
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  /**
   * Open popup
   */
  const [openPopup, setOpenPopup] = useState("");

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
    <>
      <View style={{ flex: 1, width: "100%", position: "relative" }}>
        <BlurView intensity={120} tint="dark" style={styles.container}>
          <BlurView intensity={120} tint="dark" style={styles.header}>
            <Text
              style={{ color: theme.active, fontSize: 20, fontWeight: 700 }}
            >
              {activeLanguage?.createNewRoom}
            </Text>
            <Ionicons
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setCreateRoom(false);
              }}
              name="caret-down-outline"
              color={theme.text}
              size={24}
            />
          </BlurView>
          <ScrollView
            ref={scrollRef}
            style={{ paddingHorizontal: 16, paddingTop: 64 }}
            contentContainerStyle={{ gap: 16, paddingBottom: 160 }}
          >
            <View style={{ gap: 8 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text style={styles.title}>{activeLanguage?.avatar}</Text>
              </View>
              <Pressable
                onPress={() => {
                  setOpenPopup("avatars");
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
              >
                <View
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
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
                      <Img uri={roomState.cover} />
                    </View>
                  </BlurView>
                  {totalPrice?.cover > 0 && (
                    <View style={{ gap: 16 }}>
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
                        />{" "}
                        <Text style={{ fontWeight: 500, color: theme.text }}>
                          800
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          if (haptics) {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Soft
                            );
                          }
                          setRoomState((prev: any) => ({
                            ...prev,
                            cover: defaultCover,
                          }));
                        }}
                        style={{
                          padding: 6,
                          paddingHorizontal: 12,
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderRadius: 50,
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
                      </Pressable>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              <Text style={styles.title}>
                {activeLanguage.title}
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
                      500
                    </Text>
                  </>
                )}
              </Text>
              <Input
                placeholder={"Random title default: Room - 123..."}
                value={roomState.title}
                onChangeText={(text: string) => {
                  setRoomState((prev: any) => ({ ...prev, title: text }));
                }}
                type="text"
                maxLength={15}
              />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={styles.title}>{activeLanguage?.roles}</Text>
              <Roles
                roomState={roomState}
                setRoomState={setRoomState}
                openRoleInfo={openRoleInfo}
                setOpenRoleInfo={setOpenRoleInfo}
              />
            </View>
            <MaxPlayers
              roomState={roomState}
              setRoomState={setRoomState}
              setNumericPopup={setNumericPopup}
            />
            <MaxMafias
              roomState={roomState}
              setRoomState={setRoomState}
              setNumericPopup={setNumericPopup}
            />
            <Private
              roomState={roomState}
              setRoomState={setRoomState}
              totalPrice={totalPrice}
            />
            <View style={styles.fieldContainer}>
              <Text style={styles.title}>{activeLanguage?.language}</Text>
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
                    isoCode={roomState.language}
                    size={18}
                    style={{
                      color: theme.text,
                    }}
                  />
                </View>
              </Pressable>
            </View>
            <Rating
              roomState={roomState}
              setRoomState={setRoomState}
              setNumericPopup={setNumericPopup}
            />
            <View style={styles.fieldContainer}>
              <Text style={styles.title}>{activeLanguage?.spectatorMode}</Text>
              <SpectatorMode
                roomState={roomState}
                setRoomState={setRoomState}
              />
            </View>
            <PersonalTime roomState={roomState} setRoomState={setRoomState} />
            <DrawInReVote roomState={roomState} setRoomState={setRoomState} />
            <View style={{ marginVertical: 8 }}>
              <View style={styles.fieldContainer}>
                <Text style={styles.title}>{activeLanguage?.rules}</Text>
                <Pressable
                  style={styles.numericValue}
                  onPress={() => {
                    setOpenPopup("rules");
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: 500 }}>
                    {activeLanguage?.add}
                  </Text>
                </Pressable>
              </View>
              {roomState.rules?.length > 0 && (
                <View style={{ gap: 4, marginVertical: 16 }}>
                  {roomState.rules.map((item: any, index: number) => {
                    return (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          borderBottomWidth: 1,
                          borderColor: "rgba(255,255,255,0.1)",
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: 16,
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}.
                        </Text>
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: 16,
                            fontWeight: 600,
                            maxWidth: "85%",
                          }}
                        >
                          {item}
                        </Text>
                        <FontAwesome
                          onPress={() => {
                            setRoomState((prev: any) => ({
                              ...prev,
                              rules: prev.rules.filter((i: any) => i !== item),
                            }));
                            if (haptics) {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Soft
                              );
                            }
                          }}
                          color={theme.active}
                          size={24}
                          name="close"
                          style={{ marginLeft: "auto" }}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
            <Button
              icon={
                totalPrice?.all > 0 && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FontAwesome5 name="coins" size={14} color="white" />
                    <Text
                      style={{ color: "white", marginLeft: 4, fontWeight: 500 }}
                    >
                      {totalPrice?.all}
                    </Text>
                  </View>
                )
              }
              title={activeLanguage?.create}
              loading={loading}
              style={{
                width: "100%",
                backgroundColor: theme.active,
                color: "white",
              }}
              onPressFunction={HandleCreateRoom}
            />
          </ScrollView>
        </BlurView>
      </View>
      {openRoleInfo.value && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            zIndex: 90,
            height: "100%",
            width: "100%",
            paddingTop: 120,
          }}
        >
          <FontAwesome
            name="close"
            size={32}
            color={theme.active}
            style={{ position: "absolute", top: 48, right: 16, zIndex: 60 }}
            onPress={() => {
              setOpenRoleInfo({ value: null });
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
            }}
          />

          <RoleInfo
            openRoleInfo={openRoleInfo}
            setOpenRoleInfo={setOpenRoleInfo}
          />
        </BlurView>
      )}
      {numericPopup.active && (
        <NumberPicker
          title={numericPopup.title}
          min={numericPopup.min}
          max={numericPopup.max}
          step={numericPopup.step}
          selectedValue={numericPopup.selectedValue}
          setValue={numericPopup.setValue}
          setNumericPopup={setNumericPopup}
        />
      )}
      {openPopup === "rules" && (
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
              <Rules
                roomState={roomState}
                setRoomState={setRoomState}
                setOpenPopup={setOpenPopup}
              />
            </Animated.View>
          </View>
        </BlurView>
      )}
      {openPopup === "avatars" && (
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

              <Avatars
                state={roomState}
                setState={setRoomState}
                type="room-avatar"
                setTotalPrice={setTotalPrice}
                file={file}
                setFile={setFile}
              />
            </Animated.View>
          </View>
        </BlurView>
      )}
    </>
  );
};

export default CreateRoom;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      zIndex: 80,
      paddingTop: 48,
    },
    header: {
      width: "100%",
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      position: "absolute",
      top: 48,
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
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 8,
      width: 100,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: 100,
      height: 100,
      resizeMode: "cover",
      borderRadius: 6,
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
      paddingTop: 40,
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

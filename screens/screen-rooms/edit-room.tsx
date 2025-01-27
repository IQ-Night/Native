import {
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import _ from "lodash";
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
import Avatars from "../../components/avatars";
import Button from "../../components/button";
import Img from "../../components/image";
import Input from "../../components/input";
import ChoiceLanguage from "../../components/popup-languages";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useContentContext } from "../../context/content";
import { useGameContext } from "../../context/game";
import DrawInReVote from "./create-room/drawInReVote";
import Roles from "./create-room/edit-roles";
import MaxMafias from "./create-room/maxMafias";
import MaxPlayers from "./create-room/maxPlayers";
import PersonalTime from "./create-room/personalTime";
import Rules from "./create-room/popup-rules";
import Private from "./create-room/private";
import Rating from "./create-room/rating";
import RoleInfo from "./create-room/roleInfo";
import SpectatorMode from "./create-room/spectatorMode";
import NumberPicker from "./numberPicker";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const EditRoom = ({ editRoom, setEditRoom, setDoorReview }: any) => {
  // scroll to top on every room opnening action
  const scrollRef = useRef<any>();
  useEffect(() => {
    if (scrollRef.current && editRoom) {
      scrollRef.current.scrollTo();
    }
  }, [editRoom]);
  /**
   * App context
   */
  const { theme, apiUrl, activeLanguage, haptics, setAlert } = useAppContext();

  /**
   * Auth context
   */
  const { setCurrentUser, currentUser } = useAuthContext();
  /**
   * Content context
   */
  const { setRerenderRooms } = useContentContext();

  /**
   * Game context
   */
  const { setActiveRoom } = useGameContext();

  /**
   * Room state
   */
  const [oldData, setOldData] = useState({
    ...editRoom,
  });

  const [roomState, setRoomState] = useState<any>({
    ...editRoom,
    title: editRoom?.price?.title > 0 ? editRoom?.title : "",
  });

  /**
   * Open role info
   */
  const [openRoleInfo, setOpenRoleInfo] = useState({ value: null });

  /**
   * Total price of edit room
   */
  const [totalPrice, setTotalPrice] = useState<any>({
    all: 0,
    roles: 0,
    title: 0,
    cover: 0,
    private: 0,
  });

  useEffect(() => {
    const newRolesPrice =
      roomState.roles
        .filter((i: any) => i.price) // Filter items that have a price
        .reduce((acc: number, curr: any) => acc + curr.price, 0) || 0; // Sum up the prices
    let rolesPrice;
    if (currentUser?.vip?.active) {
      rolesPrice = 0;
    } else {
      if (oldData?.price?.roles > newRolesPrice) {
        rolesPrice = oldData?.price?.roles;
      } else {
        rolesPrice = newRolesPrice;
      }
    }
    let titlePrice;
    if (oldData?.price.title > 0) {
      titlePrice = oldData?.price.title;
    } else {
      titlePrice = roomState?.title?.length > 0 ? 500 : 0;
    }
    let coverPrice;
    if (oldData?.price.cover > 0) {
      coverPrice = oldData?.price.cover;
    } else {
      coverPrice = roomState?.cover !== oldData?.cover ? 800 : 0;
    }
    let privatePrice;
    if (oldData?.price.private > 0) {
      if (!currentUser?.vip?.active) {
        privatePrice = oldData?.price.private;
      } else {
        privatePrice = 0;
      }
    } else {
      if (!currentUser?.vip?.active) {
        privatePrice = roomState?.private?.value ? 4 : 0;
      } else {
        privatePrice = 0;
      }
    }
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

  /** Upload Avatar */
  const [file, setFile] = useState<any>(null);

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

  const navigation: any = useNavigation();

  /**
   * Creat room
   */
  const [loading, setLoading] = useState(false);
  const HandleEditRoom = async () => {
    if (roomState.private.value && roomState.private.code < 4) {
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage?.pinCodeNotDefined,
      });
    }

    let newTotal = totalPrice?.all - oldData?.price.all;

    if (newTotal > currentUser?.coins?.total) {
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage?.notEnoughCoinsBuyFeatures,
        button: {
          function: () => navigation.navigate("Coins"),
          text: activeLanguage?.buy,
        },
      });
    }

    try {
      setLoading(true);
      const randomTitle = Date.now() || "";
      const response = await axios.patch(
        apiUrl + "/api/v1/rooms/" + editRoom?._id,
        {
          ...roomState,
          title: roomState?.title?.length > 0 ? roomState?.title : randomTitle,
          price: totalPrice,
        }
      );
      if (response.data.status === "success") {
        setRerenderRooms(true);
        setLoading(false);
        setEditRoom(false);
        setDoorReview(response?.data?.data?.room);
        setOldData(response?.data?.data?.room);
        if (totalPrice?.all > oldData?.price.all) {
          setCurrentUser((prev: any) => ({
            ...prev,
            coins: { ...prev.coins, total: prev.coins.total - newTotal },
          }));
        }
        setTimeout(() => {
          setRerenderRooms(false);
        }, 500);
      }
    } catch (error: any) {
      setAlert({
        active: true,
        text: error.response.data.message,
        type: "error",
      });
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  /**
   * Open popup
   */
  const [openPopup, setOpenPopup] = useState("");

  // open state
  const translateYState = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (openPopup !== "")
      Animated.timing(translateYState, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
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
    <View style={{ flex: 1, width: "100%" }}>
      <BlurView intensity={120} tint="dark" style={styles.container}>
        <BlurView intensity={120} tint="dark" style={styles.header}>
          <Text
            style={{
              color: theme.active,
              fontSize: 20,
              fontWeight: 700,
              maxWidth: "100%",
              overflow: "hidden",
            }}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {roomState?.title.length > 0
              ? roomState?.title
              : "Default: Room - 123..."}
          </Text>
          <Ionicons
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              setEditRoom(false);
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
                {totalPrice?.cover > oldData?.price?.cover && (
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
                      />
                      <Text style={{ fontWeight: 500, color: theme.text }}>
                        800
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            <Text style={styles.title}>
              {activeLanguage.title}
              {"  "}
              {totalPrice?.title > oldData?.price.title && (
                <>
                  <FontAwesome5 name="coins" size={14} color={theme.active} />{" "}
                  <Text style={{ fontWeight: 500, color: theme.text }}>
                    500
                  </Text>
                </>
              )}
            </Text>
            <Input
              placeholder={"Default: Room - 123..."}
              value={roomState.title}
              onChangeText={(text: string) =>
                setRoomState((prev: any) => ({ ...prev, title: text }))
              }
              type="text"
              maxLength={15}
            />
          </View>
          <View style={{ gap: 8 }}>
            <Text style={styles.title}>{activeLanguage?.roles}</Text>
            <Roles
              oldData={oldData}
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
          <Private roomState={roomState} setRoomState={setRoomState} />
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
            <SpectatorMode roomState={roomState} setRoomState={setRoomState} />
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
              totalPrice.all > oldData?.price?.all &&
              !_.isEqual(oldData, roomState) && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <FontAwesome5 name="coins" size={14} color="white" />
                  <Text
                    style={{ color: "white", marginLeft: 4, fontWeight: 500 }}
                  >
                    {totalPrice.all - oldData?.price?.all}
                  </Text>
                </View>
              )
            }
            disabled={_.isEqual(oldData, roomState)}
            title={
              _.isEqual(oldData, roomState)
                ? activeLanguage?.noChanges
                : activeLanguage?.editAndSave
            }
            loading={loading}
            style={{
              width: "100%",
              backgroundColor: theme.active,
              color: "white",
            }}
            onPressFunction={HandleEditRoom}
          />
        </ScrollView>
        {openRoleInfo.value && (
          <BlurView
            intensity={120}
            tint="dark"
            style={{
              position: "absolute",
              top: 0,
              zIndex: 50,
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
              paddingTop: 56,
            }}
          >
            <Animated.View
              style={{
                transform: [{ translateY: translateYState }],
                width: "100%",
                height: "100%",
                alignItems: "center",
              }}
            >
              <MaterialIcons
                name="arrow-drop-down"
                size={40}
                color={theme.active}
                // style={{ position: "absolute", top: 48, right: 16, zIndex: 60 }}
                onPress={() => {
                  closeState();
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
              />
              {openPopup === "avatars" && (
                <Avatars
                  state={roomState}
                  setState={setRoomState}
                  type="room-avatar"
                  setTotalPrice={setTotalPrice}
                  file={file}
                  setFile={setFile}
                />
              )}
              {openPopup === "choiceLanguage" && (
                <ChoiceLanguage
                  state={roomState.language}
                  setState={(e: any) =>
                    setRoomState((prev: any) => ({ ...prev, language: e }))
                  }
                  setOpenPopup={setOpenPopup}
                />
              )}
              {openPopup === "rules" && (
                <Rules
                  roomState={roomState}
                  setRoomState={setRoomState}
                  setOpenPopup={setOpenPopup}
                />
              )}
            </Animated.View>
          </BlurView>
        )}
      </BlurView>
    </View>
  );
};

export default EditRoom;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      zIndex: 20,
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
  });

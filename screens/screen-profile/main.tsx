import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Avatars from "../../components/avatars";
import Header from "../../components/header";
import ChoiceLanguage from "../../components/popup-languages";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useContentContext } from "../../context/content";
import { useProfileContext } from "../../context/profile";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";
import CoverSection from "./coverSection";
import Item from "./item";
import BirthdayWindow from "./popup-birthday";
import EditCountry from "./popup-country";
import EditNameWindow from "./popup-editName";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const Profile = ({ navigation }: any) => {
  /**
   * App state
   */
  const {
    apiUrl,
    setAlert,
    theme,
    activeLanguage,
    language,
    setLanguage,
    haptics,
  } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser, setCurrentUser } = useAuthContext();
  /**
   * Content context
   */
  const {
    opacityList,
    setScrollYProfile,
    scrollViewRefProfile,
    transformListY,
  } = useContentContext();

  /**
   * Profile context
   */
  const { updateState, setUpdateState, translateYState, closeState, items } =
    useProfileContext();

  /**
   * Define user level
   */
  let level = DefineUserLevel({ user: currentUser });

  // on confirm upload avatar
  /** Upload Avatar */
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const ChangeProfileCover = async (cover: any) => {
    if (
      !currentUser?.editOptions?.paidForCover &&
      currentUser?.coins?.total < 1500
    ) {
      return setAlert({
        active: true,
        text: "You don't have enough coins to change cover!",
        type: "error",
      });
    }
    setLoading(true);
    try {
      const response = await axios.patch(
        apiUrl + "/api/v1/users/" + currentUser?._id + "?editType=cover",
        {
          cover: cover,
        }
      );
      if (response.data.status === "success") {
        if (!currentUser?.editOptions?.paidForCover) {
          setCurrentUser((prev: any) => ({
            ...prev,
            cover: cover,
            coins: { ...prev.coins, total: prev.coins.total - 1500 },
            editOptions: { ...prev.editOptions, paidForCover: true },
          }));
        } else {
          setCurrentUser((prev: any) => ({
            ...prev,
            cover: cover,
          }));
        }
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header tab="Profile" tabTitle={activeLanguage?.profile} />

      <Animated.View
        style={{
          opacity: opacityList,
          transform: [{ scale: opacityList }],
          height: 30,
          width: 40,
          position: "absolute",
          top: 110,
          left: SCREEN_WIDTH / 2 - 20,
        }}
      >
        <ActivityIndicator color="orange" size="small" />
      </Animated.View>
      {loading && (
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 90,
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          <ActivityIndicator color="orange" size="small" />
        </BlurView>
      )}
      {/** Items */}
      <ScrollView
        style={{
          width: "100%",
        }}
        onScroll={({ nativeEvent }) => {
          setScrollYProfile(nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={400}
        ref={scrollViewRefProfile}
        // bounces={Platform.OS === "ios" ? false : undefined}
        // overScrollMode={Platform.OS === "ios" ? "never" : "always"}
      >
        <Animated.View
          style={[styles.row, { transform: [{ translateY: transformListY }] }]}
        >
          <View
            style={{
              width: "100%",
              height: 20,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 4,
              gap: 8,
            }}
          >
            {/* View 1: Auto-sized based on its children */}
            <View style={{ flexShrink: 1 }}>
              <Text
                style={{ color: theme.text, fontSize: 14, fontWeight: 500 }}
              >
                {activeLanguage?.lvl}: {level?.current}
              </Text>
            </View>

            {/* View 2: Fills the remaining space between View 1 and View 3 */}
            <View
              style={{
                flexGrow: 1, // Take up remaining space
                height: "100%",
                position: "relative",
                justifyContent: "center",
              }}
            >
              <LinearGradient
                colors={["yellow", "orange"]}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  width: "100%",
                  position: "relative",
                  height: "40%",
                  borderRadius: 50,
                  overflow: "hidden",
                }}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              >
                <View
                  style={{
                    position: "absolute",
                    right: 0,
                    backgroundColor: "#333",
                    width: `${100 - level?.percent}%`,
                    height: "100%",
                  }}
                ></View>
              </LinearGradient>
            </View>

            {/* View 3: Auto-sized based on its children */}
            <View style={{ flexShrink: 1, alignItems: "flex-end" }}>
              <Text
                style={{ color: theme.text, fontSize: 14, fontWeight: 500 }}
              >
                {currentUser?.totalGames}/{level?.max}
              </Text>
            </View>
          </View>

          {/** Items */}
          <CoverSection />
          {currentUser?.trophies?.length > 0 && (
            <View
              style={{
                width: "100%",
                padding: 8,
                paddingHorizontal: 4,
                gap: 8,
              }}
            >
              <Text
                style={{ color: theme.text, fontSize: 14, fontWeight: 500 }}
              >
                Trophies:
              </Text>
            </View>
          )}

          {items.map((item: any, index: number) => {
            return (
              <Item
                style={styles.button}
                key={index}
                item={item}
                navigation={navigation}
              />
            );
          })}
        </Animated.View>
      </ScrollView>
      {/** Popup Screen */}
      {updateState !== "" && (
        <BlurView intensity={120} tint="dark" style={styles.blurContainer}>
          <View style={styles.popupContainer}>
            <Animated.View
              style={{
                transform: [{ translateY: translateYState }],
                width: "100%",
                height: "100%",
                alignItems: "center",
                paddingTop: 48,
              }}
            >
              <Pressable
                style={{ margin: 12, marginBottom: 0 }}
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
              {updateState === "Avatars" && (
                <Avatars
                  state={currentUser}
                  onChange={ChangeProfileCover}
                  type="profile-avatar"
                  file={file}
                  setFile={setFile}
                />
              )}
              {updateState === "Edit Name" && <EditNameWindow />}
              {updateState === "Country" && <EditCountry />}
              {updateState === "Language" && (
                <ChoiceLanguage
                  state={language}
                  setState={async (e: string) => {
                    await AsyncStorage.setItem("IQ-Night:language", e);

                    setLanguage(e);
                  }}
                  setOpenPopup={setUpdateState}
                />
              )}
              {updateState === "Birthday" && <BirthdayWindow />}
            </Animated.View>
          </View>
        </BlurView>
      )}
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 6,
    paddingTop: 108,
    paddingBottom: 96,
    gap: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 12,
    paddingVertical: 8,
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    // borderRadius: 8,
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: 10,
    paddingTop: 48,
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
  },
  popupContainer: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

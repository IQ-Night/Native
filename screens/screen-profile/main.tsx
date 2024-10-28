import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Avatars from "../../components/avatars";
import Header from "../../components/header";
import ChoiceLanguage from "../../components/popup-languages";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useProfileContext } from "../../context/profile";
import CoverSection from "./coverSection";
import Item from "./item";
import BirthdayWindow from "./popup-birthday";
import EditCountry from "./popup-country";
import EditNameWindow from "./popup-editName";
import { useContentContext } from "../../context/content";
import { ActivityIndicator } from "react-native-paper";
import Img from "../../components/image";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const Profile = ({ navigation }: any) => {
  /**
   * App state
   */
  const { theme, activeLanguage, language, setLanguage, haptics } =
    useAppContext();

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
  const { updateState, setUpdateState, translateYState, updateLoading, items } =
    useProfileContext();

  /**
   * Define user level
   */
  let level = DefineUserLevel({ user: currentUser });

  return (
    <View style={{ flex: 1 }}>
      <Header tab="Profile" />

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
                Level: {level?.current}
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
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  width: "100%",
                  position: "relative",
                  height: "40%",
                  borderRadius: 50,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    backgroundColor:
                      level?.percent < 34
                        ? "yellow"
                        : level?.percent > 33 && level?.percent < 67
                        ? "orange"
                        : "green",
                    width: `${level?.percent}%`,
                    height: "100%",
                  }}
                ></View>
              </View>
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
          <Pressable
            onPress={() => setUpdateState("")}
            style={styles.popupPressableContainer}
          >
            <Animated.View
              style={{
                transform: [{ translateY: translateYState }],
                width: "100%",
                height: "100%",
                alignItems: "center",
                paddingTop: 48,
              }}
            >
              {updateState === "Avatars" && (
                <Avatars
                  state={currentUser}
                  setState={setCurrentUser}
                  type="profile-avatar"
                />
              )}
              {updateState === "Edit Name" && <EditNameWindow />}
              {updateState === "Country" && <EditCountry />}
              {updateState === "Language" && (
                <ChoiceLanguage
                  state={language}
                  setState={(e: string) => setLanguage(e)}
                  setOpenPopup={setUpdateState}
                />
              )}
              {updateState === "Birthday" && <BirthdayWindow />}
            </Animated.View>
          </Pressable>
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
  popupPressableContainer: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

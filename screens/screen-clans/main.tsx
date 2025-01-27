import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Header from "../../components/header";
// import { Pagination } from "../../components/pagination";
import { useAppContext } from "../../context/app";
import { useClansContext } from "../../context/clans";
import { useContentContext } from "../../context/content";
import Filter from "./filter";
import List from "./list";
import Button from "../../components/button";
import CreateClan from "./createClan";
import { useAuthContext } from "../../context/auth";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Clans = ({ navigation }: any) => {
  /**
   * App context
   */
  const { haptics, activeLanguage, theme } = useAppContext();
  /**
   * Current user
   */
  const { currentUser } = useAuthContext();

  /**
   * Context state
   */
  const { rerenderClans, transformListY, opacityList } = useContentContext();

  /**
   * Clans state
   */
  const {
    clans,
    search,
    setSearch,
    totalClans,
    totalPages,
    page,
    GetClans,
    loadClans,
  } = useClansContext();

  const debouncedAddClans = (page: number) => {
    if (totalClans > clans?.length) {
      if (haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }
      GetClans(page);
    }
  };

  /**
   * Filter
   */
  const [openFilter, setOpenFilter] = useState(false);
  const translateYFilter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateYFilter, {
      toValue: openFilter ? 0 : SCREEN_HEIGHT - 180,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {});
  }, [openFilter]);

  /**
   * BG scale
   */

  const scaleBg = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (openFilter) {
      Animated.timing(scaleBg, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleBg, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [openFilter]);

  /**
   * Search Animation
   */

  // Boolean to track input focus
  const [isFocused, setIsFocused] = useState(false);
  // Animated values
  const slideAnim = useRef(new Animated.Value(-100)).current; // Initial position off-screen
  const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0

  /**
   * Open search
   */
  const [open, setOpen] = useState(false);

  // Ref for the TextInput
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        inputRef.current?.focus();
        setIsFocused(true);
      });
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  /**
   * Create clan opening
   */
  const [createClan, setCreateClan] = useState(false);
  const translateYCreateClan = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  useEffect(() => {
    if (createClan) {
      Animated.timing(translateYCreateClan, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateYCreateClan, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [createClan]);

  return (
    <View style={{ minHeight: "100%" }}>
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleBg }] }}>
        <Header
          list={clans}
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          load={rerenderClans}
          open={open}
          search={search}
          setSearch={setSearch}
          slideAnim={slideAnim}
          opacityAnim={opacityAnim}
          setOpen={setOpen}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          inputRef={inputRef}
          tab="Clans"
          tabTitle={activeLanguage?.clans}
          totalData={totalClans}
        />
        <Animated.View
          style={{
            opacity: opacityList,
            transform: [{ scale: opacityList }],
            height: 30,
            width: 40,
            position: "absolute",
            top: 156,
            zIndex: 80,
            left: SCREEN_WIDTH / 2 - 20,
          }}
        >
          <ActivityIndicator color="orange" size="small" />
        </Animated.View>
        <Animated.View
          style={{ flex: 1, transform: [{ translateY: transformListY }] }}
        >
          <List navigation={navigation} />
        </Animated.View>
      </Animated.View>
      {!loadClans &&
        !clans?.find((c: any) =>
          c?.members?.some(
            (m: any) => m?.userId === currentUser?._id && m?.status === "member"
          )
        ) && (
          <View
            style={{
              width: "100%",
              // Box shadow for iOS
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              // Elevation for Android
              elevation: 4,
            }}
          >
            <View style={styles.createIcon}>
              <View
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "94%",
                }}
              >
                <Button
                  title={activeLanguage?.create_new_clan}
                  onPressFunction={() => {
                    setCreateClan(true);
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                  }}
                  style={{
                    backgroundColor: theme.active,
                    color: "white",
                    width: "100%",
                  }}
                />
              </View>
            </View>
          </View>
        )}
      <Animated.View
        style={[
          styles.screen,
          {
            transform: [{ translateY: translateYCreateClan }],
          },
        ]}
      >
        <CreateClan setCreateClan={setCreateClan} />
      </Animated.View>
      {openFilter && (
        <Animated.View style={[styles.screen]}>
          <Filter
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            translateYFilter={translateYFilter}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default Clans;

const styles = StyleSheet.create({
  createIcon: {
    borderRadius: 10,
    position: "absolute",
    bottom: 90,
    overflow: "hidden",
    width: "100%",
    alignItems: "center",
  },
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 50,
    paddingBottom: 96,
    paddingTop: 40,
  },
});

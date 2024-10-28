import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Header from "../../components/header";
import { useAppContext } from "../../context/app";
import { useClansContext } from "../../context/clans";
import { useContentContext } from "../../context/content";
import Filter from "./filter";
import List from "./list";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Clans = ({ navigation }: any) => {
  /**
   * App context
   */
  const { haptics } = useAppContext();
  /**
   * Context state
   */
  const { rerenderClans, transformListY, opacityList } = useContentContext();

  /**
   * Clans state
   */
  const { clans, search, setSearch, totalClans } = useClansContext();

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
    right: 12,
    bottom: 90,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#222",
  },
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 50,
    paddingBottom: 96,
  },
});

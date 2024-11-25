import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Header from "../../components/header";
import { useAppContext } from "../../context/app";
import { useContentContext } from "../../context/content";
import { useRoomsContext } from "../../context/rooms";
import CreateRoom from "./create-room/main";
import RoomReview from "./door-review";
import Filter from "./filter";
import List from "./list";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Rooms = ({ navigation }: any) => {
  /**
   * App state
   */
  const { haptics, theme, activeLanguage } = useAppContext();
  /**
   * App state
   */
  const { transformListY, opacityList } = useContentContext();

  /**
   * Rooms state
   */
  const { rooms, totalRooms, search, setSearch, filterStatus } =
    useRoomsContext();

  /**
   * Pin code state
   */
  const [doorReview, setDoorReview] = useState<any>(null);

  /**
   * Create room
   */
  const [createRoom, setCreateRoom] = useState(false);
  const translateYCreateRoom = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  useEffect(() => {
    // Define the animation for opening and closing the room
    Animated.timing(translateYCreateRoom, {
      toValue: createRoom ? 0 : SCREEN_HEIGHT, // 0 to open, SCREEN_HEIGHT to close
      duration: 300,
      easing: Easing.inOut(Easing.ease), // Smooth easing for in-out effect
      useNativeDriver: true, // For smoother and better performance
    }).start();
  }, [createRoom]);

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
    <View style={{ flex: 1 }}>
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleBg }] }}>
        <Header
          list={rooms}
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          open={open}
          search={search}
          setSearch={setSearch}
          slideAnim={slideAnim}
          opacityAnim={opacityAnim}
          setOpen={setOpen}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          inputRef={inputRef}
          tab="Rooms"
          tabTitle={activeLanguage?.rooms}
          totalData={totalRooms}
          filterStatus={filterStatus}
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
          <List setDoorReview={setDoorReview} navigation={navigation} />
        </Animated.View>
      </Animated.View>

      {/* {!createRoom && !doorReview && !openFilter && totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          debouncedAdd={debouncedAddRooms}
        />
      )} */}
      {/* {loadRooms && (
        <BlurView
          intensity={10}
          tint="dark"
          style={{
            position: "absolute",
            zIndex: 90,
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size={24} color={theme.active} />
        </BlurView>
      )} */}

      <View
        style={{
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
              borderRadius: 50,
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              width: 52,
              aspectRatio: 1,
            }}
          >
            <BlurView
              intensity={120}
              tint="dark"
              style={{
                gap: 16,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => {
                  setCreateRoom(true);
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
                style={{
                  // borderWidth: 1.5,
                  // borderColor: "rgba(255,255,255,0.05)",

                  borderRadius: 50,
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  gap: 4,
                  padding: 4,
                }}
              >
                <MaterialCommunityIcons
                  name="plus"
                  // style={{ position: "absolute", zIndex: 60, left: 19 }}
                  size={32}
                  color={theme.active}
                />

                {/* <Text
                  style={{ fontSize: 16, fontWeight: 600, color: theme.active }}
                >
                  Create
                </Text> */}
              </Pressable>
            </BlurView>
          </View>
        </View>
      </View>

      {openFilter && (
        <View style={[styles.screen]}>
          <Filter
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            translateYFilter={translateYFilter}
          />
        </View>
      )}

      <Animated.View
        style={[
          styles.screen,
          {
            transform: [{ translateY: translateYCreateRoom }],
          },
        ]}
      >
        <CreateRoom
          createRoom={createRoom}
          setCreateRoom={setCreateRoom}
          setDoorReview={setDoorReview}
        />
      </Animated.View>

      {doorReview && (
        <RoomReview
          navigation={navigation}
          setDoorReview={setDoorReview}
          doorReview={doorReview}
        />
      )}
    </View>
  );
};

export default Rooms;

const styles = StyleSheet.create({
  createIcon: {
    borderRadius: 50,
    position: "absolute",
    // right: 14,
    width: "100%",
    bottom: 90,
    overflow: "hidden",
    alignItems: "center",
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

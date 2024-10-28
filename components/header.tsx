import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Search from "./search";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import { useNavigation } from "@react-navigation/native";

const Header = ({
  list,
  openFilter,
  setOpenFilter,
  load,
  open,
  search,
  setSearch,
  slideAnim,
  opacityAnim,
  setOpen,
  isFocused,
  setIsFocused,
  inputRef,
  title,
  totalData,
  tab,
  filterStatus,
}: any) => {
  const navigation: any = useNavigation();
  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  // load rooms animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    hide.setValue(open ? 0 : 1);
    Animated.timing(fadeAnim, {
      toValue: load ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [load]);

  // hide total rooms when search with anim
  const hide = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(hide, {
      toValue: open ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [open]);

  const { connectionStatus, reconnectAttempts } = useGameContext();
  return (
    <View style={styles.headerContainer}>
      <BlurView intensity={120} tint="dark" style={styles.blurContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, { color: theme.text }]}>{tab}</Text>
          <View>
            <Text style={{ color: theme.text }}>
              Status: {connectionStatus}
            </Text>
          </View>
          <View
            style={{
              width: 8,
              height: 8,
              backgroundColor:
                connectionStatus === "online"
                  ? "green"
                  : connectionStatus === "reconnecting"
                  ? "orange"
                  : "red",
              borderRadius: 50,
            }}
          />
          <View style={styles.icons}>
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                navigation.navigate("Coins");
              }}
              style={styles.coinsButton}
            >
              <Text style={[styles.coinsText, { color: theme.text }]}>
                {currentUser?.coins?.total}
              </Text>
              <FontAwesome5 name="coins" size={18} color="orange" />
            </Pressable>
          </View>
        </View>
        {tab !== "Profile" && tab !== "Liderboard" && (
          <View style={styles.searchFilterContainer}>
            <Animated.Text
              style={[
                styles.roomsText,
                {
                  color: theme.text,
                  opacity: hide,
                  transform: [{ scale: hide }],
                  zIndex: 50,
                  paddingLeft: 4,
                },
              ]}
            >
              Total: {totalData}
            </Animated.Text>

            <Search
              search={search}
              setSearch={setSearch}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              slideAnim={slideAnim}
              opacityAnim={opacityAnim}
              inputRef={inputRef}
              open={open}
              setOpen={setOpen}
            />
            <Pressable
              onPress={() => {
                setOpenFilter(true);
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
              style={[
                styles.filterButton,
                {
                  borderColor:
                    openFilter || filterStatus
                      ? "orange"
                      : "rgba(255,255,255,0.1)",
                  backgroundColor: "#222",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: openFilter || filterStatus ? "orange" : theme.text,
                  },
                ]}
              >
                Filter
              </Text>
            </Pressable>
          </View>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 50,
    alignItems: "center",
  },
  blurContainer: {
    width: "100%",
    paddingHorizontal: 8,
    paddingTop: 52,
    paddingBottom: 8,
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    position: "relative",
  },
  titleText: {
    fontSize: 34,
    fontWeight: "bold",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  coinsButton: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  coinsText: {
    fontSize: 16,
    fontWeight: "500",
  },
  searchFilterContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
    paddingHorizontal: 4,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    position: "relative",
  },
  activityIndicatorContainer: {
    marginLeft: 12,
    position: "absolute",
    left: 0,
    zIndex: 40,
  },
  roomsText: {
    fontWeight: "500",
    fontSize: 16,
    marginLeft: 12,
    position: "absolute",
    left: 0,
    zIndex: 40,
  },
  filterButton: {
    width: 100,
    padding: 3,
    paddingHorizontal: 32,
    borderRadius: 50,
    borderWidth: 1,
  },
  filterText: {
    fontWeight: "500",
    fontSize: 14,
  },
  bottomBlur: {
    height: 4,
    width: "100%",
  },
});

export default Header;

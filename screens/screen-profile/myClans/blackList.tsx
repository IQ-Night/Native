import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../../context/app";
import Img from "../../../components/image";
import { DefineUserLevel } from "../../../functions/userLevelOptimizer";
import { useAuthContext } from "../../../context/auth";
import axios from "axios";
import BanTimer from "../../../components/banTimer";
import { checkBanExpired } from "../../../functions/checkBan";
import { useGameContext } from "../../../context/game";
import Button from "../../../components/button";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BlackList = ({ navigation, clan }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  /**
   * Game context
   */
  const { socket } = useGameContext();

  /**
   * Black list
   */
  const [loadingList, setLoadingList] = useState(true);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalList, setTotalList] = useState(0);

  const GetList = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/clans/" + clan?._id + "/banList?page=1"
      );
      if (response.data.status === "success") {
        setList(response.data.data.list);
        setPage(1);
        setLoadingList(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoadingList(false);
    }
  };

  useEffect(() => {
    GetList();
  }, []);

  /**
   * Remove from list
   */
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  // Animation for confirmation popup
  const slideAnim = useRef(new Animated.Value(300)).current; // Start off-screen

  const openDeleteConfirm = ({ userId }: any) => {
    setDeleteConfirm(userId);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeDeleteConfirm = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setDeleteConfirm(null));
  };

  // remove
  const [loadingDelete, setLoadingDelete] = useState(false);
  const Remove = async () => {
    try {
      setLoadingDelete(true);
      const response = await axios.delete(
        apiUrl + "/api/v1/clans/" + clan?._id + "/banList/" + deleteConfirm
      );
      if (response.data.status === "success") {
        setList((prev: any) =>
          prev.filter((u: any) => u._id !== deleteConfirm)
        );
        closeDeleteConfirm();
        socket.emit("rerenderAuthUser", { userId: deleteConfirm });
        setLoadingDelete(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  return (
    <ScrollView>
      <View style={styles.row}>
        {loadingList && (
          <View style={{ width: "100%", alignItems: "center" }}>
            <ActivityIndicator
              size={24}
              color={theme.active}
              style={{ marginVertical: 8 }}
            />
          </View>
        )}
        {list?.length < 1 && !loadingList && (
          <Text
            style={{
              color: "rgba(255,255,255,0.3)",
              fontWeight: 500,
              fontSize: 16,
              margin: 16,
              textAlign: "center",
            }}
          >
            Not Found!
          </Text>
        )}
        {list?.map((item: any, index: number) => {
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
                paddingHorizontal: 12,
              }}
            >
              <Pressable
                onPress={() => {
                  navigation.navigate("User", { item: item });
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
                style={{
                  width: 24,
                  aspectRatio: 1,
                  overflow: "hidden",
                  borderRadius: 150,
                }}
              >
                <Img uri={item?.cover} />
              </Pressable>
              <Pressable
                onPress={() => {
                  navigation.navigate("User", { item: item });
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
              >
                <Text
                  style={{
                    color:
                      item?.userId === currentUser?._id
                        ? theme.active
                        : theme.text,
                    fontWeight: 500,
                  }}
                >
                  {item?.userId === currentUser?._id ? "You" : item?.name}
                </Text>
              </Pressable>
              {!checkBanExpired(item) && (
                <Text
                  style={{
                    marginLeft: 4,
                    color: theme.active,
                    fontWeight: 600,
                  }}
                >
                  <BanTimer
                    duration={parseFloat(item.totalHours)}
                    createdAt={item.createdAt}
                  />
                </Text>
              )}
              {clan?.admin?.find(
                (u: any) =>
                  u.user?._id === currentUser?._id && u?.role !== "wiser"
              ) && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginLeft: "auto",
                  }}
                >
                  <Pressable
                    onPress={() => openDeleteConfirm({ userId: item?._id })}
                  >
                    <MaterialIcons name="delete" size={18} color="red" />
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </View>
      {deleteConfirm && (
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
          }}
        >
          <Pressable
            onPress={closeDeleteConfirm}
            style={{ width: "100%", height: "100%" }}
          >
            <Animated.View
              style={[
                styles.confirmPopup,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <BlurView intensity={120} tint="dark" style={styles.confirmBlur}>
                <Text style={styles.confirmText}>
                  Are you sure you want to remove this user from the blacklist?
                </Text>
                <View style={styles.confirmButtons}>
                  <Button
                    title="Cancel"
                    style={styles.cancelButton}
                    onPressFunction={closeDeleteConfirm}
                  />
                  <Button
                    loading={loadingDelete}
                    title="Remove"
                    style={styles.removeButton}
                    onPressFunction={Remove}
                  />
                </View>
              </BlurView>
            </Animated.View>
          </Pressable>
        </BlurView>
      )}
    </ScrollView>
  );
};

export default BlackList;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: 10,
    gap: 6,
    minHeight: SCREEN_HEIGHT * 0.3,
  },
  confirmPopup: {
    height: 300,
    zIndex: 80,
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  confirmBlur: {
    width: "100%",
    height: 300,
    padding: 24,
    paddingTop: 48,
    gap: 32,
  },
  confirmText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  cancelButton: {
    width: "45%",
    backgroundColor: "#888",
    color: "white",
  },
  removeButton: {
    width: "45%",
    backgroundColor: "red",
    color: "white",
  },
});

import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { useAppContext } from "../../context/app";
import Button from "../../components/button";
import { warnings } from "../../context/content";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import Img from "../../components/image";
import BanTimer from "../../components/banTimer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameContext } from "../../context/game";
import { useNavigation } from "@react-navigation/native";

const BlackList = ({}: any) => {
  const navigation: any = useNavigation();

  const { theme, apiUrl } = useAppContext();
  const { socket } = useGameContext();

  const [loading, setLoading] = useState(true);
  const [blackList, setBlackList] = useState([]);

  const GetList = async () => {
    try {
      const response = await axios.get(apiUrl + "/api/v1/admin/blackList");
      if (response?.data.status === "success") {
        setBlackList(response.data.data.blackList);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    GetList();
  }, []);

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
        apiUrl + "/api/v1/admin/blackList/" + deleteConfirm
      );
      if (response.data.status === "success") {
        setBlackList((prev: any) =>
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
    <View style={styles.blurView}>
      <View style={styles.pressable}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={32} color={theme.active} />
          </View>
        )}
        {blackList?.length < 1 && !loading && (
          <Text style={styles.noUsersText}>Black list not found!</Text>
        )}
        {!loading && blackList?.length > 0 && (
          <View
            style={[
              styles.animatedContainer,
              {
                gap: 16,
              },
            ]}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {blackList?.map((item: any, index: number) => {
                return (
                  <View style={styles.blackListItem} key={index}>
                    <Pressable
                      onPress={() =>
                        navigation.navigate("User", { item: item })
                      }
                      style={styles.imageContainer}
                    >
                      <Img uri={item.cover} />
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        navigation.navigate("User", { item: item })
                      }
                    >
                      <Text style={styles.userName}>{item.name}</Text>
                    </Pressable>
                    <Text style={{ color: theme.active, marginLeft: "auto" }}>
                      <BanTimer
                        duration={item.status.totalHours}
                        createdAt={item.status.createdAt}
                      />
                    </Text>
                    <MaterialCommunityIcons
                      name="delete"
                      size={20}
                      color="red"
                      style={{ marginLeft: 8 }}
                      onPress={() => openDeleteConfirm({ userId: item?._id })}
                    />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
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
    </View>
  );
};

export default BlackList;

const styles = StyleSheet.create({
  blurView: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 70,
  },
  pressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  animatedContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    flexShrink: 1,
  },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
    height: 300,
    justifyContent: "center",
  },
  noUsersText: {
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
    fontSize: 16,
    margin: 16,
  },
  blackListTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 18,
    marginVertical: 8,
  },
  scrollContainer: {
    gap: 8,
    alignItems: "center",
  },
  blackListItem: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 12,
  },
  imageContainer: {
    height: 24,
    width: 24,
    borderRadius: 8,
    overflow: "hidden",
  },
  userName: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.5,
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

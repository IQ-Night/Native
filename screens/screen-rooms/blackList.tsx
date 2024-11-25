import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import BanTimer from "../../components/banTimer";
import Button from "../../components/button";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useGameContext } from "../../context/game";
import DeleteConfirm from "../../components/deleteConfirm";

const BlackList = ({
  setOpenBlackList,
  roomId,
  RemoveUser,
  removeLoading,
}: any) => {
  const { theme, apiUrl, activeLanguage } = useAppContext();
  const { socket } = useGameContext();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animation for confirmation popup
  const slideAnim = useRef(new Animated.Value(300)).current; // Start off-screen

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeAnimation = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOpenBlackList(false);
    });
  };

  const [loading, setLoading] = useState(true);
  const [blackList, setBlackList] = useState([]);

  const GetList = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/rooms/" + roomId + "/blackList"
      );
      if (response?.data.status === "success") {
        setBlackList(response.data.data);
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
        apiUrl + "/api/v1/rooms/" + roomId + "/blackList/" + deleteConfirm
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
    <BlurView intensity={140} tint="dark" style={styles.blurView}>
      <Pressable onPress={closeAnimation} style={styles.pressable}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={32} color={theme.active} />
          </View>
        )}
        {blackList?.length < 1 && !loading && (
          <Text style={styles.noUsersText}> {activeLanguage?.not_found}</Text>
        )}
        {!loading && blackList?.length > 0 && (
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
                gap: 16,
              },
            ]}
          >
            <Text style={styles.blackListTitle}>BlackList</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {blackList?.map((item: any, index: number) => {
                return (
                  <Pressable
                    onPress={() => {}}
                    style={styles.blackListItem}
                    key={index}
                  >
                    <View style={styles.imageContainer}>
                      <Img uri={item.cover} />
                    </View>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={{ color: theme.active, marginLeft: "auto" }}>
                      <BanTimer
                        duration={item.totalHours}
                        createdAt={item.createdAt}
                      />
                    </Text>
                    <MaterialCommunityIcons
                      name="delete"
                      size={20}
                      color="red"
                      style={{ marginLeft: 8 }}
                      onPress={() => openDeleteConfirm({ userId: item?._id })}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </Pressable>
      {deleteConfirm && (
        <DeleteConfirm
          closeDeleteConfirm={closeDeleteConfirm}
          text={activeLanguage?.user_delete_confirmation}
          Function={Remove}
          loadingDelete={loadingDelete}
          slideAnim={slideAnim}
        />
      )}
    </BlurView>
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
    paddingTop: 70,
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
});

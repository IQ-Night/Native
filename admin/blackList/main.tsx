import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

const BlackList = ({}: any) => {
  const navigation: any = useNavigation();

  const { theme, apiUrl, activeLanguage } = useAppContext();
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

  /**
   * Delete
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
          <Text style={styles.noUsersText}> {activeLanguage?.not_found}</Text>
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
        <DeleteConfirm
          closeDeleteConfirm={closeDeleteConfirm}
          text={activeLanguage?.user_delete_confirmation}
          Function={Remove}
          loadingDelete={loadingDelete}
          slideAnim={slideAnim}
        />
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
});

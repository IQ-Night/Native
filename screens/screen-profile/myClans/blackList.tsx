import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
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
import BanTimer from "../../../components/banTimer";
import DeleteConfirm from "../../../components/deleteConfirm";
import Img from "../../../components/image";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useGameContext } from "../../../context/game";
import { checkBanExpired } from "../../../functions/checkBan";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BlackList = ({ navigation, clan }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();
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
            {activeLanguage?.not_found}
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
        <DeleteConfirm
          closeDeleteConfirm={closeDeleteConfirm}
          text={activeLanguage?.user_delete_confirmation}
          Function={Remove}
          loadingDelete={loadingDelete}
          slideAnim={slideAnim}
        />
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
});

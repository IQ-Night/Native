import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthContext } from "../../context/auth";

const User = ({ route, navigation, userItem }: any) => {
  let item: any = route?.params?.item || userItem;
  /**
   * App context
   */
  const { theme, apiUrl } = useAppContext();

  // auth
  const { currentUser } = useAuthContext();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const UpdateUser = async () => {
    try {
      const response = await axios.get(apiUrl + "/api/v1/users/" + item?._id);
      if (response.data.status === "success") {
        setUser(response.data.data.user);

        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data);

      setLoading(false);
    }
  };

  /**
   * Define user level
   */
  let level = DefineUserLevel({ user });

  return (
    <>
      {loading && (
        <BlurView style={styles.loader} tint="dark" intensity={30}>
          <ActivityIndicator size={32} color={theme.active} />
        </BlurView>
      )}
      <View
        style={{
          flex: 1,
          width: "100%",
          marginTop: 12,
          paddingHorizontal: 12,
          gap: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 16,
          }}
        >
          <View style={{ width: "33%", aspectRatio: 1, overflow: "hidden" }}>
            <Img uri={item?.cover || item?.userCover} onLoad={UpdateUser} />
          </View>
          <View style={{ gap: 8 }}>
            <Text style={{ color: theme.text, fontWeight: 500, fontSize: 16 }}>
              Level: {level?.current}
            </Text>

            <Text
              style={{
                color: theme.text,
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              Rating: {item?.rating} P.
            </Text>
          </View>
        </View>
        <View>
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.text, fontWeight: 500, fontSize: 16 }}>
              Clans:
            </Text>
            <View style={{ gap: 8 }}>
              {user?.clans?.map((i: any, index: number) => {
                return (
                  <Pressable
                    onPress={() => {
                      if (!userItem) {
                        navigation.navigate("Clan", { item: i });
                      }
                    }}
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        aspectRatio: 1,
                        overflow: "hidden",
                        borderRadius: 50,
                      }}
                    >
                      <Img uri={i?.cover} />
                    </View>
                    <Text style={{ color: theme.text, fontWeight: 500 }}>
                      {i.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default User;

const styles = StyleSheet.create({
  loader: {
    width: "100%",
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    position: "absolute",
    zIndex: 80,
  },
});

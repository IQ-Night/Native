import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../context/app";
import Img from "./image";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Avatars = ({ state, setState, type, setTotalPrice }: any) => {
  /**
   * App context
   */
  const { theme, apiUrl } = useAppContext();

  /**
   * Avatars
   */

  const [avatars, setAvatars] = useState([]);
  const [avatarsLength, setAvatarsLength] = useState(0);
  const [loading, setLoading] = useState(false);

  //Get Products
  const GetAvatars = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        apiUrl + "/api/v1/products?type=" + type
      );
      if (response.data.status === "success") {
        setAvatars(response.data.data.products);
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAvatars();
  }, [type]);

  return (
    <ScrollView
      style={{ width: "100%" }}
      contentContainerStyle={styles.gridContainer}
    >
      {loading ? (
        <View style={{ width: "100%", alignItems: "center" }}>
          <ActivityIndicator
            size={32}
            color={theme.active}
            style={{ marginTop: 48 }}
          />
        </View>
      ) : (
        avatars.map((item: any, index: number) => {
          return (
            <Item
              key={index}
              item={item}
              state={state}
              setState={setState}
              setTotalPrice={setTotalPrice}
            />
          );
        })
      )}
    </ScrollView>
  );
};

const Item = ({ item, index, state, setState, setTotalPrice }: any) => {
  const { theme } = useAppContext();

  return (
    <Pressable
      onPress={() => {
        setState((prev: any) => ({ ...prev, cover: item.file }));
        if (setTotalPrice) {
          setTotalPrice((prev: any) => ({ ...prev, cover: item.price }));
        }
      }}
      style={styles.gridItem}
    >
      <Img uri={item.file} />

      {item.file === state?.cover && (
        <MaterialIcons
          name="done"
          size={24}
          color={theme.active}
          style={{ position: "absolute", top: 8, right: 8, zIndex: 50 }}
        />
      )}

      {item.price > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            position: "absolute",
            bottom: 8,
            left: 8,
            backgroundColor: theme.active,
            borderRadius: 10,
            padding: 2,
            paddingHorizontal: 8,
          }}
        >
          <FontAwesome5 name="coins" size={12} color="white" />
          <Text
            style={{
              color: "white",
              marginLeft: 4,
              fontWeight: "500",
              fontSize: 12,
            }}
          >
            {item.price}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 24,
    gap: 8,
    paddingHorizontal: 12,
    width: "100%",
  },
  gridItem: {
    width: (SCREEN_WIDTH - 40) / 3, // Divide the screen width by 2 for two columns, with padding
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
  },
});

export default Avatars;

import React from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { useAppContext } from "../../context/app";
import Img from "../../components/image";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "../../context/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ItemType {
  id: string;
  name: string;
  rating: number;
  cover: any;
}

interface UserItemProps {
  item: ItemType;
  index: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const UserItem: React.FC<UserItemProps> = ({ item, index }: any) => {
  const navigation: any = useNavigation();
  /**
   * App context
   */
  const { theme } = useAppContext();

  const { currentUser } = useAuthContext();

  return (
    <View style={styles.container}>
      <Text
        style={{
          color: item?._id === currentUser?._id ? theme.active : theme.text,
          fontSize: 18,
          fontWeight: 500,
          width: 20,
        }}
      >
        {index + 1}.
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("User", { item: item })}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginLeft: 8,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 100,
            overflow: "hidden",
          }}
        >
          <Img uri={item.cover} />
        </View>
        <Text
          style={{
            color: item?._id === currentUser?._id ? theme.active : theme.text,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {item.name}
        </Text>
        <CountryFlag
          isoCode={"GE"}
          size={10}
          style={{
            color: theme.text,
            marginLeft: "auto",
          }}
        />
      </TouchableOpacity>
      <View
        style={{
          marginLeft: "auto",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        {index < 3 && (
          <View style={{ width: 24 }}>
            <MaterialCommunityIcons
              name="trophy-award"
              size={24}
              color={theme.active}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
          </View>
        )}
        <Text
          style={{
            width: 50,
            color: item?._id === currentUser?._id ? theme.active : theme.text,
            fontSize: 16,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {item?.rating}
        </Text>
      </View>
    </View>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 10,
    height: 60,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    // Box shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 4,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

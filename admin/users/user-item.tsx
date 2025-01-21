import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import Img from "../../components/image";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";

interface ItemType {
  id: string;
  name: string;
  rating: number;
  cover: any;
}

interface UserItemProps {
  item: ItemType;
  index: number;
  setManageRoles?: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const UserItem: React.FC<UserItemProps> = ({
  item,
  index,
  setManageRoles,
}: any) => {
  const navigation: any = useNavigation();
  /**
   * App context
   */
  const { theme, activeLanguage } = useAppContext();

  const { currentUser } = useAuthContext();
  return (
    <View style={styles.container}>
      <Text
        style={{
          color: item?._id === currentUser?._id ? theme.active : theme.text,
          fontSize: 18,
          fontWeight: 500,
          width: 30,
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
        {item?.status === "online" && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 50,
              borderRadius: 50,
              width: 8,
              height: 8,
              backgroundColor: "green",
            }}
          />
        )}
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
            color:
              item?._id === currentUser?._id
                ? theme.active
                : !item.name
                ? "gray"
                : theme.text,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {item.name || "Register not finished"}
        </Text>
        <CountryFlag
          isoCode={"GE"}
          size={10}
          style={{
            color: theme.text,
          }}
        />
        {item?.admin?.active && (
          <Text
            style={{
              color: theme.active,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            (
            {item.admin.role === "Game Admin"
              ? activeLanguage?.game_admin
              : activeLanguage?.app_admin}
            )
          </Text>
        )}
      </TouchableOpacity>
      <MaterialIcons
        name="manage-accounts"
        size={20}
        color={theme.active}
        style={{ marginLeft: "auto" }}
        onPress={() => setManageRoles(item)}
      />
    </View>
  );
};

export default UserItem;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 10,
    height: 54,
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

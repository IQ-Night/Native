import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ClanItem = ({ item, setUserScreen, navigation }: any) => {
  /**
   * App context
   */
  const { theme, haptics, activeLanguage } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Management
   */
  const founder = item?.admin?.find((a: any) => a.role === "founder")?.user;
  const directors = item?.admin?.filter(
    (a: any) => a.role === "director"
  )?.user;
  const managers = item?.admin?.filter((a: any) => a.role === "manager")?.user;
  const wisers = item?.admin?.filter((a: any) => a.role === "wiser")?.user;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate("Clan", { item: item });
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
      }}
      style={{
        width: "100%",
        // Box shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 2,
        borderBottomWidth: 1,
        borderColor: "#222",
        borderRadius: 8,
      }}
    >
      <View style={styles.container}>
        <View
          style={{
            width: "25%",
            aspectRatio: 1,
            overflow: "hidden",
          }}
        >
          <Img uri={item.cover} />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: "auto",
            gap: 8,
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          {item?.chat && (
            <Text
              style={{
                color: theme.text,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <MaterialCommunityIcons name="chat" size={18} />{" "}
            </Text>
          )}
          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <FontAwesome5 size={14} color={theme.text} name="users" />{" "}
            {
              item.members.filter((memb: any) => memb.status === "member")
                .length
            }
          </Text>
        </View>
        {/** Content */}
        <View
          style={{
            overflow: "hidden",
            flex: 1,
            width: "100%",
            paddingVertical: 12,
          }}
        >
          <View
            style={{
              paddingHorizontal: 12,
              gap: 12,
              width: "100%",
            }}
          >
            <View
              style={{
                justifyContent: "center",
                gap: 4,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  gap: 8,
                  flexDirection: "row",
                }}
              >
                <View style={{ borderRadius: 2, overflow: "hidden" }}>
                  <CountryFlag
                    isoCode={item?.language}
                    size={12}
                    style={{
                      color: theme.text,
                    }}
                  />
                </View>

                <Text
                  style={{
                    width: "60%",
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: "500",
                    overflow: "hidden",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item?.title}
                </Text>
              </View>
              {item?.slogan?.length > 0 && (
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: "500",
                    overflow: "hidden",
                    fontStyle: "italic",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item?.slogan}
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {activeLanguage?.founder}:{" "}
                  {founder.id === currentUser?._id ? (
                    <Text style={{ color: theme.active }}>
                      {activeLanguage?.you}
                    </Text>
                  ) : (
                    founder.name
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ClanItem;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    flexDirection: "row",
    // alignItems: "center",
    borderRadius: 4,
  },
});

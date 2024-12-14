import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAppContext } from "../../context/app";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuthContext } from "../../context/auth";
import Img from "../../components/image";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Item = ({ item, setState, setOpenBuyItem }: any) => {
  const navigation: any = useNavigation();
  /**
   * App context
   */
  const { theme, haptics, activeLanguage } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

  // load img
  const [loadImg, setLoadImg] = useState(true);

  /**
   * product types
   */
  const types = [
    {
      value: "profile-avatar",
      label: activeLanguage?.profileAvatar,
    },
    {
      value: "room-avatar",
      label: activeLanguage?.roomAvatar,
    },
    {
      value: "clan-avatar",
      label: activeLanguage?.clanAvatar,
    },
  ];

  return (
    <View
      style={{
        // Box shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        // Elevation for Android
        elevation: 4,
      }}
    >
      <View
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        <BlurView intensity={20} tint="dark">
          <Pressable
            style={styles.container}
            onPress={() => {
              if (
                !item?.owners?.find((o: any) => o === currentUser?._id) &&
                item?.price > 0
              ) {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setOpenBuyItem(item);
              }
            }}
          >
            {loadImg && (
              <BlurView
                intensity={100}
                style={{
                  height: "100%",
                  aspectRatio: 1,
                  position: "absolute",
                  zIndex: 10,
                }}
              >
                <ShimmerPlaceholder
                  height="100%"
                  shimmerColors={[
                    "rgba(255,255,255,0.02)",
                    "rgba(255,255,255,0.05)",
                    "rgba(255,255,255,0.1)",
                  ]}
                />
              </BlurView>
            )}
            <ImageBackground
              source={{ uri: item.file }}
              onLoad={() => setLoadImg(false)}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"]}
                style={styles.wrapper}
              >
                <View
                  style={{
                    overflow: "hidden",
                    flex: 1,
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      padding: 10,
                      flexDirection: "row",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    {item?.founder?.userId !== currentUser?._id && (
                      <View
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 1, height: 1 },
                          shadowOpacity: 0.4,
                          shadowRadius: 2,
                          // Elevation for Android
                          elevation: 4,
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 60,
                          width: 24,
                          height: 24,
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            if (haptics) {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Soft
                              );
                            }
                            const founder = item?.founder;
                            navigation.navigate("User", {
                              item: { ...founder, _id: founder?.userId },
                            });
                          }}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 100,
                            overflow: "hidden",
                          }}
                        >
                          <Img uri={item.founder.cover} />
                        </Pressable>
                      </View>
                    )}
                    <View style={{ justifyContent: "center", gap: 4 }}>
                      <View
                        style={{
                          justifyContent: "flex-end",
                          gap: 2,
                          height: "100%",
                        }}
                      >
                        {item.price > 0 &&
                          !item?.owners?.find(
                            (o: any) => o === currentUser?._id
                          ) && (
                            <View
                              style={{
                                alignItems: "center",
                                gap: 4,
                                flexDirection: "row",
                                marginBottom: 2,
                              }}
                            >
                              <FontAwesome5
                                name="coins"
                                size={14}
                                color={theme.active}
                              />
                              <Text
                                style={{
                                  color: theme.text,
                                  fontSize: 12,
                                  fontWeight: "500",
                                  overflow: "hidden",
                                  width: "100%",
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {item.price > 0 ? item.price : "Free"}
                              </Text>
                            </View>
                          )}
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: 16,
                            fontWeight: "600",
                            overflow: "hidden",
                            width: "100%",
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item?.title}
                        </Text>
                        {item?.type?.map((i: any, x: number) => {
                          if (types?.find((t: any) => t.value === i)?.label) {
                            return (
                              <Text
                                key={x}
                                style={{
                                  color: theme.text,
                                  fontSize: 10,
                                  fontWeight: "400",
                                  overflow: "hidden",
                                  width: "100%",
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                -{" "}
                                {types?.find((t: any) => t.value === i)?.label}
                              </Text>
                            );
                          }
                        })}
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        </BlurView>
      </View>
    </View>
  );
};

export default Item;

const styles = StyleSheet.create({
  container: {
    width: (SCREEN_WIDTH - 4) / 3,
    aspectRatio: 1,
    overflow: "hidden",
  },

  wrapper: {
    height: "100%",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

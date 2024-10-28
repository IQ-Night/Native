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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Item = ({ item }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

  // load img
  const [loadImg, setLoadImg] = useState(true);

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
          borderRadius: 8,
        }}
      >
        <BlurView intensity={20} tint="dark">
          <Pressable style={styles.container}>
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
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.6)"]}
                style={styles.wrapper}
              >
                {/** Content */}
                <View
                  style={{
                    overflow: "hidden",
                    flex: 1,
                    borderRadius: 16,
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
                    <View style={{ justifyContent: "center", gap: 4 }}>
                      <View
                        style={{
                          justifyContent: "flex-end",
                          gap: 2,
                          height: "100%",
                        }}
                      >
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
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: 12,
                            fontWeight: "400",
                            overflow: "hidden",
                            width: "100%",
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item?.type}
                        </Text>
                        <View
                          style={{
                            alignItems: "center",
                            gap: 4,
                            flexDirection: "row",
                            marginTop: 4,
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
    width: (SCREEN_WIDTH - 40) / 3,
    aspectRatio: 1,
    // backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
    overflow: "hidden",
  },

  wrapper: {
    height: "100%",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

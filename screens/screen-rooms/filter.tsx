import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAppContext } from "../../context/app";
import { useRoomsContext } from "../../context/rooms";
import CountryFlag from "react-native-country-flag";

const Filter = ({ openFilter, setOpenFilter, translateYFilter }: any) => {
  /**
   * App context
   */
  const { theme, activeLanguage } = useAppContext();
  /**
   * Rooms context
   */
  const { languageTotals, language, setLanguage } = useRoomsContext();

  return (
    <BlurView
      intensity={30}
      tint="dark"
      style={{
        flex: 1,
      }}
    >
      <Pressable onPress={() => setOpenFilter(false)} style={styles.container}>
        <Animated.View
          style={{
            transform: [{ translateY: translateYFilter }],
            height: "60%",
            borderRadius: 24,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "#222",
          }}
        >
          <BlurView intensity={120} tint="dark" style={{ flex: 1 }}>
            <View style={styles.header}>
              <Ionicons
                onPress={() => setOpenFilter(false)}
                name="caret-down-outline"
                color={theme.text}
                size={24}
              />
            </View>
            <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              <View style={{ padding: 16 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: 500, color: theme.text }}
                >
                  {activeLanguage?.languages}: ({languageTotals.length})
                </Text>
              </View>
              <View
                style={{
                  width: "100%",
                  gap: 12,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={() => setLanguage("")}
                  style={{
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    padding: 4,
                    paddingVertical: 2,
                    borderWidth: 1,
                    borderColor: language === "" ? "orange" : "transparent",
                  }}
                >
                  <Text
                    style={{ fontSize: 14, fontWeight: 500, color: theme.text }}
                  >
                    {activeLanguage?.all}
                  </Text>
                </Pressable>
                {languageTotals?.map((item: any, index: number) => {
                  return (
                    <Pressable
                      onPress={() => setLanguage(item.language)}
                      key={index}
                      style={{
                        borderRadius: 4,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor:
                          item.language === language ? "orange" : "transparent",
                      }}
                    >
                      <CountryFlag
                        isoCode={item.language}
                        size={16}
                        style={{
                          color: theme.text,
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </BlurView>
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default Filter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    zIndex: 20,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  header: {
    height: 48,
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 20,
  },
});

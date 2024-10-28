import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppContext } from "../../context/app";
import * as Haptics from "expo-haptics";

const TypeFilter = ({ type, setType }: any) => {
  /**
   * App context
   */
  const { theme, haptics } = useAppContext();
  /**
   * Items
   */
  const items = [
    { value: "", label: "All" },
    { value: "profile-avatar", label: "Profile Avatars" },
    { value: "room-avatar", label: "Room Avatars" },
    { value: "clan-avatar", label: "Clan Avatars" },
  ];
  return (
    <ScrollView
      horizontal
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      pagingEnabled
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.filterView}>
        {items.map((item: any, index: number) => {
          return (
            <Pressable
              onPress={() => {
                setType(item.value);
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
              key={index}
              style={{
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
                backgroundColor:
                  type === item.value ? theme.active : "rgba(255,255,255,0.1)",
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: type === item.value ? "white" : theme.text,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default TypeFilter;

const styles = StyleSheet.create({
  scrollView: {
    marginVertical: 8,
    height: 36,
  },
  contentContainer: {
    paddingHorizontal: 12,
    height: 36,
  },
  filterView: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    height: 36,
  },
  filterText: {
    fontSize: 16,
    lineHeight: 36,
    color: "white",
  },
});

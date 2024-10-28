import React, { memo, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
  Text,
  Dimensions,
} from "react-native";
import { useRoomsContext } from "../../context/rooms";
import Door from "./door";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../context/app";
import { useContentContext } from "../../context/content";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const List = memo(({ setDoorReview, navigation }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  /**
   * Content context
   */
  const { setScrollYRooms, scrollViewRefRooms } = useContentContext();

  /**
   * List
   */
  const { rooms, totalRooms, AddRooms, loadAddRooms } = useRoomsContext();

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <ScrollView
        onScroll={({ nativeEvent }) => {
          setScrollYRooms(nativeEvent.contentOffset.y);
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 350;
          if (isCloseToBottom) {
            if (totalRooms > rooms?.length) {
              AddRooms();
            }
          }
        }}
        scrollEventThrottle={400}
        ref={scrollViewRefRooms}
      >
        <View style={styles.row}>
          {/* Animated View for smooth Activity Indicator */}

          <Animated.View
            style={{
              flexDirection: "row",
              width: "100%",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {!totalRooms && totalRooms !== 0 && (
              <View
                style={{
                  width: "100%",
                  alignItems: "center",
                  height: 300,
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size={32} color={theme.active} />
              </View>
            )}
            {rooms?.map((item: any, index: number) => (
              <Door
                key={index}
                item={item}
                setDoorReview={setDoorReview}
                navigation={navigation}
              />
            ))}
            {loadAddRooms && (
              <View style={{ width: "100%", alignItems: "center" }}>
                <ActivityIndicator
                  size={24}
                  color={theme.active}
                  style={{ marginVertical: 8 }}
                />
              </View>
            )}
            {rooms?.length < 1 && totalRooms && (
              <Text
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 500,
                  fontSize: 16,
                  margin: 16,
                }}
              >
                No Rooms Found!
              </Text>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
});

export default List;

const styles = StyleSheet.create({
  row: {
    paddingBottom: 88,
    paddingTop: 154,
    position: "relative",
    paddingHorizontal: 8,
    gap: 8,
  },
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 50,
    paddingBottom: 96,
  },
});

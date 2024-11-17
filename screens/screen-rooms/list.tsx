import React, { memo, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useRoomsContext } from "../../context/rooms";
import Door from "./door";
import { useAppContext } from "../../context/app";
import { ActivityIndicator } from "react-native-paper";
import { useContentContext } from "../../context/content";
import * as Haptics from "expo-haptics";

const List = memo(({ setDoorReview, navigation }: any) => {
  /**
   * App context
   */
  const { theme, haptics } = useAppContext();
  /**
   * Content context
   */
  const { scrollViewRefRooms, setScrollYRooms } = useContentContext();

  /**
   * List
   */
  const { rooms, totalRooms, loadRooms, AddRooms, loadMore } =
    useRoomsContext();

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <ScrollView
        ref={scrollViewRefRooms}
        onScroll={(event: any) =>
          setScrollYRooms(event.nativeEvent.contentOffset.y)
        }
        contentContainerStyle={styles.row}
      >
        {!totalRooms && (
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
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            width: "100%",
          }}
        >
          {rooms?.map((item: any, index: number) => (
            <Door
              key={index}
              item={item}
              setDoorReview={setDoorReview}
              navigation={navigation}
            />
          ))}
          {!loadRooms && totalRooms > 0 && (
            <View style={{ flex: 1, padding: 8, alignItems: "center", gap: 8 }}>
              <Pressable
                style={{
                  padding: 8,
                  paddingHorizontal: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 50,
                }}
                onPress={() => {
                  if (!loadRooms && rooms?.length < totalRooms) {
                    AddRooms();
                  }
                }}
              >
                <Text
                  style={{ color: theme.active, fontWeight: 600, fontSize: 16 }}
                >
                  Load More
                </Text>
              </Pressable>
              {loadMore && <ActivityIndicator size={24} color={theme.active} />}
            </View>
          )}

          {totalRooms > rooms?.length && (
            <View
              style={{
                width: "100%",
                padding: 16,
                gap: 8,
                alignItems: "center",
              }}
            >
              {loadRooms && (
                <ActivityIndicator size={24} color={theme.active} />
              )}
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
        </View>
      </ScrollView>
    </View>
  );
});

export default List;

const styles = StyleSheet.create({
  row: {
    paddingBottom: 140,
    paddingTop: 154,
    position: "relative",
    paddingHorizontal: 8,
    gap: 8,
  },
});

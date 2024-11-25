import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../context/app";
import { useContentContext } from "../../context/content";
import { useRoomsContext } from "../../context/rooms";
import Door from "./door";

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
          {!loadRooms && totalRooms > rooms?.length && (
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
          <Text>
            {totalRooms > rooms?.length && (
              <Text
                style={{
                  width: "100%",
                  padding: 16,
                  gap: 8,
                }}
              >
                {loadRooms && (
                  <ActivityIndicator size={24} color={theme.active} />
                )}
              </Text>
            )}
          </Text>

          <Text style={{ width: "100%" }}>
            {rooms?.length < 1 && !loadRooms && totalRooms !== null && (
              <Text
                style={{
                  width: "100%",
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 500,
                  fontSize: 16,
                  margin: 16,
                  textAlign: "center",
                }}
              >
                No Rooms Found!
              </Text>
            )}
          </Text>
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

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLiderboardContext } from "../../context/liderboard";
import UserItem from "./user-item";
import { useContentContext } from "../../context/content";

const List = () => {
  /**
   * List
   */
  const { liderboard } = useLiderboardContext();
  /**
   * Content context
   */
  const { scrollViewRefLiderBoard, setScrollYLiderBoard } = useContentContext();
  return (
    <View style={{ flex: 1, width: "100%" }}>
      <ScrollView
        onScroll={({ nativeEvent }) => {
          setScrollYLiderBoard(nativeEvent.contentOffset.y);
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 350;
        }}
        scrollEventThrottle={400}
        ref={scrollViewRefLiderBoard}
      >
        <View style={styles.row}>
          {liderboard?.map((item: any, index: number) => {
            return <UserItem key={index} item={item} index={index} />;
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default List;

const styles = StyleSheet.create({
  row: {
    paddingBottom: 88,
    paddingTop: 100,
    position: "relative",
    paddingHorizontal: 4,
  },
});

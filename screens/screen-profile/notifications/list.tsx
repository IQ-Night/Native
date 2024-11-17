import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import NotificationItem from "./notification-item";
import { useNotificationsContext } from "../../../context/notifications";

const List = ({ setDeleteItem }: any) => {
  const { notifications, totalNotifications, AddNotifications } =
    useNotificationsContext();

  const [list, setList] = useState([]);
  useEffect(() => {
    setList(notifications);
  }, [notifications]);

  return (
    <ScrollView
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - 350;
        if (isCloseToBottom) {
          if (totalNotifications > notifications?.length) {
            AddNotifications();
          }
        }
      }}
      scrollEventThrottle={400}
      // ref={scrollViewRefRooms}
    >
      <View style={styles.row}>
        {list?.length < 1 && totalNotifications !== null && (
          <Text
            style={{
              color: "rgba(255,255,255,0.3)",
              fontWeight: 500,
              fontSize: 16,
              margin: 16,
              textAlign: "center",
            }}
          >
            Not Found!
          </Text>
        )}
        {list?.map((item: any, index: number) => {
          return (
            <NotificationItem
              key={index}
              item={item}
              setDeleteItem={setDeleteItem}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

export default List;

const styles = StyleSheet.create({
  row: {
    paddingBottom: 88,
    position: "relative",
    paddingHorizontal: 8,
    gap: 4,
  },
});

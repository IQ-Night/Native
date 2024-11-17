import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useClansContext } from "../../context/clans";
import ClanItem from "./clan-item";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../context/app";
import { useContentContext } from "../../context/content";

const List = ({ setUserScreen, navigation }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();
  /**
   * Content context
   */
  const { scrollViewRefClans, setScrollYClans } = useContentContext();
  /**
   * List
   */
  const { clans, totalClans, AddClans, loadAddClans } = useClansContext();

  return (
    <ScrollView
      onScroll={(event: any) =>
        setScrollYClans(event.nativeEvent.contentOffset.y)
      }
      scrollEventThrottle={400}
      ref={scrollViewRefClans}
    >
      <View style={styles.row}>
        {!totalClans && (
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
        {clans?.length < 1 && totalClans !== null && (
          <Text
            style={{
              color: "rgba(255,255,255,0.3)",
              fontWeight: 500,
              fontSize: 16,
              margin: 16,
            }}
          >
            No Clans Found!
          </Text>
        )}
        {clans?.map((item: any, index: number) => {
          return (
            <ClanItem
              key={index}
              item={item}
              setUserScreen={setUserScreen}
              navigation={navigation}
            />
          );
        })}
        {loadAddClans && (
          <ActivityIndicator
            size={24}
            color={theme.active}
            style={{ marginVertical: 8 }}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default List;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingBottom: 79,
    paddingTop: 154,
    gap: 6,
    paddingHorizontal: 8,
  },
});

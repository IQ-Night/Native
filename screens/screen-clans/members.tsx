import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useClansContext } from "../../context/clans";
import ClanItem from "./clan-item";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../context/app";
import { useContentContext } from "../../context/content";

const Members = ({ route }: any) => {
  const { item } = route?.params;
  /**
   * App context
   */
  const { theme } = useAppContext();
  /**
   * Content context
   */
  const { scrollViewRefClans, setScrollYClans } = useContentContext();
  /**
   * Members
   */
  const { clans, totalClans, AddClans, loadAddClans } = useClansContext();

  return (
    <ScrollView>
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

        {item?.members?.map((member: any, index: number) => {
          return (
            <Text style={{ color: theme.text }} key={index}>
              {member}
            </Text>
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

export default Members;

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

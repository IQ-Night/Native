import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../../context/app";
import ClanItem from "./clan-item";
import { useProfileContext } from "../../../context/profile";
import { useNotificationsContext } from "../../../context/notifications";

const List = ({ navigation }: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  /**
   * Profile context
   */
  const { clans, loadingClans } = useProfileContext();

  return (
    <ScrollView>
      <View style={styles.column}>
        {loadingClans && (
          <View style={{ width: "100%", alignItems: "center" }}>
            <ActivityIndicator
              size={24}
              color={theme.active}
              style={{ marginVertical: 8 }}
            />
          </View>
        )}
        {clans?.length < 1 && !loadingClans && (
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
        {clans?.map((item: any, index: number) => {
          return <ClanItem key={index} item={item} navigation={navigation} />;
        })}
      </View>
    </ScrollView>
  );
};

export default List;

const styles = StyleSheet.create({
  column: {
    gap: 6,
    padding: 6,
    paddingBottom: 96,
  },
});

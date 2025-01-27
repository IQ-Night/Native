import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Item from "./selling-item";
import { useStoreContext } from "../../context/store";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../context/app";

const List = ({ setOpenBuyItem, setState }: any) => {
  const { theme, activeLanguage } = useAppContext();
  const { products, totalProducts } = useStoreContext();
  return (
    <ScrollView style={{ marginTop: 8 }}>
      <View style={styles.row}>
        {!totalProducts && (
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
        {products?.map((item: any, index: number) => {
          return (
            <Item
              key={index}
              item={item}
              setOpenBuyItem={setOpenBuyItem}
              setState={setState}
            />
          );
        })}
        {totalProducts && products?.length < 1 && (
          <Text
            style={{
              color: "rgba(255,255,255,0.3)",
              fontWeight: 500,
              fontSize: 16,
              margin: 16,
            }}
          >
            No Products Found!
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default List;

const styles = StyleSheet.create({
  row: {
    flex: 1,
    width: "100%",
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingBottom: 79,
    gap: 1,
    padding: 1,
  },
});

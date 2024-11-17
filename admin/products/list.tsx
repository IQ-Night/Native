import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Item from "./item";

const List = ({ products, setEditProduct }: any) => {
  return (
    <ScrollView>
      <View style={styles.row}>
        {products?.map((item: any, index: number) => {
          return (
            <Item key={index} item={item} setEditProduct={setEditProduct} />
          );
        })}
        {products?.length < 1 && (
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
    padding: 6,
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 170,
  },
});

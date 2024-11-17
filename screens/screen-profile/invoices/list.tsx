import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useInvoicesContext } from "../../../context/invoices";
import InvoiceItem from "./invoice-item";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../../../context/app";

const List = ({ setDeleteItem }: any) => {
  const { invoices, totalInvoices, AddInvoices, loading } =
    useInvoicesContext();
  const { theme } = useAppContext();
  return (
    <ScrollView
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - 350;

        if (isCloseToBottom) {
          console.log("run");
          console.log("total: " + totalInvoices);
          console.log(invoices?.length);
          if (totalInvoices > invoices?.length) {
            AddInvoices();
          }
        }
      }}
      scrollEventThrottle={400}
      // ref={scrollViewRefRooms}
    >
      <View style={styles.row}>
        {loading && (
          <View style={{ flex: 1, marginVertical: 48 }}>
            <ActivityIndicator size={32} color={theme.active} />
          </View>
        )}
        {invoices?.length < 1 && totalInvoices !== null && (
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
        {!loading &&
          invoices?.map((item: any, index: number) => {
            return (
              <InvoiceItem
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
    gap: 8,
  },
});

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useInvoicesContext } from "../../../context/invoices";
import InvoiceItem from "./invoice-item";

const List = ({ setDeleteItem, invoices }: any) => {
  const { totalInvoices, AddInvoices } = useInvoicesContext();

  return (
    <ScrollView
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - 350;
        // if (isCloseToBottom) {
        //   if (totalInvoices > invoices?.length) {
        //     AddInvoices();
        //   }
        // }
      }}
      scrollEventThrottle={400}
      // ref={scrollViewRefRooms}
    >
      <View style={styles.row}>
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
        {invoices?.map((item: any, index: number) => {
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

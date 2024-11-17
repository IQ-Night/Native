import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import List from "./list";
import axios from "axios";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { BlurView } from "expo-blur";
import { ActivityIndicator } from "react-native-paper";
import * as Haptics from "expo-haptics";
import {
  InvoicesContextWrapper,
  useInvoicesContext,
} from "../../../context/invoices";

const Invoices = () => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  const { setInvoices } = useInvoicesContext();

  const [loading, setLoading] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const DeleteInvoice = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        apiUrl + "/api/v1/users/" + currentUser?._id + "/invoices/" + deleteItem
      );
      if (response.data.status === "success") {
        setInvoices((prev: any) =>
          prev.filter((invoice: any) => invoice.id !== deleteItem)
        );
        setDeleteItem(null);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  return (
    <View style={{ minHeight: "100%" }}>
      <List setDeleteItem={setDeleteItem} />
      {deleteItem && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            position: "absolute",
            top: -50,
            zIndex: 50,
            height: "100%",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <View style={{ paddingHorizontal: 24, gap: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 500,
                textAlign: "center",
                color: theme.text,
              }}
            >
              Are you sure to want to delete this Invoice?
            </Text>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => {
                  setDeleteItem(null);
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: "#333",
                  width: "48%",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                }}
              >
                <Text style={{ fontWeight: "bold", color: theme.text }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={DeleteInvoice}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: theme.active,
                  width: "48%",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 40,
                }}
              >
                {loading ? (
                  <ActivityIndicator size={22} color="white" />
                ) : (
                  <Text style={{ fontWeight: "bold", color: "white" }}>
                    Confirm
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </BlurView>
      )}
    </View>
  );
};

export default Invoices;

const styles = StyleSheet.create({});

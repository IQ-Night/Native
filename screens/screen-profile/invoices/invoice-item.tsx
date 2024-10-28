import axios from "axios";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Img from "../../../components/image";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { useNotificationsContext } from "../../../context/notifications";
import GetTimesAgo from "../../../functions/getTimesAgo";
import { FormatDate } from "../../../functions/formatDate";
import { FontAwesome6 } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const InvoiceItem = ({ item, setDeleteItem }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  return (
    <View style={[styles.container]}>
      <View style={styles.wrapper}>
        <View
          style={{
            width: "100%",
            gap: 8,
            flexDirection: "row",
          }}
        >
          <View style={{ gap: 8, justifyContent: "center" }}>
            <Text
              style={{
                color: theme.active,
                fontSize: 16,

                fontWeight: 500,
              }}
            >
              {item?.coins}{" "}
              <FontAwesome6 name="coins" size={16} color={theme.active} />
            </Text>
            <Text
              style={{
                color: theme.text,
                fontSize: 16,

                fontWeight: 500,
              }}
            >
              {item?.price} $
            </Text>
            <Text
              style={{
                color: theme.text,
                fontSize: 14,

                fontWeight: 500,
              }}
            >
              {FormatDate(item.createdAt, "")}
            </Text>
            <Text
              style={{
                color: "green",
                fontSize: 14,

                fontWeight: 500,
              }}
            >
              Successfully!
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InvoiceItem;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 18,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    // Box shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 4,
  },

  wrapper: {
    width: "100%",
    padding: 12,
    gap: 4,
  },
});

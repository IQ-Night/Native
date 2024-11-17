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
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";

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
          {item?.type === "Buy coins" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.active,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                + {item?.coins}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Buy Vip" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text
                  style={{
                    color: theme.active,
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                >
                  VIP - {item?.duration}
                </Text>
                <MaterialIcons name="diamond" size={20} color={theme.active} />
              </View>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Open room" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Open room
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Edit name" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Edit name
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Edit profile cover" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Change profile avatar
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Edit paid room" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Edit room with paid features
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Create paid room" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Create room with paid features
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Create paid clan" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Create clan with paid features
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Edit paid clan name" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Change paid clan name
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Edit paid clan avatar" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Change paid clan avatar
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Edit paid clan slogan" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Change paid clan slogan
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Turn on chat in clan" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Turned on chat in clan
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Sell product" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Product Sold
              </Text>
              <Text
                style={{
                  color: theme.active,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                + {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
          {item?.type === "Buy product" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 18,

                  fontWeight: 500,
                }}
              >
                Product bought
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
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
                Successfully
              </Text>
            </View>
          )}
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

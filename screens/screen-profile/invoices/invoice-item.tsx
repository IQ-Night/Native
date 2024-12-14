import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../../context/app";
import { useAuthContext } from "../../../context/auth";
import { FormatDate } from "../../../functions/formatDate";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const InvoiceItem = ({ item, setDeleteItem }: any) => {
  /**
   * App context
   */
  const { activeLanguage, theme } = useAppContext();
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
                  color: "green",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                + {item?.coins}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {item?.price}USD
              </Text>
              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
              {/* */}
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
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  VIP -{" "}
                  {item?.Vip?.includes("1 Week")
                    ? 1 + " " + activeLanguage?.week
                    : item?.Vip?.includes("1 Month")
                    ? 1 + " " + activeLanguage?.month
                    : item?.Vip?.includes("3 Months")
                    ? 3 + " " + activeLanguage?.months
                    : item?.Vip?.includes("6 Month")
                    ? 6 + " " + activeLanguage?.month
                    : activeLanguage?.annually}
                </Text>
                <MaterialIcons name="diamond" size={20} color={theme.active} />
              </View>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {item?.price}USD
              </Text>
              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Open room" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.openRoom}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Edit name" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.changeName}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Edit profile cover" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.changeAvatar}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Edit paid room" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.edit_room_with_paid_features}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Create paid room" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.create_room_with_paid_features}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Create paid clan" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.create_clan_with_paid_features}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Edit paid clan name" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.change_paid_clan_name}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Edit paid clan avatar" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.change_paid_clan_avatar}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Edit paid clan slogan" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.change_paid_clan_slogan}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Turn on chat in clan" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.turned_on_chat_in_clan}{" "}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Sell product" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.product_sold}{" "}
              </Text>
              <Text
                style={{
                  color: "green",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                + {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type === "Buy product" && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.product_bought}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
              </Text>
            </View>
          )}
          {item?.type && item?.type?.includes("Sent gift") && (
            <View style={{ gap: 8, justifyContent: "center" }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,

                  fontWeight: 500,
                }}
              >
                {activeLanguage?.send_gift}
              </Text>
              <Text
                style={{
                  color: "red",
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                - {item?.price}{" "}
                <FontAwesome6 name="coins" size={16} color={theme.active} />
              </Text>

              <Text
                style={{
                  color: theme.active,
                  fontSize: 14,

                  fontWeight: 500,
                }}
              >
                {FormatDate(item.createdAt, "")}
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

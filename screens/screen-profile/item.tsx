import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useAppContext } from "../../context/app";
import * as Haptics from "expo-haptics";
import { useProfileContext } from "../../context/profile";
import { Badge } from "react-native-elements";
import { useNotificationsContext } from "../../context/notifications";

const Item = ({ item, style, navigation, openDeactivate }: any) => {
  /**
   * App state
   */
  const { theme, haptics } = useAppContext();
  /**
   * Profile state
   */
  const { setUpdateState } = useProfileContext();
  /**
   * notifications state
   */
  const { clansTotalBadge, unreadNotifications, supportTickets } =
    useNotificationsContext();

  return (
    <Pressable
      style={style}
      onPress={() => {
        if (haptics && item?.type !== "switch") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        if (item?.value === "Deactivation") {
          return openDeactivate();
        }
        if (item.function) {
          item.function();
        } else if (item.type === "screen") {
          navigation.navigate(item.value);
        } else if (item.type === "popup") {
          setUpdateState(item.value);
        }
      }}
    >
      {item.icon}
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
        {item.label}
      </Text>
      {item.value === "My Clans" && clansTotalBadge > 0 && (
        <Badge
          value={clansTotalBadge}
          status="success"
          badgeStyle={{ backgroundColor: theme.active }}
          containerStyle={{}}
        />
      )}
      {item.value === "Help" && supportTickets?.length > 0 && (
        <Badge
          value={supportTickets?.length}
          status="success"
          badgeStyle={{ backgroundColor: theme.active }}
          containerStyle={{}}
        />
      )}
      {item.value === "Notifications" && unreadNotifications.length > 0 && (
        <Badge
          value={unreadNotifications.length}
          status="success"
          badgeStyle={{ backgroundColor: theme.active }}
          containerStyle={{}}
        />
      )}
      {/* {item.value === "Gifts" && 0 > 0 && (
        <Badge
          value={unreadNotifications}
          status="success"
          badgeStyle={{ backgroundColor: theme.active }}
          containerStyle={{}}
        />
      )} */}

      {item.type === "" ? null : item.type === "switch" ? (
        item.switch
      ) : item.type === "popup" ? (
        item.popup
      ) : (
        <View style={{ width: 50, marginLeft: "auto", alignItems: "center" }}>
          <Ionicons name="caret-forward-outline" color={theme.text} size={20} />
        </View>
      )}
    </Pressable>
  );
};

export default Item;

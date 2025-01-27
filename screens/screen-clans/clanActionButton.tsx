import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ActivityIndicator } from "react-native-paper";
import { useAuthContext } from "../../context/auth";

const ClanActionButton = ({
  clans,
  currentUser,
  item,
  haptics,
  actionLoading,
  JoinClan,
  LeaveClan,
  theme,
  activeLanguage,
  userMemberStatus,
}: any) => {
  const isInClan = userMemberStatus;
  const handlePress = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }

    if (isInClan) {
      // Leave Clan logic
      LeaveClan({
        userId: currentUser?._id,
        type: userMemberStatus === "request" ? "cancel request" : "leave clan",
      });
    } else {
      // Join Clan logic
      JoinClan({
        title: item?.title,
        userId: currentUser?._id,
        status: "request",
      });
    }
  };

  const userIsInSomeClan = clans?.find((clan: any) =>
    clan.members?.some(
      (member: any) =>
        member?.userId === currentUser?._id && member?.status === "member"
    )
  );

  return (
    <>
      {userIsInSomeClan && !isInClan ? (
        <></>
      ) : (
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.actionButton,
            { backgroundColor: !isInClan ? theme.active : "#888" },
          ]}
        >
          {actionLoading ? (
            <ActivityIndicator size={16} color="white" />
          ) : (
            <>
              {!isInClan ? (
                <View style={styles.buttonContent}>
                  <MaterialCommunityIcons
                    name="door-open"
                    size={18}
                    color="white"
                  />
                  <Text style={styles.buttonText}>
                    {activeLanguage?.request_to_join}
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  {userMemberStatus !== "request" && (
                    <MaterialIcons name="logout" size={16} color="white" />
                  )}
                  <Text style={styles.buttonText}>
                    {userMemberStatus === "request"
                      ? "Cancel Request"
                      : activeLanguage?.leaveClan}
                  </Text>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    maxWidth: "70%",
    minWidth: "50%",
    height: 32,
    borderRadius: 50,
    alignItems: "center",
    padding: 4,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default ClanActionButton;

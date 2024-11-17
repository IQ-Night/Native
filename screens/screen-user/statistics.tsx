import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppContext } from "../../context/app";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";

const Statistics = ({ user, statistics }: any) => {
  const { theme } = useAppContext();
  let level = DefineUserLevel({ user });

  // Calculate the total number of roles
  const totalRoles: any = Object.values(statistics?.rolesStats || {}).reduce(
    (sum: any, count: any) => sum + count,
    0
  );

  // Calculate the percentage of each role
  const calculatePercentage = (roleCount: number) => {
    return totalRoles > 0 ? ((roleCount / totalRoles) * 100).toFixed(1) : 0;
  };

  return (
    <View style={{ width: "100%", flex: 1, padding: 8, gap: 12 }}>
      <Text
        style={{
          color: theme.active,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        User Stats:
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
          Total games played:
        </Text>
        <Text style={{ color: theme.active, fontSize: 16, fontWeight: 500 }}>
          {user?.totalGames}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
          Points:
        </Text>
        <Text style={{ color: theme.active, fontSize: 16, fontWeight: 500 }}>
          {user?.rating}{" "}
          <MaterialCommunityIcons
            name="diamond"
            size={14}
            color={theme.active}
          />
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
          Level:
        </Text>
        <Text style={{ color: theme.active, fontSize: 16, fontWeight: 500 }}>
          {level?.current}
        </Text>
      </View>
      <Text
        style={{
          color: theme.active,
          fontSize: 16,
          fontWeight: 600,
          marginTop: 8,
        }}
      >
        Game Stats:
      </Text>
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
        Roles:
      </Text>
      <View style={{ gap: 8, marginLeft: 8 }}>
        {[
          "mafia",
          "mafia-don",
          "citizen",
          "doctor",
          "police",
          "serial-killer",
        ].map((role) => {
          const roleCount = statistics?.rolesStats?.[role] || 0;
          const rolePercentage = calculatePercentage(roleCount);
          return (
            <Text
              key={role}
              style={{ color: theme.text, fontWeight: 500, fontSize: 16 }}
            >
              {capitalize(role)}:{" "}
              <Text style={{ color: theme.active }}>
                {roleCount}{" "}
                <Text style={{ color: theme.text, fontStyle: "italic" }}>
                  ({rolePercentage}%)
                </Text>
              </Text>
            </Text>
          );
        })}
      </View>
      {/* <View style={{ gap: 8, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Max points in game:
        </Text>
        <Text style={{ color: theme.active, fontWeight: 600, fontSize: 16 }}>
          {statistics?.maxPoints}
        </Text>
      </View>
      <View style={{ gap: 8, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Min points in game:
        </Text>
        <Text style={{ color: theme.active, fontWeight: 600, fontSize: 16 }}>
          {statistics?.maxPoints}
        </Text>
      </View> */}
    </View>
  );
};

export default Statistics;

const styles = StyleSheet.create({});

// Helper function to capitalize the first letter of the role
const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");
};

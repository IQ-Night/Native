import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppContext } from "../../context/app";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DefineUserLevel } from "../../functions/userLevelOptimizer";

const Statistics = ({ user, statistics }: any) => {
  console.log(statistics);
  const { theme } = useAppContext();
  let level = DefineUserLevel({ user });
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
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Total games played:
        </Text>
        <Text style={{ color: theme.text, fontSize: 16 }}>
          {user?.totalGames}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>Points:</Text>
        <Text style={{ color: theme.text, fontSize: 16 }}>
          {user?.rating}{" "}
          <MaterialCommunityIcons
            name="diamond"
            size={14}
            color={theme.active}
          />
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>Level:</Text>
        <Text style={{ color: theme.text, fontSize: 16 }}>
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
      <View style={{ gap: 8, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>
          Average points in game:
        </Text>
        <Text style={{ color: theme.active, fontWeight: 600, fontSize: 16 }}>
          {(statistics?.averagePoints).toFixed(2)}
        </Text>
      </View>
      <View style={{ gap: 8, flexDirection: "row", alignItems: "center" }}>
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
      </View>
    </View>
  );
};

export default Statistics;

const styles = StyleSheet.create({});

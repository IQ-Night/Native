import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";

import { Animated, Button, Text, View } from "react-native";

const Stack = createStackNavigator();

const AnimationCard = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, next }) => {
          const progress = next
            ? Animated.add(current.progress, next.progress)
            : current.progress;

          return {
            cardStyle: {
              transform: [
                {
                  rotateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            },
          };
        },
        cardOverlayEnabled: true,
      }}
    >
      <Stack.Screen name="ScreenA" component={ScreenA} />
      <Stack.Screen name="ScreenB" component={ScreenB} />
    </Stack.Navigator>
  );
};

export default AnimationCard;

const ScreenA = ({ navigation }: any) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "red",
      }}
    >
      <Text>This is Screen A (Front Side)</Text>
      <Button
        title="Go to Screen B"
        onPress={() => navigation.navigate("ScreenB")}
      />
    </View>
  );
};
const ScreenB = ({ navigation }: any) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "green",
      }}
    >
      <Text>This is Screen B (Back Side)</Text>
      <Button
        title="Go to Screen A"
        onPress={() => navigation.navigate("ScreenA")}
      />
    </View>
  );
};

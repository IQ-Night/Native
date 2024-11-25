import { createStackNavigator } from "@react-navigation/stack";
import ChoiceAuth from "../auth/choiceAuth";
import Login from "../auth/login";
import Register from "../auth/register";
import { useAppContext } from "../context/app";
import Landing from "../screens/screen-landing/main";
import { Pressable, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const AuthStackNavigator = () => {
  /**
   * Screen stacks
   */
  const AuthStack = createStackNavigator();

  /**
   * App context
   */
  const { theme, activeLanguage, haptics } = useAppContext();

  return (
    <AuthStack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: "#111" }, // Set the entire navigator background to transparent
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#111",
        },
        headerTintColor: theme.text,
      }}
    >
      <AuthStack.Screen
        name="Landing"
        component={Landing}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={({ route, navigation }: any) => ({
          headerTitle: activeLanguage?.login,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                navigation.goBack();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="arrow-left" size={42} color={theme.text} />
            </Pressable>
          ),
        })}
      />
      <AuthStack.Screen
        name="Choice Auth"
        component={ChoiceAuth}
        options={({ route, navigation }: any) => ({
          headerTitle: activeLanguage?.choiceAuth,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                navigation.goBack();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="arrow-left" size={42} color={theme.text} />
            </Pressable>
          ),
        })}
      />
      <AuthStack.Screen
        name="Register"
        component={Register}
        options={({ route, navigation }: any) => ({
          headerTitle: activeLanguage?.register,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                navigation.goBack();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="arrow-left" size={42} color={theme.text} />
            </Pressable>
          ),
        })}
      />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;

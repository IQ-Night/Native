import { createStackNavigator } from "@react-navigation/stack";
import Login from "../auth/login";
import Register from "../auth/register";
import { useAppContext } from "../context/app";
import Landing from "../screens/screen-landing/main";
import { Pressable, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import addationalFields from "../auth/addationalFields";
import About from "../screens/screen-about/main";
import Rules from "../screens/screen-rules/main";
import Help from "../screens/screen-help/main";
import Privacy from "../screens/screen-privacy/main";

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
        name="About"
        options={({ route, navigation }) => ({
          headerTitle: "",
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
              <Text
                style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
              >
                {activeLanguage?.about}
              </Text>
            </Pressable>
          ),
        })}
        component={About}
      />
      <AuthStack.Screen
        name="Terms & Rules"
        options={({ route, navigation }) => ({
          headerTitle: "",
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
              <Text
                style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
              >
                {activeLanguage?.terms}
              </Text>
            </Pressable>
          ),
        })}
        component={Rules}
      />
      <AuthStack.Screen
        name="Privacy"
        options={({ route, navigation }) => ({
          headerTitle: "",
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
              <Text
                numberOfLines={1}
                style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
              >
                {activeLanguage?.privacy}
              </Text>
            </Pressable>
          ),
        })}
        component={Privacy}
      />
      <AuthStack.Screen
        name="Help"
        options={({ route, navigation }) => ({
          headerTitle: "",
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
              <Text
                style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}
              >
                {activeLanguage?.help}
              </Text>
            </Pressable>
          ),
        })}
        component={Help}
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

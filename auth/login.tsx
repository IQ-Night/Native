import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Button from "../components/button";
import Input from "../components/input";
import ForgotPassword from "./forgotPassword";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface PropsType {}

const Login: React.FC<PropsType> = ({ navigation }: any) => {
  /**
   * App context
   */
  const { apiUrl, setAlert, theme, activeLanguage, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { setCurrentUser, setActiveRoute } = useAuthContext();

  // loading state
  const [loading, setLoading] = useState(false);

  /**
   * Login fields
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordInputRef = useRef<TextInput>(null);

  /**
   * Login function
   */

  const Login = async () => {
    try {
      // post login to backend
      Keyboard.dismiss();
      if (email?.length < 1 || password?.length < 1) {
        return setAlert({
          active: true,
          type: "error",
          text: activeLanguage.inputFields,
        });
      }
      if (!email?.includes("@")) {
        return setAlert({
          active: true,
          type: "error",
          text: activeLanguage.wrongEmail,
        });
      }
      if (password?.length < 8) {
        return setAlert({
          active: true,
          type: "error",
          text: activeLanguage.passwordLength,
        });
      }
      setLoading(true);
      await axios
        .post(`${apiUrl}/api/v1/login`, {
          email: email,
          password: password,
        })
        .then(async (data) => {
          await AsyncStorage.setItem(
            "IQ-Night:jwtToken",
            JSON.stringify(data.data.accessToken)
          );
          await AsyncStorage.setItem(
            "IQ-Night:jwtRefreshToken",
            JSON.stringify(data.data.refreshToken)
          );
          setCurrentUser(data.data.user);
          // const pushNotificationToken = await AsyncStorage.getItem(
          //   "IQ-Night:pushNotificationsToken"
          // );
          // if (pushNotificationToken) {
          //   await axios.patch(`${apiUrl}/api/v1/users/` + data.data.user._id, {
          //     pushNotificationToken: JSON.parse(pushNotificationToken),
          //   });
          // }

          setTimeout(() => {
            setLoading(false);
          }, 1000);
        });
    } catch (err: unknown) {
      console.log(err);
      setLoading(false);
      // Check if 'err' is an object and has 'response' property
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response: { data: { message: string } } };
        setAlert({
          active: true,
          type: "error",
          text: errorObj.response.data.message,
        });
      } else {
        // Handle other types of errors
        console.error("An unexpected error occurred:", err);
      }
    }
  };

  /**
   * Open Forgot password
   */
  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  return (
    <>
      {/* Forgot password */}
      <ForgotPassword
        forgotPass={openForgotPassword}
        onPressFunction={() => setOpenForgotPassword(false)}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <View style={styles.inputContainer}>
              <Input
                placeholder={activeLanguage.email}
                onChangeText={(text: string) => setEmail(text)}
                type="text"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                value={email}
              />
              <View style={styles.inputSpacing} />
              <Input
                placeholder={activeLanguage.password}
                onChangeText={(text: string) => setPassword(text)}
                type="password"
                onSubmitEditing={() => {
                  Login();
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
                returnKeyType="go"
                ref={passwordInputRef}
                value={password}
              />
              <Pressable
                style={{}}
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setOpenForgotPassword(true);
                }}
              >
                <Text
                  style={{
                    textDecorationLine: "underline",
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: "500",
                    marginTop: 15,
                  }}
                >
                  {activeLanguage.forgotPass}?
                </Text>
              </Pressable>
              <View style={{ marginTop: 30 }}>
                <Button
                  style={{
                    width: (SCREEN_WIDTH / 100) * 95,
                    color: "white",
                    backgroundColor: theme.active,
                  }}
                  title={activeLanguage.login}
                  loading={loading}
                  onPressFunction={Login}
                />
              </View>
            </View>
            <View
              style={{
                width: "100%",
                position: "absolute",
                bottom: 48,
                alignItems: "center",
              }}
            >
              <Button
                style={{
                  width: (SCREEN_WIDTH / 100) * 95,
                  color: "white",
                  backgroundColor: theme.active,
                }}
                icon=""
                title={activeLanguage.createAccount}
                loading={false}
                onPressFunction={() => navigation.navigate("Choice Auth")}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: (SCREEN_WIDTH / 100) * 95,
    position: "relative",
    bottom: 48,
  },
  inputSpacing: {
    height: 8, // Adjust the height for spacing
  },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
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
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import ForgotPassword from "./forgotPassword";
import { ANDROID_CLIENT_ID, IOS_CLIENT_ID, EXPO_CLIENT_ID } from "@env";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface PropsType {}

const Login: React.FC<PropsType> = ({ navigation }: any) => {
  /**
   * App context
   */
  const { apiUrl, setAlert, theme, activeLanguage, haptics, language } =
    useAppContext();

  /**
   * Auth context
   */
  const { setCurrentUser, setAddationalFields } = useAuthContext();

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
          language: language,
        })
        .then(async (data) => {
          if (data.data) {
            await AsyncStorage.setItem(
              "IQ-Night:jwtToken",
              JSON.stringify(data.data.accessToken)
            );
            await AsyncStorage.setItem(
              "IQ-Night:jwtRefreshToken",
              JSON.stringify(data.data.refreshToken)
            );
          }
          if (data?.data?.user?.name) {
            setCurrentUser(data.data.user);
          } else {
            setLoading(false);
            setAddationalFields({
              user: data.data.user,
            });
          }
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

        if (
          errorObj?.response?.data?.message.includes(
            "The account already signed in from another device!"
          )
        ) {
          const userId = errorObj?.response?.data?.message?.split("*")[1];
          return setAlert({
            active: true,
            type: "error",
            text: activeLanguage?.already_signed,
            button: {
              function: () => logoutAll({ userId }),
              text: activeLanguage?.logout_all_offer,
            },
          });
        }
        setAlert({
          active: true,
          type: "error",
          text: errorObj.response.data.message,
        });
      } else {
        // Handle other types of errors
        console.log("An unexpected error occurred:", err);
      }
    }
  };

  /**
   * Open Forgot password
   */
  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  /**
   * Registration
   */
  const ProviderAuth = async (
    first: string,
    last: string,
    email: string,
    provider: string,
    registerDevice: string,
    identityToken: string
  ) => {
    const randomName = new Date().getTime();
    try {
      const response = await axios.post(
        `${apiUrl}/api/v1/providerauth?provider=` +
          provider +
          "&device=" +
          registerDevice,
        {
          name: first || last ? first + " " + last : randomName,
          email: email,
          identityToken: identityToken,
          language: language,
        }
      );
      if (response?.data?.status === "success") {
        if (
          !response?.data?.user?.acceptPrivacy ||
          !response?.data?.user?.acceptTerms ||
          !response?.data?.user?.country
        ) {
          await AsyncStorage.setItem(
            "IQ-Night:jwtToken",
            JSON.stringify(response.data.accessToken)
          );
          await AsyncStorage.setItem(
            "IQ-Night:jwtRefreshToken",
            JSON.stringify(response.data.refreshToken)
          );
          setAddationalFields({
            user: response.data.user,
            registerType: response?.data?.registerType,
            navigation: navigation,
          });
        } else {
          await AsyncStorage.setItem(
            "IQ-Night:jwtToken",
            JSON.stringify(response.data.accessToken)
          );
          await AsyncStorage.setItem(
            "IQ-Night:jwtRefreshToken",
            JSON.stringify(response.data.refreshToken)
          );
          setCurrentUser(response.data.user);
        }
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response: { data: { message: string } } };

        if (errorObj?.response?.data?.message === "Please provide your email") {
          return setAlert({
            active: true,
            type: "error",
            text: activeLanguage?.user_identificator_error,
            button: {
              function: () => navigation.navigate("Help"),
              text: activeLanguage?.help,
            },
          });
        }
        if (
          errorObj?.response?.data?.message.includes(
            "The account already signed in from another device!"
          )
        ) {
          const userId = errorObj?.response?.data?.message?.split("*")[1];
          return setAlert({
            active: true,
            type: "error",
            text: activeLanguage?.already_signed,
            button: {
              function: () => logoutAll({ userId }),
              text: activeLanguage?.logout_all_offer,
            },
          });
        }
        console.log(errorObj.response.data.message);
        return setAlert({
          active: true,
          type: "error",
          text: errorObj.response.data.message || activeLanguage?.went_wrong,
        });
      } else {
        // Handle other types of errors
        console.log("An unexpected error occurred:", err);
      }
    }
  };

  /**
   * Google auth
   */

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    expoClientId: EXPO_CLIENT_ID,
  });

  const GetUserInfo = async (token: string) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const user = await response.json();
      ProviderAuth(
        user?.given_name,
        user?.family_name,
        user?.email,
        "google",
        Platform.OS,
        user?.identityToken
      );
    } catch (error: any) {
      // TypeScript 4.x and later allows use of 'unknown' instead of 'any' for more strict type checking.

      // Some other error happened
      console.log(error);
    }
  };

  useEffect(() => {
    SignIn();
  }, [response]);

  const SignIn = async () => {
    // Check both that response exists and response type is 'success'
    if (response?.type === "success" && response.authentication) {
      // Ensure accessToken is available before proceeding
      if (response.authentication.accessToken) {
        await GetUserInfo(response.authentication.accessToken);
      } else {
        // Handle the case where accessToken is not available
        console.log("No access token available");
      }
    }
  };

  // logout all users if mulitple are the same time in online
  const logoutAll = async ({ userId }: any) => {
    try {
      const response = await axios.patch(apiUrl + "/api/v1/logoutAll", {
        userId,
      });
      if (response?.data?.status === "success") {
        return setAlert({
          active: true,
          type: "success",
          text: activeLanguage?.all_logout,
        });
      }
    } catch (error: any) {
      console.log(error?.response?.data?.message);
    }
  };

  return (
    <>
      {/* Forgot password */}
      <ForgotPassword
        forgotPass={openForgotPassword}
        onPressFunction={() => setOpenForgotPassword(false)}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "position"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // შეცვალე შესაბამისი UI მოთხოვნებიდან
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

              <View style={{ marginTop: 16 }}>
                <Button
                  style={{
                    width: (SCREEN_WIDTH / 100) * 95,
                    color: "white",
                    backgroundColor: theme.active,
                  }}
                  icon={
                    <MaterialCommunityIcons
                      name="login"
                      size={24}
                      color="white"
                    />
                  }
                  title={activeLanguage.login}
                  loading={loading}
                  onPressFunction={Login}
                />
              </View>
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

              <View
                style={{
                  gap: 8,
                  alignItems: "center",
                  marginTop: 16,
                }}
              >
                <Button
                  style={{
                    width: (SCREEN_WIDTH / 100) * 95,
                    color: "#fff",
                    backgroundColor: "#4285F4",
                  }}
                  icon={
                    <MaterialCommunityIcons
                      name="google"
                      size={24}
                      color="white"
                    />
                  }
                  title={activeLanguage.signInWithGoogle}
                  loading={false}
                  onPressFunction={() => promptAsync()}
                />

                {Platform.OS === "ios" && (
                  <Button
                    style={{
                      width: (SCREEN_WIDTH / 100) * 95,
                      color: "#fff",
                      backgroundColor: "#212124",
                    }}
                    icon={
                      <MaterialCommunityIcons
                        name="apple"
                        size={24}
                        color="white"
                      />
                    }
                    title={activeLanguage.signInWithApple}
                    loading={false}
                    onPressFunction={async () => {
                      try {
                        const credential =
                          await AppleAuthentication.signInAsync({
                            requestedScopes: [
                              AppleAuthentication.AppleAuthenticationScope
                                .FULL_NAME,
                              AppleAuthentication.AppleAuthenticationScope
                                .EMAIL,
                            ],
                          });

                        if (credential.user) {
                          // Destructure the fullName object for clarity
                          const { givenName, familyName } =
                            credential.fullName || {};

                          console.log(credential?.fullName);

                          // Providing default values in case givenName or familyName are undefined
                          const firstName = givenName || "";
                          const lastName = familyName || "";
                          const email = credential.email || "";

                          const identityToken = credential.user || "";

                          ProviderAuth(
                            firstName,
                            lastName,
                            email,
                            "apple",
                            Platform.OS,
                            identityToken
                          );
                        } else {
                          return setAlert({
                            active: true,
                            type: "error",
                            text: activeLanguage.somethingWentWrong,
                          });
                        }

                        // signed in
                      } catch (e) {
                        if (
                          typeof e === "object" &&
                          e !== null &&
                          "code" in e
                        ) {
                          const errorObj = e as {
                            code: string;
                            message: string;
                          };
                          if (errorObj.code === "ERR_REQUEST_CANCELED") {
                            // handle that the user canceled the sign-in flow
                          } else {
                            // handle other errors
                          }
                        }
                      }
                    }}
                  />
                )}

                <Button
                  style={{
                    width: (SCREEN_WIDTH / 100) * 95,
                    color: "white",
                    backgroundColor: theme.active,
                  }}
                  title={activeLanguage.createAccount}
                  loading={false}
                  onPressFunction={() => navigation.navigate("Register")}
                />
              </View>
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
  },
  inputSpacing: {
    height: 8, // Adjust the height for spacing
  },
});

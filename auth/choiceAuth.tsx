import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/button";
import { useAuthContext } from "../context/auth";
import { useAppContext } from "../context/app";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuidv4 } from "uuid";

WebBrowser.maybeCompleteAuthSession();

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface PropsType {}

const ChoiceAuth: React.FC<PropsType> = ({ navigation }: any) => {
  /**
   * App Context
   */
  const { apiUrl, setAlert, theme, activeLanguage } = useAppContext();

  /**
   * Auth context
   */
  const { setCurrentUser, activeRoute, setActiveRoute } = useAuthContext();

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
    try {
      const pushNotificationToken = await AsyncStorage.getItem(
        "Wordex:pushNotificationsToken"
      );
      const response = await axios.post(
        `${apiUrl}/api/v1/providerauth?provider=` +
          provider +
          "&device=" +
          registerDevice,
        {
          name: first || last ? first + " " + last : uuidv4(),
          email: email,
          coins: { total: 200 },
          pushNotificationToken: pushNotificationToken
            ? JSON.parse(pushNotificationToken)
            : "",
          identityToken: identityToken,
        }
      );
      await AsyncStorage.setItem(
        "IQ-Night:jwtToken",
        JSON.stringify(response.data.data.accessToken)
      );
      await AsyncStorage.setItem(
        "IQ-Night:jwtRefreshToken",
        JSON.stringify(response.data.data.refreshToken)
      );
      setCurrentUser(response.data.data.user);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response: { data: { message: string } } };

        return setAlert({
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
   * Google auth
   */

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "875112845369-2eq4eqhsrp1kil498optge7rmbqks8v4.apps.googleusercontent.com",
    iosClientId:
      "875112845369-hvrjrkosi1hbin0llipdns2shflq087r.apps.googleusercontent.com",
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
      console.error(error);
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
        console.error("No access token available");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          gap: 8,
          alignItems: "center",
          position: "relative",
          bottom: 48,
        }}
      >
        <Button
          style={{
            width: (SCREEN_WIDTH / 100) * 95,
            color: "white",
            backgroundColor: "orange",
          }}
          title={activeLanguage.email}
          loading={false}
          onPressFunction={() => navigation.navigate("Register")}
        />
        <Button
          style={{
            width: (SCREEN_WIDTH / 100) * 95,
            color: "#fff",
            backgroundColor: "#4285F4",
          }}
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
            title={activeLanguage.signInWithApple}
            loading={false}
            onPressFunction={async () => {
              try {
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });

                if (credential.user) {
                  // Destructure the fullName object for clarity
                  const { givenName, familyName } = credential.fullName || {};

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
                if (typeof e === "object" && e !== null && "code" in e) {
                  const errorObj = e as { code: string; message: string };
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
            color: "#111",
            backgroundColor: "#fff",
          }}
          title={activeLanguage.login}
          loading={false}
          onPressFunction={() => navigation.navigate("Login")}
        />
      </View>
    </View>
  );
};

export default ChoiceAuth;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,

    gap: 30,
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
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});

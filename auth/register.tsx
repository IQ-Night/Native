import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Haptics from "expo-haptics";
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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Button from "../components/button";
import Input from "../components/input";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import Countries from "./countries";
import VerifyCodePopup from "./inputPopup";
import CheckboxWithLabel from "../components/checkBox";
import Alert from "../components/alert";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface PropsType {}

const Register: React.FC<PropsType> = ({ navigation }: any) => {
  /**
   * App context
   */

  const { apiUrl, setAlert, activeLanguage, theme, haptics, language } =
    useAppContext();

  /**
   * Auth context
   */
  const { setActiveRoute, activeRoute, setCurrentUser } = useAuthContext();

  /**
   * Register fields
   */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("GE");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // loading state
  const [loading, setLoading] = useState(false);

  // verify email states
  const [verify, setVerify] = useState(false);
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");

  /**
   * Send verify email
   */

  const SendEmail = async () => {
    Keyboard.dismiss();
    if (
      email?.length < 1 ||
      password?.length < 1 ||
      name?.length < 1 ||
      confirmPassword?.length < 1 ||
      !terms ||
      !privacy
    ) {
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
    if (password !== confirmPassword) {
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage.samePasswordError,
      });
    }
    try {
      setLoading(true);
      const response = await axios.post(`${apiUrl}/api/v1/sendVerifyEmail`, {
        email: email,
      });

      setCode(response.data.code);
      setVerify(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      console.log("send email error");
      console.log(error.response.data);
      setLoading(false);
      setAlert({
        active: true,
        type: "error",
        text: error.response.data.message,
      });
    }
  };

  /**
   * Registration
   */

  const [registerLoading, setRegisterLoading] = useState(false);

  const RegisterFnc = async () => {
    if (code === codeInput) {
      try {
        Keyboard.dismiss();
        const pushNotificationToken = await AsyncStorage.getItem(
          "IQ-Night:pushNotificationsToken"
        );
        await axios
          .post(`${apiUrl}/api/v1/signup`, {
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            registerDevice: Platform.OS === "android" ? "android" : "ios",
            registerType: "email",
            country: country,
            language: language,
            acceptPrivacy: true,
            acceptTerms: true,
          })
          .then(async (data) => {
            if (data) {
              await AsyncStorage.setItem(
                "IQ-Night:jwtToken",
                JSON.stringify(data.data.accessToken)
              );
              await AsyncStorage.setItem(
                "IQ-Night:jwtRefreshToken",
                JSON.stringify(data.data.refreshToken)
              );
              setCurrentUser(data.data.user);
              setVerify(false);
              setTimeout(() => {
                setRegisterLoading(false);
              }, 1000);
            }
          });
      } catch (err) {
        console.log("this is register error");
        setLoading(false);
        // Check if 'err' is an object and has 'response' property
        if (typeof err === "object" && err !== null && "response" in err) {
          const errorObj = err as { response: { data: { message: string } } };

          return setAlert({
            active: true,
            type: "error",
            text: errorObj.response.data.message,
          });
        } else {
          // Handle other types of errors
          console.log("An unexpected error occurred:", err);
        }
      }
    } else {
      setRegisterLoading(false);
      setAlert({
        active: true,
        type: "error",
        text: activeLanguage.wrongVerificationCode,
      });
    }
  };

  // open countries
  const [openCountries, setOpenCountries] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: "100%" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={{ position: "absolute", zIndex: 50 }}>
        {verify && (
          <VerifyCodePopup
            codeInput={codeInput}
            code={code}
            setCode={setCodeInput}
            setFunction={RegisterFnc}
            open={verify}
            setOpen={setVerify}
            registerMessages={true}
            loading={registerLoading}
            setLoading={setRegisterLoading}
          />
        )}
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <View style={styles.inputSpacing} />
            <Input
              placeholder={`${activeLanguage.fullName}*`}
              onChangeText={(text: string) => setName(text)}
              type="text"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              ref={nameInputRef}
              value={name}
            />
            <Input
              placeholder={`${activeLanguage.email}*`}
              onChangeText={(text: string) => setEmail(text)}
              type="text"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              ref={emailInputRef}
              value={email}
            />
            <Pressable
              style={{
                width: "100%",
                height: 50,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
              onPress={() => {
                setOpenCountries(true);
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {activeLanguage?.country}:
              </Text>
              <Text
                style={{
                  color: theme.active,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {countries?.find((c: any) => c.code === country)?.name}
              </Text>
            </Pressable>

            <Input
              placeholder={`${activeLanguage.password}*`}
              onChangeText={(text: string) => setPassword(text)}
              type="password"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              ref={passwordInputRef}
              value={password}
            />
            <Input
              placeholder={`${activeLanguage.confirmPassword}*`}
              onChangeText={(text: string) => setConfirmPassword(text)}
              type="password"
              ref={confirmPasswordInputRef}
              value={confirmPassword}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                transform: [{ scale: 0.8 }],
                gap: 24,
              }}
            >
              <CheckboxWithLabel
                isChecked={terms}
                setIsChecked={setTerms}
                label={activeLanguage?.terms}
                pressable="Terms & Rules"
                navigation={navigation}
                from="register"
              />
              <CheckboxWithLabel
                isChecked={privacy}
                setIsChecked={setPrivacy}
                label={activeLanguage?.privacy}
                pressable="Privacy"
                navigation={navigation}
                from="register"
              />
            </View>

            <View style={{ gap: 4, alignItems: "center" }}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  marginTop: 8,
                }}
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.navigate("Login");
                }}
              >
                <Text
                  style={{
                    color: theme.active,
                    fontWeight: 600,
                    fontSize: 16,
                    marginTop: 4,
                  }}
                >
                  {activeLanguage.login}
                </Text>
              </TouchableOpacity>
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
              title={activeLanguage.register}
              loading={loading}
              onPressFunction={SendEmail}
              disabled={
                email?.length < 1 ||
                password?.length < 1 ||
                name?.length < 1 ||
                confirmPassword?.length < 1 ||
                !terms ||
                !privacy
              }
            />
          </View>
          {openCountries && (
            <Countries
              country={country}
              setCountry={setCountry}
              setOpenCountries={setOpenCountries}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const countries = [
  { code: "GE", name: "Georgia" },
  { code: "UA", name: "Ukraine" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "AM", name: "Armenia" },
  { code: "TR", name: "Turkey" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
];

export default Register;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: (SCREEN_WIDTH / 100) * 95,
    gap: 8,
    position: "relative",
    bottom: 48,
    paddingHorizontal: 8,
  },
  inputSpacing: {
    height: 8, // Adjust the height for spacing
  },
  header: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});

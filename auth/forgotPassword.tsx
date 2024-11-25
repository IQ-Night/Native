import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/button";
import Input from "../components/input";
import { BlurView } from "expo-blur";
import { useAppContext } from "../context/app";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ForgotPasswordProps {
  onPressFunction: () => void;
  forgotPass: boolean;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onPressFunction,
  forgotPass,
}) => {
  const { apiUrl, setAlert, theme, activeLanguage, haptics } = useAppContext();

  /**
   * change password
   */
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const oldPasswordInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPassWordInputRef = useRef<TextInput>(null);

  const [changingLoading, setChangingLoading] = useState(false);

  /**
   * password change function
   *  */

  /**
   * changing state
   */
  const [changing, setChanging] = useState(false);
  const [email, setEmail] = useState("");

  /**
   * send email to reset password
   * after send request, user gettings temporary password to and possible to change it
   */

  const [sendingLoading, setSendingLoading] = useState(false);

  async function SendEmail() {
    if (email?.length < 5 || !email?.includes("@")) {
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage.wrongEmail,
      });
    }
    try {
      setSendingLoading(true);

      const response = await axios.post(`${apiUrl}/api/v1/forgotPassword`, {
        email: email,
      });
      const userId = response.data.userId;
      setUserId(userId);
      setChanging(true);
      setSendingLoading(false);
    } catch (error: any) {
      setAlert({
        active: true,
        type: "error",
        text: error.response.data.message,
      });
      setSendingLoading(false);
    }
  }
  // user id
  const [userId, setUserId] = useState(null);
  const Changing = async () => {
    if (
      oldPassword?.length < 8 ||
      newPassword?.length < 8 ||
      confirmPassword?.length < 8
    ) {
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage.passwordLength,
      });
    }
    if (newPassword !== confirmPassword) {
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage.samePasswordError,
      });
    }
    try {
      Keyboard.dismiss();
      setChangingLoading(true);
      await axios.patch(`${apiUrl}/api/v1/changePassword/` + userId, {
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingLoading(false);
      setUserId(null);
      onPressFunction();
      setAlert({
        active: true,
        type: "success",
        text: activeLanguage.successfullyChanged,
      });
    } catch (error) {
      if (
        oldPassword?.length > 0 ||
        newPassword?.length > 0 ||
        confirmPassword?.length > 0
      ) {
        return setAlert({
          active: true,
          type: "error",
          text: error,
        });
      }
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingLoading(false);
      setUserId(null);
    }
  };

  const animation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (forgotPass) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [forgotPass]);

  const close = () => {
    Animated.timing(animation, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => onPressFunction());
  };

  return (
    <Modal transparent visible={forgotPass} onRequestClose={close}>
      <BlurView intensity={120} tint="dark" style={styles.centeredView}>
        <Animated.View style={[styles.container]}>
          <Animated.View
            style={{
              transform: [{ translateY: animation }],
              flex: 1,
              width: SCREEN_WIDTH,
            }}
          >
            <Pressable
              onPress={() => Keyboard.dismiss()}
              style={styles.container}
            >
              <View
                style={{
                  width: "100%",
                  height: 60,
                  padding: 10,
                  zIndex: 2,
                  alignItems: "flex-end",
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ padding: 5 }}
                  onPress={() => {
                    if (changing) {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      setChanging(false);
                    } else {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }
                      close();
                    }
                  }}
                >
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={34}
                    color={theme.active}
                  />
                </TouchableOpacity>
              </View>
              {changing ? (
                <View
                  style={{
                    marginTop: 100,
                    flex: 1,
                    alignItems: "center",
                    gap: 16,
                    width: (SCREEN_WIDTH / 100) * 95,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 24,
                      fontWeight: "500",
                    }}
                  >
                    {activeLanguage.changePassword}
                  </Text>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 16,
                      fontWeight: "500",
                      textAlign: "center",
                      lineHeight: 28,
                    }}
                  >
                    {activeLanguage.resetPasswordSent}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Input
                      ref={oldPasswordInputRef}
                      placeholder={activeLanguage.oldPassword}
                      onChangeText={(text: string) => setOldPassword(text)}
                      type="password"
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        newPasswordInputRef.current?.focus()
                      }
                      value={oldPassword}
                    />
                    <Input
                      ref={newPasswordInputRef}
                      placeholder={activeLanguage.newPassword}
                      onChangeText={(text: string) => setNewPassword(text)}
                      type="password"
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        confirmPassWordInputRef.current?.focus()
                      }
                      value={newPassword}
                    />
                    <Input
                      ref={confirmPassWordInputRef}
                      placeholder={activeLanguage.email}
                      onChangeText={(text: string) => setConfirmPassword(text)}
                      type="password"
                      returnKeyType="go"
                      onSubmitEditing={Changing}
                      value={confirmPassword}
                    />
                    <Button
                      style={{
                        width: (SCREEN_WIDTH / 100) * 95,
                        color: "white",
                        backgroundColor: theme.active,
                      }}
                      icon=""
                      title={activeLanguage.changePassword}
                      loading={changingLoading}
                      onPressFunction={Changing}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    gap: 8,
                    paddingTop: SCREEN_HEIGHT / 4,
                    width: (SCREEN_WIDTH / 100) * 95,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 20,
                      fontWeight: "500",
                      textAlign: "center",
                      marginBottom: 15,
                    }}
                  >
                    {activeLanguage.writeEmail}
                  </Text>
                  <Input
                    ref={newPasswordInputRef}
                    placeholder={activeLanguage.email}
                    onChangeText={(text: string) => setEmail(text)}
                    type="text"
                    returnKeyType="go"
                    onSubmitEditing={() => SendEmail()}
                    value={email}
                  />
                  <Button
                    style={{
                      width: (SCREEN_WIDTH / 100) * 95,
                      color: "white",
                      backgroundColor: theme.active,
                    }}
                    icon=""
                    title={activeLanguage.send}
                    loading={sendingLoading}
                    onPressFunction={SendEmail}
                  />
                </View>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 80,
    alignItems: "center",
    position: "absolute",
    left: 0,
    zIndex: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  inputContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    width: (SCREEN_WIDTH / 100) * 95,
  },
});

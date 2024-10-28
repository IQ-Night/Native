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
  Vibration,
  View,
} from "react-native";
import { useAppContext } from "../../../context/app";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuthContext } from "../../../context/auth";
import Button from "../../../components/button";
import { LinearGradient } from "expo-linear-gradient";
import Input from "../../../components/input";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ChangePassword = () => {
  /**
   * App context
   */
  const { apiUrl, setAlert, activeLanguage, theme } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
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
      await axios.patch(`${apiUrl}/api/v1/changePassword/` + currentUser?._id, {
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingLoading(false);
      setAlert({
        active: true,
        type: "success",
        text: activeLanguage.successfullyChanged,
      });
    } catch (error: any) {
      if (
        oldPassword?.length > 0 ||
        newPassword?.length > 0 ||
        confirmPassword?.length > 0
      ) {
        setAlert({
          active: true,
          type: "error",
          text: error.response.data.message,
        });
      }
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <Pressable onPress={() => Keyboard.dismiss()} style={styles.container}>
        <View
          style={{
            marginTop: SCREEN_HEIGHT * 0.15,
            flex: 1,
            alignItems: "center",
            gap: 30,
          }}
        >
          <Text
            style={{
              color: theme.primaryText,
              fontSize: 20,
              fontWeight: "500",
            }}
          >
            {activeLanguage.changePassword}
          </Text>
          <View style={styles.inputContainer}>
            <Input
              ref={oldPasswordInputRef}
              placeholder={activeLanguage.oldPassword}
              onChangeText={(text: string) => setOldPassword(text)}
              type="password"
              returnKeyType="next"
              onSubmitEditing={() => newPasswordInputRef.current?.focus()}
              value={oldPassword}
            />
            <Input
              ref={newPasswordInputRef}
              placeholder={activeLanguage.newPassword}
              onChangeText={(text: string) => setNewPassword(text)}
              type="password"
              returnKeyType="next"
              onSubmitEditing={() => confirmPassWordInputRef.current?.focus()}
              value={newPassword}
            />
            <Input
              ref={confirmPassWordInputRef}
              placeholder={activeLanguage.confirmPassword}
              onChangeText={(text: string) => setConfirmPassword(text)}
              type="password"
              returnKeyType="go"
              onSubmitEditing={Changing}
              value={confirmPassword}
            />
            <Button
              style={{
                width: "100%",
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
      </Pressable>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: SCREEN_HEIGHT - 80,
    zIndex: 1,
  },
  inputContainer: {
    alignItems: "center",
    gap: 8,
    width: "94%",
  },
});

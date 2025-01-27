import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../components/button";
import Input from "../components/input";
import { useAppContext } from "../context/app";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * authentication email Verification code input popup
 */

const InputPopup = ({
  open,
  setOpen,
  code,
  codeInput,
  registerMessages,
  loading,
  setCode,
  setLoading,
  setFunction,
}: any) => {
  /**
   * App context
   */
  const { theme, activeLanguage, haptics } = useAppContext();

  const [alert, setAlert] = useState<any>(null);

  const handleSend = () => {
    if (code !== codeInput) {
      setAlert(true);
    } else {
      setLoading(true);
      setFunction();
      Keyboard.dismiss();
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setOpen(false);
    setCode("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent visible={open}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <BlurView intensity={100} tint="dark" style={styles.centeredView}>
            <View
              style={[styles.modalView, { backgroundColor: theme.background2 }]}
            >
              {registerMessages && (
                <Text
                  style={[
                    styles.modalText,
                    {
                      fontSize: 16,
                      color: theme.text,
                      fontWeight: "bold",
                      letterSpacing: 0.1,
                    },
                  ]}
                >
                  {activeLanguage.codeSent}
                </Text>
              )}

              <Input
                type="numeric"
                value={codeInput}
                onChangeText={(text) => setCode(text)}
                placeholder={activeLanguage.code}
                returnKeyType="go"
                onSubmitEditing={() => {
                  handleSend();
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                }}
              />
              {alert && (
                <Text
                  style={{ marginVertical: 12, color: "red", fontWeight: 600 }}
                >
                  {activeLanguage?.wrongVerificationCode}
                </Text>
              )}
              <View style={styles.buttonsContainer}>
                <Button
                  style={{
                    width: (SCREEN_WIDTH / 100) * 44,
                    color: theme.text,
                    backgroundColor: "#888",
                  }}
                  icon=""
                  title={activeLanguage.cancel}
                  loading={false}
                  onPressFunction={handleCancel}
                />
                <Button
                  style={{
                    width: (SCREEN_WIDTH / 100) * 44,
                    color: "white",
                    backgroundColor: theme.active,
                  }}
                  icon=""
                  title={activeLanguage.verify}
                  loading={loading}
                  onPressFunction={handleSend}
                />
              </View>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    width: "96%",
    // marginTop: 100,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
  },
  input: {
    borderRadius: 50,
    padding: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3, // negative value places shadow on top
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
    gap: 8,
  },
  button: {
    borderRadius: 50,
    padding: 10,
    width: "45%",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default InputPopup;

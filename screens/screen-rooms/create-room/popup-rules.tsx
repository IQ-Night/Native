import React, { useState } from "react";
import {
  Dimensions,
  TextInput,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import Button from "../../../components/button";
import { useAppContext } from "../../../context/app";
import Input from "../../../components/input";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const Rules = ({ roomState, setRoomState, setOpenPopup }: any) => {
  const { theme, haptics } = useAppContext();

  // rules input
  const [rulesInput, setRulesInput] = useState("");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        gap: 8,
      }}
    >
      <Text style={[styles.label, { color: theme.text }]}>Rules:</Text>
      {roomState.rules?.length > 0 && (
        <View style={{ gap: 4, marginBottom: 16 }}>
          {roomState.rules.map((item: any, index: number) => {
            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  gap: 8,
                  borderBottomWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}
                >
                  {index + 1}.
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: 600,
                    maxWidth: "85%",
                  }}
                >
                  {item}
                </Text>
                <FontAwesome
                  onPress={() => {
                    setRoomState((prev: any) => ({
                      ...prev,
                      rules: prev.rules.filter((i: any) => i !== item),
                    }));
                    if (haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                    }
                  }}
                  color={theme.active}
                  size={24}
                  name="close"
                  style={{ marginLeft: "auto" }}
                />
              </View>
            );
          })}
        </View>
      )}
      <Text style={[styles.label, { color: theme.text }]}>
        N{roomState.rules?.length + 1}
      </Text>
      <Input
        placeholder="Enter rules here..."
        value={rulesInput}
        onChangeText={(text: string) => setRulesInput(text)}
        // style={{ backgroundColor: theme.background, color: theme.text, width: "100%" }}
        maxLength={250}
        returnKeyType="done"
        onSubmitEditing={() => {
          setRoomState((prev: any) => ({
            ...prev,
            rules: [...prev.rules, rulesInput],
          }));
          setRulesInput("");
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        }}
      />
      <Button
        title="Add"
        style={{
          backgroundColor: theme.active,
          color: "white",
          width: "100%",
        }}
        onPressFunction={
          rulesInput?.length > 0
            ? () => {
                setRoomState((prev: any) => ({
                  ...prev,
                  rules: [...prev.rules, rulesInput],
                }));
                setRulesInput("");
              }
            : () => undefined
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    textAlignVertical: "top",
    fontSize: 14,
    height: 100,
  },
});

export default Rules;

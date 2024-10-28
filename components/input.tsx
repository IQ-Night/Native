import React, { forwardRef, useState } from "react";
import { TextInput, View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppContext } from "../context/app";

interface InputProps {
  placeholder: string;
  onChangeText: (text: string) => void;
  type?: "text" | "password" | "email" | "numeric";
  returnKeyType?:
    | "done"
    | "go"
    | "next"
    | "search"
    | "send"
    | "none"
    | "previous"
    | "default";
  onSubmitEditing?: () => void;
  value: string;
  maxLength?: number;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      placeholder,
      onChangeText,
      type,
      returnKeyType,
      onSubmitEditing,
      value,
      maxLength,
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };
    const { theme } = useAppContext();
    return (
      <View style={[styles.inputContainer, { backgroundColor: "#fff" }]}>
        <TextInput
          ref={ref}
          placeholder={placeholder}
          onChangeText={onChangeText}
          placeholderTextColor={theme.text}
          secureTextEntry={type === "password" && !isPasswordVisible}
          style={[styles.input, { backgroundColor: "#fff" }]}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          value={value}
          maxLength={maxLength}
          keyboardType={
            type === "email"
              ? "email-address"
              : type === "numeric"
              ? "numeric"
              : "default"
          }
        />
        {type === "password" && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={togglePasswordVisibility}
            style={styles.icon}
          >
            <FontAwesome5
              name={!isPasswordVisible ? "eye-slash" : "eye"}
              size={16}
              color={theme.secondaryText}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 10,
    paddingRight: 10,
    shadowColor: "black",
    shadowOffset: { width: 0.5, height: 0.5 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  input: {
    flex: 1,
    width: "100%",
    height: "100%",
    padding: 15,
    borderRadius: 10,
  },
  icon: {
    marginLeft: 10,
  },
});

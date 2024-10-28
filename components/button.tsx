import * as Haptics from "expo-haptics";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button as PaperButton } from "react-native-paper";
import { useAppContext } from "../context/app";

// Define an interface for the component's props
interface ButtonProps {
  style: {
    width: any;
    color: string;
    backgroundColor: string;
  };
  title?: string;
  icon?: any;
  onPressFunction: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  style,
  title,
  icon,
  onPressFunction,
  loading,
  disabled,
}) => {
  /**
   * App context
   */
  const { haptics } = useAppContext();
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.9}
      onPress={
        loading || disabled
          ? undefined
          : () => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              onPressFunction();
            }
      }
      style={{
        width: style.width,
        height: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: disabled ? "#c5c5c5" : style.backgroundColor,
        borderRadius: 10,
        shadowColor: "black",
        shadowOffset: { width: 0.5, height: 0.5 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
      }}
    >
      {loading ? (
        <ActivityIndicator size={20} color={style.color} />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon && icon}
          <Text
            style={{
              color: disabled ? "#e5e5e5" : style.color,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Checkbox } from "react-native-paper"; // Import Checkbox from React Native Paper
import { useAppContext } from "../context/app";
import * as Haptics from "expo-haptics";

const CheckboxWithLabel = ({ isChecked, setIsChecked, label }: any) => {
  const { theme, haptics } = useAppContext();

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",

          borderRadius: 50,
        }}
      >
        <Checkbox
          status={isChecked ? "checked" : "unchecked"} // Set checkbox status
          onPress={() => {
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
            setIsChecked(!isChecked);
          }} // Toggle checkbox value on press
          color={theme.active} // Use theme.active color for the checkbox when checked
          uncheckedColor={theme.text} // Use theme.text for the checkbox when unchecked
          style={isChecked ? styles.checkedCheckbox : styles.uncheckedCheckbox} // Conditional styles based on checked state
        />
      </View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 4,
  },
  // Style for the checkbox when checked
  checkedCheckbox: {
    width: 24, // Checkbox width
    height: 24, // Checkbox height
    borderRadius: 8, // Rounded corners
    backgroundColor: "black", // Black background for checked state
    borderWidth: 2, // Border width
    borderColor: "white", // White border for checked state
    alignItems: "center",
    justifyContent: "center", // Center checkmark inside
  },
  // Style for the checkbox when unchecked
  uncheckedCheckbox: {
    width: 24, // Checkbox width
    height: 24, // Checkbox height
    borderRadius: 8, // Rounded corners
    backgroundColor: "transparent", // Transparent background for unchecked state
    borderWidth: 2, // Border width
    borderColor: "gray", // Gray border for unchecked state
    alignItems: "center",
    justifyContent: "center", // Center any icon inside
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 600,
  },
});

export default CheckboxWithLabel;

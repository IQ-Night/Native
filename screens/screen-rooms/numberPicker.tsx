import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app"; // Assuming you have a theme context
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const NumberPicker = ({
  title,
  min,
  max,
  step,
  selectedValue,
  setValue,
  setNumericPopup,
}: any) => {
  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

  // Generate an array of numbers between min and max, inclusive, using the step value
  const generateNumberOptions = (min: any, max: any, step: any) => {
    const options = [];
    for (let i = min; i <= max; i += step) {
      options.push(i);
    }
    return options;
  };

  const numberOptions = generateNumberOptions(min, max, step);

  // new value
  const [newValue, setNewValue] = useState(selectedValue);

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        height: SCREEN_HEIGHT - 60,
        width: "100%",
        position: "absolute",
        zIndex: 90,
        top: 0,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 24,
      }}
    >
      <FontAwesome
        onPress={() => {
          setNumericPopup({
            title: "",
            min: 0,
            max: 0,
            step: 0,
            active: false,
            selectedValue: 0,
            setValue: undefined,
          });
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        }}
        name="close"
        size={32}
        color={theme.active}
        style={{ position: "absolute", top: 48, right: 16, zIndex: 30 }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {title === "Price" && (
          <FontAwesome5 name="coins" size={20} color="orange" />
        )}
        <Text
          style={{
            color: theme.text,
            fontSize: 24,
            fontWeight: 500,
          }}
        >
          {title}
        </Text>
      </View>
      <Picker
        selectedValue={newValue}
        onValueChange={(itemValue) => setNewValue(itemValue)}
        style={styles.picker}
      >
        {numberOptions.map((number) => (
          <Picker.Item
            key={number}
            label={String(number)}
            value={number}
            color={theme.text}
          />
        ))}
      </Picker>
      <Button
        title="Select"
        style={{ width: "100%", backgroundColor: theme.active, color: "white" }}
        onPressFunction={() => setValue(newValue)}
      />
    </BlurView>
  );
};

const styles = StyleSheet.create({
  picker: {
    height: 200,
    zIndex: 50,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
  },
});

export default NumberPicker;

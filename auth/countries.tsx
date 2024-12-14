import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Picker } from "@react-native-picker/picker";
import { BlurView } from "expo-blur";
import Button from "../components/button";
import { useAppContext } from "../context/app";

const Countries = ({ country, setCountry, setOpenCountries }: any) => {
  const { activeLanguage, theme } = useAppContext();
  return (
    <BlurView intensity={120} tint="dark" style={styles.pickerContainer}>
      <Pressable
        onPress={() => setOpenCountries(false)}
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          bottom: 48,
          gap: 24,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 10,
          }}
        >
          <Picker
            selectedValue={country}
            onValueChange={(value) => setCountry(value)}
          >
            {countries.map((item) => (
              <Picker.Item
                key={item.code}
                label={item.name}
                value={item.code}
                color={theme.text}
              />
            ))}
          </Picker>
        </Pressable>
        <Button
          title={activeLanguage?.confirm}
          style={{
            width: "100%",
            backgroundColor: theme.active,
            color: "white",
          }}
          onPressFunction={() => {
            setOpenCountries(false);
          }}
        />
      </Pressable>
    </BlurView>
  );
};

export default Countries;

const styles = StyleSheet.create({
  pickerContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    zIndex: 60,
    borderRadius: 8,
    padding: 8,
  },
});

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

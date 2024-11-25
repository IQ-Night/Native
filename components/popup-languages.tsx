import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const ChoiceLanguage = ({ state, setState, setOpenPopup }: any) => {
  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  // countries
  const countries = [
    { code: "GE", name: "ქართული" },
    { code: "GB", name: "English" },
    { code: "RU", name: "Русский" },
  ];

  return (
    <View
      style={{
        borderRadius: 10,
        width: "100%",
        height: "100%",
        gap: 10,
      }}
    >
      <FlatList
        data={countries}
        keyExtractor={(item) => item.code}
        style={{ width: "100%" }}
        bounces={Platform.OS === "ios" ? false : undefined}
        overScrollMode={Platform.OS === "ios" ? "never" : "always"}
        renderItem={({ item }) => (
          <View style={{ width: "100%", alignItems: "center" }}>
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                setState(item.code);
                setOpenPopup("");
              }}
              style={styles.countryContainer}
            >
              <CountryFlag isoCode={item.code} size={16} />
              <Text
                style={[
                  styles.countryName,
                  {
                    color: state === item.code ? "orange" : theme.text,
                  },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
};

export default ChoiceLanguage;

const styles = StyleSheet.create({
  countryContainer: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 24,
  },
  countryName: {
    width: "100%",
    fontSize: 14,
    marginLeft: 15,
    fontWeight: 600,
  },
});

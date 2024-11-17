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
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useProfileContext } from "../../context/profile";
import * as Haptics from "expo-haptics";
import { ActivityIndicator } from "react-native-paper";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const EditCountry = () => {
  /**
   * App context
   */
  const { theme, activeLanguage, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Profile context
   */
  const { UpdateUser, updateLoading } = useProfileContext();

  /**
   * Edit field
   */
  const [input, setInput] = useState(currentUser.name);

  // countries
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
  return (
    <BlurView
      intensity={0}
      tint="dark"
      style={{
        borderRadius: 10,
        width: "100%",
        height: "100%",
        gap: 10,
      }}
    >
      {updateLoading && (
        <ActivityIndicator
          size="small"
          color="orange"
          style={{ marginVertical: 8 }}
        />
      )}

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
                UpdateUser({ country: item.code });
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
              style={styles.countryContainer}
            >
              <CountryFlag isoCode={item.code} size={16} />
              <Text
                style={[
                  styles.countryName,
                  {
                    color:
                      currentUser?.country === item.code
                        ? "orange"
                        : theme.text,
                  },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </BlurView>
  );
};

export default EditCountry;

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
    fontWeight: 600,
    marginLeft: 15,
  },
});

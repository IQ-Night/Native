import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Dimensions,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Button from "../components/button";
import Input from "../components/input";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import Countries from "./countries";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface PropsType {}

const AddationalFields: React.FC<PropsType> = ({ route, navigation }: any) => {
  /**
   * App context
   */

  const { apiUrl, setAlert, activeLanguage, theme, haptics, setLoading } =
    useAppContext();

  /**
   * Auth context
   */
  const {
    setActiveRoute,
    activeRoute,
    addationalFields,
    setAddationalFields,
    setCurrentUser,
  } = useAuthContext();

  /**
   * Register fields
   */
  const [name, setName] = useState("");
  const [country, setCountry] = useState("GE");

  /**
   * Add fields
   */

  const [addingLoading, setAddingLoading] = useState(false);

  const AddFields = async () => {
    if (name?.length < 1) {
      Keyboard.dismiss();
      return setAlert({
        active: true,
        type: "error",
        text: activeLanguage.inputFields,
      });
    }
    setAddingLoading(true);
    try {
      await axios
        .patch(`${apiUrl}/api/v1/users/${addationalFields?.user?._id}`, {
          name: name,
          country: country,
        })
        .then(async (data) => {
          if (data) {
            setCurrentUser({
              ...addationalFields?.user,
              name: name,
              country: country,
            });
            setTimeout(() => {
              setAddingLoading(false);
              setAddationalFields(null);
            }, 1000);
          }
        });
    } catch (err) {
      console.log("this is register error");
      setLoading(false);
      // Check if 'err' is an object and has 'response' property
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err as { response: { data: { message: string } } };

        return setAlert({
          active: true,
          type: "error",
          text: errorObj.response.data.message,
        });
      } else {
        // Handle other types of errors
        console.error("An unexpected error occurred:", err);
      }
    }
  };

  // open countries
  const [openCountries, setOpenCountries] = useState(false);
  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        zIndex: 90,
        backgroundColor: "rgba(0,0,0,0.7)",
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <View style={styles.inputSpacing} />
            <Text
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: theme.text,
                marginBottom: 24,
              }}
            >
              {activeLanguage?.addationalFields}
            </Text>
            <Input
              placeholder={`${activeLanguage.fullName}*`}
              onChangeText={(text: string) => setName(text)}
              type="text"
              returnKeyType="next"
              value={name}
            />

            <Pressable
              style={{
                width: "100%",
                height: 50,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
              onPress={() => {
                setOpenCountries(true);
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {activeLanguage?.country}:
              </Text>
              <Text
                style={{
                  color: theme.active,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {countries?.find((c: any) => c.code === country)?.name}
              </Text>
            </Pressable>
            <View
              style={{
                width: "100%",
                position: "relative",
                top: 12,
                alignItems: "center",
              }}
            >
              <Button
                style={{
                  width: (SCREEN_WIDTH / 100) * 90,
                  color: "white",
                  backgroundColor: theme.active,
                }}
                icon=""
                title={activeLanguage.register}
                loading={addingLoading}
                onPressFunction={AddFields}
              />
            </View>
            <View
              style={{
                width: "100%",
                position: "relative",
                top: 12,
                alignItems: "center",
              }}
            >
              <Button
                style={{
                  width: (SCREEN_WIDTH / 100) * 90,
                  color: "white",
                  backgroundColor: "#888",
                }}
                icon=""
                title={activeLanguage.logout}
                onPressFunction={async () => {
                  try {
                    // ამოშალე JWT ტოკენები
                    await AsyncStorage.removeItem("IQ-Night:jwtToken");
                    await AsyncStorage.removeItem("IQ-Night:jwtRefreshToken");

                    // მომხმარებლის მონაცემების განულება
                    setCurrentUser(null);
                    setAddationalFields(null);
                  } catch (error) {
                    console.error("Logout failed:", error);
                  }
                }}
              />
            </View>
          </View>

          {openCountries && (
            <Countries
              country={country}
              setCountry={setCountry}
              setOpenCountries={setOpenCountries}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </BlurView>
  );
};

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

export default AddationalFields;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: (SCREEN_WIDTH / 100) * 95,
    gap: 8,
    position: "relative",
    bottom: 48,
    paddingHorizontal: 8,
  },
  inputSpacing: {
    height: 8, // Adjust the height for spacing
  },
  header: {
    width: "100%",
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});

import {
  Linking,
  Text,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from "react-native";
import React from "react";
import { useAppContext } from "../context/app";
import Button from "./button";

/**
 * component defines update app screen if user doesnt have new version of app
 */

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export const Update = (props: any) => {
  // defines language
  const { activeLanguage, theme } = useAppContext();

  const onPressFunction = () => {
    let url;
    if (Platform.OS === "ios") {
      url = "https://apps.apple.com/ge/app/iq-night-online/id6738655481";
    } else {
      url = "https://play.google.com/store/apps/details?id=com.pirtaxx.wordex";
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.log(`Don't know how to open this URL: ${url}`);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };
  return (
    <ImageBackground
      source={require("../assets/bg.jpg")}
      style={{
        backgroundColor: theme.solidBackground,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
        top: 0,
        zIndex: 100000,
      }}
    >
      <View
        style={{
          width: "90%",
          borderRadius: 15,
          backgroundColor: theme.background2,
          marginVertical: 24,
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Text
          style={{
            color: theme.text,
            letterSpacing: 0.3,
            fontSize: 16,
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          {activeLanguage.oldVersion} ({props.currentVersion})
        </Text>
      </View>
      <Button
        style={{
          width: (SCREEN_WIDTH / 100) * 80,
          color: "white",
          backgroundColor: theme.active,
        }}
        icon=""
        title={activeLanguage.updateNow + " " + props.appVersion}
        loading={false}
        onPressFunction={() => onPressFunction()}
      />
    </ImageBackground>
  );
};

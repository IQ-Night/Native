import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { useAppContext } from "../../context/app";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../components/button";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import CountryFlag from "react-native-country-flag";
import ChoiceLanguage from "../../components/popup-languages";
import { BlurView } from "expo-blur";
import { useNotificationsContext } from "../../context/notifications";
import { Badge } from "react-native-elements";

const Landing = ({ navigation }: any) => {
  /**
   * App context
   */
  const {
    theme,
    bgSound,
    haptics,
    setBgSound,
    language,
    setLanguage,
    activeLanguage,
  } = useAppContext();
  const { noAuthTickets } = useNotificationsContext();

  const [openLanguages, setOpenLanguages] = useState(false);

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={{ flex: 1, width: "100%" }}
    >
      <LinearGradient
        colors={["rgba(0,0,0,1)", "rgba(0,0,0,0.2)"]}
        style={styles.container}
      >
        <View
          style={{
            position: "absolute",
            top: 72,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Pressable
            onPress={async () => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              if (bgSound) {
                setBgSound(false);
                await AsyncStorage.setItem("IQ-Night:bgSound", "UnActive");
              } else {
                setBgSound(true);
                await AsyncStorage.setItem("IQ-Night:bgSound", "Active");
              }
            }}
          >
            {bgSound ? (
              <MaterialIcons name="stop-circle" size={28} color={theme.text} />
            ) : (
              <MaterialIcons name="play-circle" size={28} color={theme.text} />
            )}
          </Pressable>
          <Pressable
            style={{ borderRadius: 2, overflow: "hidden" }}
            onPress={() => {
              setOpenLanguages(true);
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
            }}
          >
            <CountryFlag
              isoCode={language || "GB"}
              size={16}
              style={{
                color: theme.text,
              }}
            />
          </Pressable>
        </View>
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            width: "96%",
            position: "absolute",
            top: "16%",
            alignItems: "center",
            gap: 16,
            paddingVertical: 24,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            IQ Night
          </Text>
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            'Mafia night' online game
          </Text>
        </BlurView>

        <View
          style={{
            width: "100%",
            height: "25%",
            position: "absolute",
            bottom: 90,
            alignItems: "center",
            gap: 24,
          }}
        >
          <View
            style={{
              width: "96%",
              borderRadius: 10,
              overflow: "hidden",
              alignItems: "center",
            }}
          >
            <BlurView
              intensity={20}
              tint="dark"
              style={{
                width: "100%",
                padding: 16,
                position: "relative",
                gap: 8,
              }}
            >
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.navigate("About");
                }}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  paddingLeft: 14,
                  borderRadius: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
                >
                  {activeLanguage?.about}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={32}
                  color={theme.active}
                  style={{ transform: [{ rotate: "-90deg" }] }}
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.navigate("Help");
                }}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  paddingLeft: 14,
                  borderRadius: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text
                    style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
                  >
                    {activeLanguage?.support}
                  </Text>
                  {noAuthTickets?.length > 0 && (
                    <Badge
                      value={noAuthTickets?.length}
                      status="success"
                      badgeStyle={{ backgroundColor: theme.active }}
                    />
                  )}
                </View>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={32}
                  color={theme.active}
                  style={{ transform: [{ rotate: "-90deg" }] }}
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.navigate("Terms & Rules");
                }}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  paddingLeft: 14,
                  borderRadius: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
                >
                  {activeLanguage?.rules}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={32}
                  color={theme.active}
                  style={{ transform: [{ rotate: "-90deg" }] }}
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  navigation.navigate("Privacy");
                }}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  paddingLeft: 14,
                  borderRadius: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
                >
                  {activeLanguage?.privacy}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={32}
                  color={theme.active}
                  style={{ transform: [{ rotate: "-90deg" }] }}
                />
              </Pressable>
            </BlurView>
          </View>
          <Button
            title={activeLanguage?.login}
            style={{
              width: "95%",
              backgroundColor: theme.active,
              color: "white",
            }}
            onPressFunction={() => navigation.navigate("Login")}
          />
        </View>
      </LinearGradient>
      {openLanguages && (
        <BlurView
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            paddingVertical: 64,
          }}
          intensity={120}
          tint="dark"
        >
          <Pressable
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              setOpenLanguages(false);
            }}
          >
            <ChoiceLanguage
              state={language}
              setState={setLanguage}
              setOpenPopup={setOpenLanguages}
            />
          </Pressable>
        </BlurView>
      )}
    </ImageBackground>
  );
};

export default Landing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

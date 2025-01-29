import axios from "axios";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import CheckboxWithLabel from "../../components/checkBox";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGameContext } from "../../context/game";

const DeactivateAccount = ({ closeDeactivate, slideAnim }: any) => {
  const { activeLanguage, haptics, theme, apiUrl } = useAppContext();

  const { currentUser, setCurrentUser } = useAuthContext();

  const { socket } = useGameContext();
  /**
   * Deactivate account
   */

  // delete clan if user is founder
  const [isChecked, setIsChecked] = useState(false);

  // Utility function to check if token is expired
  const isTokenExpired = (token: any) => {
    if (!token) return true;
    const [, payload] = token.split(".");
    if (!payload) return true;

    const { exp } = JSON.parse(atob(payload));

    if (!exp) return true;

    return Date.now() >= exp * 1000;
  };

  // remove
  const [loadingDeactivate, setLoadingDeactivate] = useState(false);
  const Deactivate = async () => {
    // get tokens
    let jwtToken = await AsyncStorage.getItem("IQ-Night:jwtToken");
    let jwtRefreshToken = await AsyncStorage.getItem(
      "IQ-Night:jwtRefreshToken"
    );

    // Check if token is expired
    if (isTokenExpired(jwtToken)) {
      if (jwtRefreshToken) {
        // Try to refresh the token, after get user data from refresh function and return;
        await refreshAccessToken(jwtRefreshToken);
        return;
      } else {
        console.log("No refresh token available");
      }
    }
    if (jwtToken) {
      try {
        setLoadingDeactivate(true);
        const response = await axios.delete(
          apiUrl +
            "/api/v1/users/" +
            currentUser?._id +
            "?deleteClan=" +
            isChecked,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response?.data?.status === "success") {
          // სოკეტიდან გათიშვა და მიზეზის გადაცემა
          if (socket) {
            socket.emit("client-logout", {
              reason: "logout",
              userId: currentUser?._id,
            }); // Emit logout event with reason
          }
          // ამოშალე JWT ტოკენები
          await AsyncStorage.removeItem("IQ-Night:jwtToken");
          await AsyncStorage.removeItem("IQ-Night:jwtRefreshToken");

          // მომხმარებლის მონაცემების განულება
          setCurrentUser(null);
          setLoadingDeactivate(false);
        }
      } catch (error: any) {
        console.log(error?.response?.data?.message);
      }
    }
  };

  // Function to refresh token
  const refreshAccessToken = async (refreshToken: any) => {
    try {
      const response = await axios.post(
        apiUrl + "/api/v1/refresh-token",
        {
          refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.status === "success") {
        const newJWTToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;
        await AsyncStorage.setItem(
          "IQ-Night:jwtToken",
          JSON.stringify(newJWTToken)
        );
        await AsyncStorage.setItem(
          "IQ-Night:jwtRefreshToken",
          JSON.stringify(newRefreshToken)
        );
        setCurrentUser(response.data.user);
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.log("Error refreshing token:", error);
      throw error;
    }
  };
  return (
    <BlurView
      intensity={20}
      tint="dark"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        zIndex: 90,
      }}
    >
      <Pressable
        onPress={() => {
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
          closeDeactivate();
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Animated.View
          style={[
            styles.confirmPopup,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable style={styles.wrapper}>
            <Text style={styles.confirmText}>
              {activeLanguage?.sure_deactivate_account}
            </Text>
            <Text
              style={[
                styles.confirmText,
                { fontWeight: 500, fontSize: 12, lineHeight: 18 },
              ]}
            >
              ({activeLanguage?.after_deactivation})
            </Text>
            {currentUser?.clan?.admin?.find((a: any) => a.role === "founder")
              ?.user?.id === currentUser?._id &&
              (currentUser?.clan?.admin?.find(
                (a: any) => a.role === "director"
              ) ||
                currentUser?.clan?.admin?.find(
                  (a: any) => a.role === "manager"
                ) ||
                currentUser?.clan?.admin?.find(
                  (a: any) => a.role === "wiser"
                )) && (
                <View style={{ alignItems: "center" }}>
                  <CheckboxWithLabel
                    isChecked={isChecked}
                    setIsChecked={setIsChecked}
                    label={activeLanguage?.delete_your_clan}
                  />

                  <View>
                    <Text
                      style={[
                        styles.confirmText,
                        {
                          textAlign: "auto",
                          maxWidth: "90%",
                          color: theme.active,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {currentUser?.clan?.title}
                    </Text>
                  </View>
                </View>
              )}
            <View style={styles.confirmButtons}>
              <Button
                title={activeLanguage?.cancel}
                style={styles.cancelButton}
                onPressFunction={closeDeactivate}
              />
              <Button
                loading={loadingDeactivate}
                title={activeLanguage?.deactivation}
                style={styles.removeButton}
                onPressFunction={Deactivate}
              />
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </BlurView>
  );
};

export default DeactivateAccount;

const styles = StyleSheet.create({
  confirmPopup: {
    minHeight: 320,
    zIndex: 80,
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  wrapper: {
    width: "100%",
    minHeight: 320,
    padding: 24,
    paddingTop: 48,
    gap: 24,
    backgroundColor: "#111",
  },
  confirmText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: "auto",
    marginBottom: 100,
  },
  cancelButton: {
    width: "45%",
    backgroundColor: "#888",
    color: "white",
  },
  removeButton: {
    width: "45%",
    backgroundColor: "red",
    color: "white",
  },
});

import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { ActivityIndicator } from "react-native-paper";
import { Confirm } from "../components/confirm";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useInvoicesContext } from "../context/invoices";
import { useNotificationsContext } from "../context/notifications";
import { useProfileContext } from "../context/profile";
import About from "../screens/screen-about/main";
import Coins from "../screens/screen-coins/coins";
import Help from "../screens/screen-help/main";
import Assets from "../screens/screen-profile/assets/main";
import ChangePassword from "../screens/screen-profile/changePassword/main";
import Gift from "../screens/screen-profile/gifts/main";
import Invoices from "../screens/screen-profile/invoices/main";
import Profile from "../screens/screen-profile/main";
import Clan from "../screens/screen-profile/myClans/clan-screen";
import MyClans from "../screens/screen-profile/myClans/main";
import Notifications from "../screens/screen-profile/notifications/main";
import Referrals from "../screens/screen-profile/referrals/main";
import User from "../screens/screen-user/main";
import { Badge } from "react-native-elements";
import Vip from "../screens/screen-VIP/main";

const ProfileStackNavigator = () => {
  const ProfileStack = createStackNavigator();

  const { apiUrl, theme, haptics } = useAppContext();
  const { currentUser } = useAuthContext();
  const { setUpdateClanState, setDeleteConfirm, confirm, setConfirm } =
    useProfileContext();
  const {
    setNotifications,
    totalNotifications,
    setTotalNotifications,
    loading,
    ClearNotifications,
    clearState,
    setClearState,
  } = useNotificationsContext();

  const {
    invoices,
    setInvoices,
    totalInvoices,
    setTotalInvoices,
    ClearInvoices,
    clearInvoicesState,
    loadingClearInvoices,
    setClearInvoicesState,
  } = useInvoicesContext();

  // Clear timeout state
  const [clearTimeoutValue, setClearTimeoutValue] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Effect to handle timeout for clearing invoices
  useEffect(() => {
    let timer: NodeJS.Timeout; // Define timer variable for cleanup

    if (isTimerActive && clearTimeoutValue > 0) {
      // Set interval to decrement the clearTimeoutValue every second
      timer = setInterval(() => {
        setClearTimeoutValue((prev) => {
          if (prev <= 1) {
            setClearInvoicesState(null); // Clear invoices when timer reaches zero
            setIsTimerActive(false); // Stop the timer
            setClearState(null);
            return 0; // Ensure it doesn't go below 0
          }
          return prev - 1; // Decrement the timer value
        });
      }, 1000); // 1 second interval

      return () => clearInterval(timer); // Cleanup the interval on unmount
    }

    return () => clearTimeout(timer); // Cleanup the timer
  }, [isTimerActive, clearTimeoutValue]);

  // Function to start the timer
  const startTimer = () => {
    if (clearTimeoutValue === 0) {
      setClearTimeoutValue(5); // Reset to 5 seconds
    }
    setIsTimerActive(true); // Start the timer
  };

  return (
    <>
      <ProfileStack.Navigator
        screenOptions={{
          cardStyle: { backgroundColor: "#111" }, // Set the entire navigator background to transparent
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#111",
          },
          headerTintColor: theme.text,
        }}
      >
        <ProfileStack.Screen
          name="Profile-Stack"
          component={Profile}
          options={{
            headerShown: false,
          }}
        />
        <ProfileStack.Screen name="My Clans" component={MyClans} />
        <ProfileStack.Screen
          name="Clan"
          component={Clan}
          options={({ route, navigation }: any) => ({
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    borderRadius: 2,
                    overflow: "hidden",
                    marginRight: 8,
                  }}
                >
                  <CountryFlag
                    isoCode={route.params?.item?.language}
                    size={16}
                  />
                </View>
                <Text
                  style={{ color: theme.text, fontSize: 18, width: "65%" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {route.params?.item?.title || "Clan"}
                </Text>
              </View>
            ),
            headerRight: () => (
              <View
                style={{
                  height: 40,
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingHorizontal: 16,
                  gap: 12,
                }}
              >
                {currentUser._id ===
                  route.params.item.admin.find((a: any) => a.role === "founder")
                    .user.id && (
                  <>
                    <MaterialIcons
                      name="edit"
                      size={24}
                      color={theme.active}
                      onPress={() => {
                        setUpdateClanState("Edit Title");
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                      }}
                    />

                    <MaterialCommunityIcons
                      onPress={() => {
                        setDeleteConfirm("clan");
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                      }}
                      name="delete"
                      size={24}
                      color="red"
                    />
                  </>
                )}
              </View>
            ),
            // Add focus and blur event listeners
            listeners: {
              focus: () => {
                console.log("Clan screen is focused");
                // Run any function here when "Clan" screen becomes active
              },
              blur: () => {
                console.log("Clan screen is blurred");
                // Run any cleanup or other function when "Clan" screen loses focus
              },
            },
          })}
        />

        <ProfileStack.Screen
          name="User"
          component={User}
          options={({ route }: any) => ({
            title: route.params?.item?.name || "User",
          })}
        />
        <ProfileStack.Screen
          name="Notifications"
          component={Notifications}
          options={({ route }) => ({
            headerRight: () => (
              <Pressable
                onPress={() => {
                  if (totalNotifications > 0) {
                    if (clearState === "confirm") {
                      ClearNotifications();
                      setClearTimeoutValue(0); // Reset timeout
                    } else {
                      setClearState("confirm");
                      startTimer();
                    }
                  }
                }}
                style={{
                  marginRight: 16,
                  padding: 4,
                  borderRadius: 8,
                  backgroundColor:
                    clearState === "confirm"
                      ? theme.active
                      : "rgba(255,255,255,0.1)",
                  paddingHorizontal: 12,
                  width: 96,
                  height: 26,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator size={14} color="white" />
                ) : (
                  <Text
                    style={{
                      color:
                        totalNotifications > 0 && !clearState
                          ? theme.active
                          : totalNotifications > 0 && clearState === "confirm"
                          ? "white"
                          : "#888",
                      fontWeight: "500",
                      fontSize: 12,
                    }}
                  >
                    {clearState === "confirm"
                      ? `Confirm (${clearTimeoutValue}s)`
                      : "Clear all"}
                  </Text>
                )}
              </Pressable>
            ),
          })}
        />
        <ProfileStack.Screen name="Assets" component={Assets} />
        <ProfileStack.Screen name="Gifts" component={Gift} />
        <ProfileStack.Screen name="Coins" component={Coins} />
        <ProfileStack.Screen name="Vip" component={Vip} />
        <ProfileStack.Screen name="About" component={About} />
        <ProfileStack.Screen name="Help" component={Help} />
        <ProfileStack.Screen
          name="Invoices"
          component={Invoices}
          options={({ route }) => ({
            headerRight: () => (
              <Pressable
                onPress={() => {
                  if (totalInvoices > 0) {
                    if (clearInvoicesState === "confirm") {
                      ClearInvoices();
                      setClearTimeoutValue(0); // Reset timeout
                    } else {
                      setClearInvoicesState("confirm");
                      startTimer();
                    }
                  }
                }}
                style={{
                  marginRight: 16,
                  padding: 4,
                  borderRadius: 8,
                  backgroundColor:
                    clearInvoicesState === "confirm"
                      ? theme.active
                      : "rgba(255,255,255,0.1)",
                  paddingHorizontal: 8,
                  width: 96,
                  height: 26,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {loadingClearInvoices ? (
                  <ActivityIndicator size={12} color="white" />
                ) : (
                  <Text
                    style={{
                      color:
                        totalInvoices > 0 && !clearInvoicesState
                          ? theme.active
                          : totalInvoices > 0 &&
                            clearInvoicesState === "confirm"
                          ? "white"
                          : "#888",
                      fontWeight: "500",
                      fontSize: 12,
                    }}
                  >
                    {clearInvoicesState === "confirm"
                      ? `Confirm (${clearTimeoutValue}s)`
                      : "Clear all"}
                  </Text>
                )}
              </Pressable>
            ),
          })}
        />
        <ProfileStack.Screen
          name="Change Password"
          component={ChangePassword}
        />
        <ProfileStack.Screen name="Referrals" component={Referrals} />
      </ProfileStack.Navigator>
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default ProfileStackNavigator;

import {
  Entypo,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DefaultTheme,
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Badge } from "react-native-elements";
import Img from "../components/image";
import { useAdminContext } from "../context/admin";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { ClansContextWrapper } from "../context/clans";
import { useContentContext } from "../context/content";
import { useGameContext } from "../context/game";
import { InvoicesContextWrapper } from "../context/invoices";
import { LiderboardContextWrapper } from "../context/liderboard";
import { useNotificationsContext } from "../context/notifications";
import { ProfileContextWrapper } from "../context/profile";
import { RoomsContextWrapper } from "../context/rooms";
import { StoreContextWrapper } from "../context/store";
import Game from "../GAME/main";
import AdminStackNavigator from "./adminStack";
import AuthStackNavigator from "./authStack";
import ClansStackNavigator from "./clanStack";
import LiderboardStackNavigator from "./liderboardStack";
import ProfileStackNavigator from "./profileStack";
import RoomssStackNavigator from "./roomStack";
import StoreStackNavigator from "./storeStack";
import { VideoConnectionContextWrapper } from "../context/videoConnection";

const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#111",
    card: "#111",
    text: "#fff",
    border: "#111",
    notification: "#ff6347",
    primary: "#fff",
  },
};

const ScreenManager = () => {
  // navigation ref
  const navigationRef = useNavigationContainerRef();

  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

  /**
   * Game context
   */
  const { activeRoom } = useGameContext();

  /**
   * Auth context
   */

  const { currentUser, GetUser } = useAuthContext();
  /**
   * Notifications context
   */

  const { setRerenderNotifications } = useNotificationsContext();
  /**
   * Admin context
   */

  const { reportsNotifications, ticketsNotifications, GetAdminNotifications } =
    useAdminContext();

  const totalAdminNotifications =
    reportsNotifications?.length + ticketsNotifications?.length;

  const {
    setRerenderRooms,
    setRerenderClans,
    setRerenderProducts,
    setRerenderLiderBoard,
    setRerenderProfile,
    scrollToTop,
    scrollYRooms,
    scrollYClans,
    scrollYStore,
    scrollYLiderBoard,
    scrollYProfile,
  } = useContentContext();

  /**
   * Notifications context
   */
  const { totalBadge, clansNotifications } = useNotificationsContext();

  const handleTabPress = (tab: any, focused: any, route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) || route.name;

    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    if (focused && tab.includes("Rooms")) {
      if (routeName !== "Rooms List" && routeName !== "Rooms") {
        return;
      }
      if (scrollYRooms?.current > 0) {
        scrollToTop("Rooms");
      } else {
        setRerenderRooms(true);
      }
      scrollToTop("Rooms");
    } else if (focused && tab.includes("Clans")) {
      if (routeName !== "Clans" && routeName !== "Clans List") {
        return;
      }
      if (scrollYClans?.current > 0) {
        scrollToTop("Clans");
      } else {
        setRerenderClans(true);
        setRerenderNotifications(true);
      }
    } else if (focused && tab.includes("Store")) {
      if (scrollYStore?.current > 0) {
        scrollToTop("Store");
      } else {
        setRerenderProducts(true);
      }
    } else if (focused && tab.includes("Liderboard")) {
      if (scrollYLiderBoard?.current > 0) {
        scrollToTop("Liderboard");
      } else {
        setRerenderLiderBoard(true);
      }
    } else if (focused && tab.includes("Profile")) {
      if (routeName !== "Profile" && routeName !== "Profile-Stack") {
        return;
      }
      if (scrollYProfile?.current > 0) {
        scrollToTop("Profile");
      } else {
        GetUser();
        setRerenderProfile(true);
      }
    } else if (focused && tab.includes("Admin")) {
      if (routeName !== "Admin" && routeName !== "Admin-Stack") {
        return;
      }
      GetAdminNotifications();
    }
  };

  /**
   * Auth state if current user is null
   */
  if (!currentUser) {
    return (
      <NavigationContainer>
        <AuthStackNavigator />
      </NavigationContainer>
    );
  }

  if (activeRoom) {
    return (
      <NavigationContainer>
        <VideoConnectionContextWrapper>
          <Game />
        </VideoConnectionContextWrapper>
      </NavigationContainer>
    );
  }

  // define clans notifications total
  const adminClan = clansNotifications?.find((clan: any) =>
    clan.admin.some((a: any) => a.user.id === currentUser?._id)
  );
  const adminClansNotifs =
    adminClan?.members?.filter((m: any) => m?.status === "request")?.length ||
    0;

  const userClansNotifs =
    clansNotifications?.filter((clan: any) =>
      clan.members.some(
        (a: any) => a.userId === currentUser?._id && a.status === "offer"
      )
    )?.length || 0;

  const totalClansNotifs = adminClansNotifs + userClansNotifs;

  return (
    <NavigationContainer ref={navigationRef} theme={MyTheme}>
      <Tab.Navigator
        screenOptions={({ route, navigation }) => {
          const routeName = getFocusedRouteNameFromRoute(route) || route.name;

          return {
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "transparent",
              position: "absolute",
              borderTopWidth: 0,
              elevation: 0,
              display:
                routeName?.includes("Chat") ||
                routeName === "Coins" ||
                routeName === "Vip" ||
                routeName === "User" ||
                routeName === "Clan"
                  ? "none"
                  : "flex", // Hide tab bar if the Chat screen is active
            },
            tabBarShowLabel: false,
            tabBarIcon: ({ focused }) => {
              let iconColor = focused ? theme.active : theme.text;

              switch (route.name) {
                case "Rooms":
                  return <Entypo name="grid" size={36} color={iconColor} />;
                case "Clans":
                  return (
                    <View>
                      {totalClansNotifs > 0 && (
                        <Badge
                          value={totalClansNotifs}
                          status="success"
                          badgeStyle={{ backgroundColor: theme.active }}
                          containerStyle={{
                            position: "absolute",
                            zIndex: 30,
                            top: -8,
                            right: -8,
                          }}
                        />
                      )}
                      <Text>
                        <Entypo name="flag" size={28} color={iconColor} />
                      </Text>
                    </View>
                  );
                case "Store":
                  return <Entypo name="shop" size={26} color={iconColor} />;
                case "Liderboard":
                  return (
                    <MaterialCommunityIcons
                      name="clipboard-list"
                      size={28}
                      color={iconColor}
                    />
                  );
                case "Profile":
                  if (currentUser?.cover?.length > 0) {
                    return (
                      <View>
                        {totalBadge > 0 && (
                          <Badge
                            value={totalBadge}
                            status="success"
                            badgeStyle={{ backgroundColor: theme.active }}
                            containerStyle={{
                              position: "absolute",
                              zIndex: 30,
                              top: -8,
                              right: -8,
                            }}
                          />
                        )}
                        <View
                          style={{
                            width: 27,
                            height: 27,
                            borderRadius: 50,
                            overflow: "hidden",
                            borderWidth: 1.5,
                            borderColor: iconColor,
                          }}
                        >
                          <Img uri={currentUser.cover} />
                        </View>
                      </View>
                    );
                  } else {
                    return (
                      <FontAwesome5 name="user" size={24} color={iconColor} />
                    );
                  }
                case "Admin":
                  return (
                    <View>
                      {totalAdminNotifications > 0 && (
                        <Badge
                          value={totalAdminNotifications}
                          status="success"
                          badgeStyle={{ backgroundColor: theme.active }}
                          containerStyle={{
                            position: "absolute",
                            zIndex: 30,
                            top: -8,
                            right: -8,
                          }}
                        />
                      )}
                      <MaterialIcons
                        name="admin-panel-settings"
                        size={32}
                        color={iconColor}
                      />
                    </View>
                  );
                default:
                  return null;
              }
            },
            tabBarButton: (props: any) => (
              <TouchableOpacity
                {...props}
                onPress={() => {
                  handleTabPress(
                    props.accessibilityLabel,
                    props.accessibilityState.selected,
                    route
                  );
                  props.onPress?.();
                }}
              />
            ),
            tabBarBackground: () => (
              <BlurView
                tint="dark"
                intensity={120}
                style={{ backgroundColor: "transparent", flex: 1 }}
              />
            ),
          };
        }}
      >
        <Tab.Screen name="Rooms">
          {() => (
            <RoomsContextWrapper>
              <CustomComponent
                component={RoomssStackNavigator}
                onMount={() => console.log("Rooms tab selected")}
              />
            </RoomsContextWrapper>
          )}
        </Tab.Screen>
        <Tab.Screen name="Clans">
          {({ navigation }) => (
            <ClansContextWrapper>
              <CustomComponent
                component={ClansStackNavigator}
                onMount={() => console.log("Clans tab selected")}
                naviagtion={navigation}
              />
            </ClansContextWrapper>
          )}
        </Tab.Screen>
        <Tab.Screen name="Store">
          {() => (
            <StoreContextWrapper>
              <CustomComponent
                component={StoreStackNavigator}
                onMount={() => console.log("Store tab selected")}
              />
            </StoreContextWrapper>
          )}
        </Tab.Screen>
        <Tab.Screen name="Liderboard">
          {() => (
            <LiderboardContextWrapper>
              <CustomComponent
                component={LiderboardStackNavigator}
                onMount={() => console.log("Liderboard tab selected")}
              />
            </LiderboardContextWrapper>
          )}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {() => (
            <InvoicesContextWrapper>
              <ProfileContextWrapper>
                <CustomComponent
                  component={ProfileStackNavigator}
                  onMount={() => console.log("Profile tab selected")}
                />
              </ProfileContextWrapper>
            </InvoicesContextWrapper>
          )}
        </Tab.Screen>
        {currentUser?.admin?.active && (
          <Tab.Screen name="Admin">
            {() => (
              <CustomComponent
                component={AdminStackNavigator}
                onMount={() => console.log("Admin tab selected")}
              />
            )}
          </Tab.Screen>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const CustomComponent = ({
  component: Component,
  onMount,
  navigation,
}: any) => {
  useEffect(() => {
    if (onMount) {
      onMount();
    }
  }, []);

  return <Component naviagtion={navigation} />;
};

export default ScreenManager;

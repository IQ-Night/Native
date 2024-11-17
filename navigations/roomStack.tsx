import { createStackNavigator } from "@react-navigation/stack";
import { useState } from "react";
import { Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { Confirm } from "../components/confirm";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import Chats from "../screens/screen-chat/main";
import Clan from "../screens/screen-clans/clan-screen";
import Coins from "../screens/screen-coins/coins";
import Logs from "../screens/screen-logs/main";
import Rooms from "../screens/screen-rooms/main";
import User from "../screens/screen-user/main";
import Vip from "../screens/screen-VIP/main";

const RoomssStackNavigator = () => {
  /**
   * Screen stacks
   */
  const RoomStack = createStackNavigator();
  /**
   * Auth stacks
   */
  const { currentUser } = useAuthContext();

  /**
   * App context
   */
  const { theme, haptics } = useAppContext();

  const [confirm, setConfirm] = useState<any>(null);

  return (
    <>
      <RoomStack.Navigator
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
        <RoomStack.Screen
          name="Rooms List"
          component={Rooms}
          options={{
            headerShown: false,
          }}
        />

        <RoomStack.Screen
          name="User"
          component={User}
          options={({ route }: any) => ({
            title: route.params?.item?.name || "User",
          })}
        />

        <RoomStack.Screen
          name="Logs"
          component={Logs}
          options={({ route }: any) => ({
            title: route.params?.room?.title + " Logs" || "Logs",
          })}
        />
        <RoomStack.Screen name="Coins" component={Coins} />
        <RoomStack.Screen name="Vip" component={Vip} />
        <RoomStack.Screen name="Chats" component={Chats} />
        <RoomStack.Screen
          name="Clan"
          component={Clan}
          options={({ route, navigation }: any) => ({
            headerTitle: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderRadius: 2,
                    overflow: "hidden",
                    marginRight: 8,
                  }}
                >
                  <CountryFlag
                    isoCode={route.params?.item?.language} // Assuming language code is passed in the item
                    size={16} // Adjust the size as needed
                  />
                </View>
                <Text
                  style={{ color: theme.text, fontSize: 18, maxWidth: "80%" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {route.params?.item?.title || "Clan"}
                </Text>
              </View>
            ),
          })}
        />
      </RoomStack.Navigator>
      <Confirm confirm={confirm} setConfirm={setConfirm} />
    </>
  );
};

export default RoomssStackNavigator;

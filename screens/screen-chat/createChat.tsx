import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import Search from "./searchMember";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Img from "../../components/image";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const CreateChat = ({ openState, setOpenState }: any) => {
  const { theme, haptics, apiUrl, setAlert } = useAppContext();
  const { currentUser, setCurrentUser } = useAuthContext();
  const navigation: any = useNavigation();

  // animation component
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // Start off-screen

  // Animation to slide the popup in and out
  useEffect(() => {
    if (openState) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [openState]);

  // Function to close the confirmation popup
  const closeComponent = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setOpenState(false);
    });
  };

  /**
   * Define member
   */
  const [search, setSearch] = useState("");

  /**
   * Search Animation
   */

  // Boolean to track input focus
  const [isFocused, setIsFocused] = useState(false);

  // players list
  const [loadPlayers, setLoadPlayers] = useState(false);
  const [players, setPlayers] = useState<any>(null);

  useEffect(() => {
    const GetPlayers = async () => {
      setLoadPlayers(true);
      try {
        const response = await axios.get(
          apiUrl + "/api/v1/users?search=" + search
        );
        if (response.data.status === "success") {
          setTimeout(() => {
            setPlayers(response.data.data.users);
            setLoadPlayers(false);
          }, 200);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };

    GetPlayers();
  }, [search]);

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={() => {
          if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          closeComponent();
        }}
      >
        <MaterialIcons name="arrow-drop-down" size={42} color={theme.active} />
      </Pressable>
      <Animated.View
        style={{
          position: "absolute",
          bottom: "14%",
          height: "80%",
          width: "95%",
          borderRadius: 24,
          overflow: "hidden",
          transform: [{ translateY: slideAnim }],
          backgroundColor: "rgba(255,255,255,0.05)",
          justifyContent: "space-between",
          padding: 8,
        }}
      >
        <Search
          search={search}
          setSearch={setSearch}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          slideAnim={slideAnim}
        />
        <View
          style={{
            width: "100%",
            backgroundColor: "#222",
            height: 600,
            marginTop: 8,
            borderRadius: 8,
            padding: 8,
          }}
        >
          <ScrollView>
            <View style={[styles.row, { paddingTop: 0 }]}>
              {loadPlayers && (
                <ActivityIndicator size={24} color={theme.active} />
              )}
              {!loadPlayers && players?.length < 1 && (
                <Text
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontWeight: 500,
                    fontSize: 16,
                    margin: 16,
                  }}
                >
                  No Players Found!
                </Text>
              )}
              {!loadPlayers &&
                players?.map((member: any, index: any) => {
                  if (member?._id === currentUser._id) {
                    return;
                  }

                  return (
                    <Pressable
                      onPress={() => {
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                        navigation.navigate("Chat", {
                          chat: {
                            members: [
                              { id: currentUser?._id },
                              {
                                id: member?._id,
                                name: member?.name,
                                cover: member?.cover,
                              },
                            ],
                            type: { value: "user" },
                          },
                        });
                        closeComponent();
                      }}
                      key={index}
                      style={{
                        width: "100%",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        padding: 8,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          aspectRatio: 1,
                          overflow: "hidden",
                          borderRadius: 150,
                        }}
                      >
                        <Img uri={member?.cover} />
                      </View>
                      <Text style={{ color: "white", fontWeight: 500 }}>
                        {member?.name}
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </ScrollView>
        </View>
        <Button
          onPressFunction={() => alert("create")}
          title="Create"
          style={{
            width: "100%",
            backgroundColor: theme.active,
            color: "white",
          }}
        />
      </Animated.View>
    </BlurView>
  );
};

export default CreateChat;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: 10,
    gap: 6,
    minHeight: SCREEN_HEIGHT * 0.3,
  },
});

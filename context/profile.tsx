import {
  Entypo,
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Haptics from "expo-haptics";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  Switch,
  Text,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { FormatDate } from "../functions/formatDate";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";
import { useContentContext } from "./content";
import { useNotificationsContext } from "./notifications";
import { useNavigationState, useRoute } from "@react-navigation/native";
import BgSound from "../components/backgroundMusic";

/**
 * Profile context state
 */
const Profile = createContext<any>(null);

export const useProfileContext = () => useContext(Profile);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface contextProps {
  children: ReactNode;
}

export const ProfileContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * App context
   */
  const {
    activeLanguage,
    apiUrl,
    theme,
    haptics,
    setHaptics,
    bgSound,
    setBgSound,
    language,
  } = useAppContext();

  /**
   * auth user state
   */
  const { currentUser, setCurrentUser } = useAuthContext();
  /**
   * Content context
   */
  const { rerenderProfile, setRerenderProfile } = useContentContext();
  /**
   * Notifications context
   */
  const { clansNotifications } = useNotificationsContext();

  const [loading, setLoading] = useState(true);

  /**
   * Update user data
   */
  const [updateState, setUpdateState] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const UpdateUser = async (data: any) => {
    try {
      setUpdateLoading(true);
      const response = await axios.patch(
        apiUrl +
          "/api/v1/users/" +
          currentUser?._id +
          `?editType=${data?.name ? "name" : "country"}`,
        data
      );
      if (response.data.status === "success") {
        setTimeout(() => {
          setUpdateLoading(false);
          setUpdateState("");

          if (data?.name) {
            if (currentUser?.editOptions?.totalFreeEditName > 0) {
              setCurrentUser((prev: any) => ({
                ...prev,
                name: data?.name,
                editOptions: {
                  ...prev.editOptions,
                  totalFreeEditName: prev.editOptions.totalFreeEditName - 1,
                },
              }));
            } else {
              setCurrentUser((prev: any) => ({
                ...prev,
                name: data?.name,
                coins: { ...prev.coins, total: prev.coins.total - 150 },
              }));
            }
          } else if (data?.country) {
            setCurrentUser((prev: any) => ({
              ...prev,
              country: data?.country,
            }));
          }
        }, 200);
      }
    } catch (error: any) {
      console.log(error.response.data);
      setUpdateLoading(false);
    }
  };

  // open state
  const translateYState = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (updateState !== "") {
      Animated.timing(translateYState, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [updateState]);

  const closeState = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    Animated.timing(translateYState, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // Once the animation is complete, update the state
      setUpdateState("");
    });
  };

  /**
   * Update clan state
   */
  const [updateClanState, setUpdateClanState] = useState("");

  /**
   * Get my clans
   */
  const [loadingClans, setLoadingClans] = useState(true);
  const [clans, setClans] = useState([]);

  const GetClans = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/clans/myClans/" + currentUser._id
      );
      if (response.data.status === "success") {
        setClans(response.data.data.clans);
        setLoadingClans(false);
        setRerenderProfile(false);
      }
    } catch (error: any) {
      console.log(error);
      setRerenderProfile(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (rerenderProfile || clans?.length < 1) {
        GetClans();
      }
    }
  }, [rerenderProfile, clansNotifications, loading]);

  // delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Animation for confirmation popup
  const slideAnimDelete = useRef(new Animated.Value(300)).current; // Start off-screen

  const openDeleteConfirm = (data: any) => {
    setDeleteConfirm(data);
    Animated.timing(slideAnimDelete, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeDeleteConfirm = () => {
    Animated.timing(slideAnimDelete, {
      toValue: 300, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setDeleteConfirm(false));
  };

  /**
   * Profile items
   */

  const items = [
    {
      value: "Background Music",
      label: activeLanguage?.backgroundMusic,
      icon: (
        <MaterialCommunityIcons
          name="music"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "switch",
      switch: (
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
            <MaterialIcons name="stop-circle" size={20} color={theme.text} />
          ) : (
            <MaterialIcons name="play-circle" size={20} color={theme.text} />
          )}
        </Pressable>
      ),
    },
    {
      value: "My Clans",
      label: activeLanguage?.myClans,
      icon: (
        <Entypo
          name="flag"
          size={21}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    {
      value: "Notifications",
      label: activeLanguage?.notifications,
      icon: (
        <MaterialIcons
          name="notifications"
          size={21}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    {
      value: "Assets",
      label: activeLanguage?.assets,
      icon: (
        <MaterialCommunityIcons
          name="folder-multiple-image"
          size={21}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    // {
    //   value: "Gifts",
    //   label: "Gifts",
    //   icon: (
    //     <MaterialCommunityIcons
    //       name="gift"
    //       size={21}
    //       color={theme.text}
    //       style={{ position: "relative", bottom: 1 }}
    //     />
    //   ),
    //   type: "screen",
    // },
    // {
    //   value: "Referrals",
    //   label: "Referrals",
    //   icon: (
    //     <MaterialIcons
    //       name="people"
    //       size={22}
    //       color={theme.text}
    //       style={{ position: "relative", bottom: 1 }}
    //     />
    //   ),
    //   type: "screen",
    // },
    {
      value: "Country",
      label: activeLanguage?.country,
      icon: (
        <MaterialCommunityIcons
          name="earth"
          style={{ color: theme.text, fontSize: 22 }}
        />
      ),
      type: "popup",
      popup: (
        <View style={{ width: 50, marginLeft: "auto", alignItems: "center" }}>
          <View style={{ borderRadius: 2, overflow: "hidden" }}>
            <CountryFlag
              isoCode={currentUser?.country || "GE"}
              size={14}
              style={{
                color: theme.text,
              }}
            />
          </View>
        </View>
      ),
    },
    {
      value: "Birthday",
      label: activeLanguage?.birthday,
      icon: (
        <MaterialIcons
          name="date-range"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "popup",
      popup: (
        <View
          style={{
            width: "auto",
            marginLeft: "auto",
            alignItems: "center",
            position: "absolute",
            right: 0,
            paddingHorizontal: 8,
          }}
        >
          <View
            style={{
              width: "100%",
              padding: 4,
              borderRadius: 50,
              alignItems: "center",
              paddingHorizontal: 8,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: 500 }}>
              {currentUser.birthday
                ? FormatDate(currentUser.birthday, "onlyDate")
                : "Select Birthday"}
            </Text>
          </View>
        </View>
      ),
    },
    {
      value: "Language",
      label: activeLanguage?.language,
      icon: (
        <MaterialIcons
          name="language"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "popup",
      popup: (
        <View style={{ width: 50, marginLeft: "auto", alignItems: "center" }}>
          <View style={{ borderRadius: 2, overflow: "hidden" }}>
            <CountryFlag
              isoCode={language || "GB"}
              size={14}
              style={{
                color: theme.text,
              }}
            />
          </View>
        </View>
      ),
    },
    {
      value: "Haptics",
      label: activeLanguage?.haptics,
      icon: (
        <MaterialCommunityIcons
          name="gesture-tap-button"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "switch",
      switch: (
        <View
          style={{
            width: 60,
            marginLeft: "auto",
            alignItems: "center",
            position: "absolute",
            right: 0,
          }}
        >
          {Platform.OS === "ios" ? (
            <Switch
              trackColor={{ false: theme.background2, true: theme.active }}
              value={haptics}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              onValueChange={async () => {
                if (haptics) {
                  setHaptics(false);
                  await AsyncStorage.setItem("IQ-Night:haptics", "UnActive");
                } else {
                  setHaptics(true);
                  await AsyncStorage.setItem("IQ-Night:haptics", "Active");
                }
              }}
            />
          ) : (
            <Pressable
              onPress={async () => {
                if (haptics) {
                  await AsyncStorage.setItem("IQ-Night:haptics", "UnActive");

                  setHaptics(false);
                } else {
                  await AsyncStorage.setItem("IQ-Night:haptics", "Active");

                  setHaptics(true);
                }
              }}
            >
              <Text style={{ color: theme.active }}>Haptics</Text>
            </Pressable>
          )}
        </View>
      ),
    },

    {
      value: "Invoices",
      label: activeLanguage?.invoices,
      icon: (
        <MaterialCommunityIcons
          name="file-document-multiple"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    {
      value: "Change Password",
      label: activeLanguage?.changePassword,
      icon: (
        <MaterialIcons
          name="password"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    {
      value: "About",
      label: activeLanguage?.about,
      icon: (
        <MaterialIcons
          name="info"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    {
      value: "Help",
      label: activeLanguage?.help,
      icon: (
        <MaterialIcons
          name="help"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    // {
    //   value: "Delete Account",
    //   label: "Delete Account",
    //   icon: (
    //     <MaterialIcons
    //       name="delete"
    //       size={22}
    //       color={"red"}
    //       style={{ position: "relative", bottom: 1 }}
    //     />
    //   ),
    //   type: "",
    // },
    {
      value: "Logout",
      label: activeLanguage?.logout,
      icon: (
        <MaterialIcons
          name="logout"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "",
      function: async () => {
        await AsyncStorage.removeItem("IQ-Night:jwtToken");
        await AsyncStorage.removeItem("IQ-Night:jwtRefreshToken");
        setCurrentUser(null);
      },
    },
  ];

  // confirm
  const [confirm, setConfirm] = useState<any>(null);
  // confirm
  const [confirmAction, setConfirmAction] = useState<any>(null);

  return (
    <Profile.Provider
      value={{
        UpdateUser,
        updateState,
        setUpdateState,
        updateLoading,
        translateYState,
        items,
        updateClanState,
        setUpdateClanState,
        clans,
        setClans,
        GetClans,
        loadingClans,
        deleteConfirm,
        setDeleteConfirm,
        setLoading,
        confirm,
        setConfirm,
        closeState,
        confirmAction,
        setConfirmAction,
        openDeleteConfirm,
        closeDeleteConfirm,
        slideAnimDelete,
      }}
    >
      {children}
    </Profile.Provider>
  );
};

import {
  Entypo,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";
import axios from "axios";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  Switch,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CountryFlag from "react-native-country-flag";
import { FormatDate } from "../functions/formatDate";
import { useContentContext } from "./content";
import { Badge } from "react-native-elements";
import { useNotificationsContext } from "./notifications";

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
  const { apiUrl, theme, haptics, setHaptics, language } = useAppContext();

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
        apiUrl + "/api/v1/users/" + currentUser?._id,
        data
      );
      if (response.data.status === "success") {
        setTimeout(() => {
          setCurrentUser((prev: any) => ({ ...prev, ...data }));
          setUpdateLoading(false);
          setUpdateState("");
        }, 200);
      }
    } catch (error: any) {
      console.log(error.response.data);
      setUpdateLoading(false);
    }
  };

  // open state
  const translateYState = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (updateState !== "") {
      Animated.timing(translateYState, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateYState, {
        toValue: SCREEN_HEIGHT / 4,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [updateState]);

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
    if (currentUser && !loading) {
      GetClans();
    }
  }, [currentUser, rerenderProfile, clansNotifications, loading]);

  // delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /**
   * Profile items
   */

  const items = [
    {
      value: "My Clans",
      label: "My Clans",
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
      label: "Notifications",
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
      value: "Gifts",
      label: "Gifts",
      icon: (
        <MaterialCommunityIcons
          name="gift"
          size={21}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    {
      value: "Referrals",
      label: "Referrals",
      icon: (
        <MaterialIcons
          name="people"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    {
      value: "Country",
      label: "Country",
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
      label: "Birthday",
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
      label: "Language",
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
      label: "Haptics",
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
      value: "Black List",
      label: "Black List",
      icon: (
        <MaterialIcons
          name="view-list"
          size={22}
          color={theme.text}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "screen",
    },
    {
      value: "Invoices",
      label: "Invoices",
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
      label: "Change Password",
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
      label: "About",
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
      label: "Help",
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
    {
      value: "Delete Account",
      label: "Delete Account",
      icon: (
        <MaterialIcons
          name="delete"
          size={22}
          color={"red"}
          style={{ position: "relative", bottom: 1 }}
        />
      ),
      type: "",
    },
    {
      value: "Logout",
      label: "Logout",
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
      }}
    >
      {children}
    </Profile.Provider>
  );
};

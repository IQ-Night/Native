import {
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { en, ka, ru } from "../languages/languages";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * App context state
 */

const App = createContext<any>(null);

export const useAppContext = () => useContext(App);

interface contextProps {
  children: ReactNode;
}

export const AppContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * API Url
   */
  // const apiUrl = "192.168.1.137:5000";
  const apiUrl = "http://192.168.1.6:5000";
  // const apiUrl = "https://iq-night-acb3bc094c45.herokuapp.com";

  /**
   * Loading State
   */
  const [loading, setLoading] = useState(true);

  /**
   * app theme
   */
  const [appTheme, setAppTheme] = useState("dark");
  const dark = { text: "#c7c7c7", active: "#FFA833" };
  const light = { text: "black", active: "#F7A023" };
  const [theme, setTheme] = useState(dark);

  useEffect(() => {
    if (appTheme === "dark") {
      setTheme(dark);
    } else {
      setTheme(light);
    }
  }, [appTheme]);

  /**
   * app language
   */
  const [language, setLanguage] = useState("GE");
  const [activeLanguage, setActiveLanguage] = useState(en);

  useEffect(() => {
    if (language === "GE") {
      setActiveLanguage(ka);
    } else if (language === "GB") {
      setActiveLanguage(en);
    } else {
      setActiveLanguage(ru);
    }
  }, [language]);

  useEffect(() => {
    const GetLanguages = async () => {
      const appLang = await AsyncStorage.getItem("IQ-Night:language");
      setLanguage(appLang || "GE");
    };
    GetLanguages();
  }, []);

  /**
   * haptics context
   */
  const [haptics, setHaptics] = useState(true);
  useEffect(() => {
    const GetHaptics = async () => {
      const hapticStorage = await AsyncStorage.getItem("IQ-Night:haptics");
      if (hapticStorage) {
        setHaptics(hapticStorage === "Active" ? true : false);
      }
    };
    GetHaptics();
  }, []);

  /**
   * bg sound context
   */
  const [bgSound, setBgSound] = useState(false);
  useEffect(() => {
    const GetBgSound = async () => {
      const soundStorage = await AsyncStorage.getItem("IQ-Night:bgSound");
      if (soundStorage) {
        setBgSound(soundStorage === "Active" ? true : false);
      } else {
        setBgSound(true);
      }
    };
    GetBgSound();
  }, []);

  console.log(bgSound);

  /**
   * Alert context
   */
  const [alert, setAlert] = useState({ active: false, type: "", text: "" });

  return (
    <App.Provider
      value={{
        apiUrl,
        loading,
        setLoading,
        setAppTheme,
        appTheme,
        theme,
        alert,
        setAlert,
        language,
        setLanguage,
        activeLanguage,
        haptics,
        setHaptics,
        bgSound,
        setBgSound,
      }}
    >
      {children}
    </App.Provider>
  );
};

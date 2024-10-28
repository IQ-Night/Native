import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppContext } from "./app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * Auth context state
 */
const Auth = createContext<any>(null);

export const useAuthContext = () => useContext(Auth);

interface contextProps {
  children: ReactNode;
}

export const AuthContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * App context
   */
  const { apiUrl, setLoading } = useAppContext();

  /**
   * current user state
   */
  const [currentUser, setCurrentUser] = useState(null);

  /**
   * Auth router
   */
  const [activeRoute, setActiveRoute] = useState({
    current: "login",
    back: "",
  });

  // Get user
  const GetUser = async () => {
    // get tokens
    let jwtToken = await AsyncStorage.getItem("IQ-Night:jwtToken");
    if (!jwtToken) {
      return setLoading(false);
    }
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

    // if token not expired get user data
    if (jwtToken) {
      try {
        const response = await axios.get(apiUrl + "/api/v1/auth/user", {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data.status === "success") {
          setCurrentUser(response.data.data.user);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    }
  };

  // Utility function to check if token is expired
  const isTokenExpired = (token: any) => {
    if (!token) return true;
    const [, payload] = token.split(".");
    if (!payload) return true;

    const { exp } = JSON.parse(atob(payload));

    if (!exp) return true;

    return Date.now() >= exp * 1000;
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

  useEffect(() => {
    if (!currentUser) {
      GetUser();
    }
  }, []);

  return (
    <Auth.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeRoute,
        setActiveRoute,
        GetUser,
      }}
    >
      {children}
    </Auth.Provider>
  );
};

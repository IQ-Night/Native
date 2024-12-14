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
  const { apiUrl, setLoading, setAlert } = useAppContext();

  /**
   * current user state
   */
  const [currentUser, setCurrentUser] = useState<any>(null);

  /**
   * Auth router
   */
  const [activeRoute, setActiveRoute] = useState({
    current: "login",
    back: "",
  });

  // addational fields
  const [addationalFields, setAddationalFields] = useState<any>(null);

  useEffect(() => {
    const CreateUnAuthUser = async () => {
      const generateUUID = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      };
      const noAuthUserId = generateUUID();
      const currentId = await AsyncStorage.getItem("IQ-Night:noAuthUserId");
      if (!currentId) {
        await AsyncStorage.setItem("IQ-Night:noAuthUserId", noAuthUserId);
      }
    };
    CreateUnAuthUser();
  }, []);

  // Get user
  const GetUser = async (val: any) => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/users/" + currentUser?._id
      );
      if (response.data.status === "success") {
        if (response?.data?.data?.user?.name) {
          setCurrentUser(response.data.data.user);
        } else {
          setLoading(false);
          setAddationalFields({
            user: response.data.data.user,
          });
        }
      }
    } catch (error: any) {
      setLoading(false);
      setAlert({
        text: error.response.data.message,
        type: "error",
        active: true,
      });
    }
  };
  // Get user
  const GetUserAuth = async () => {
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
          if (response?.data?.data?.user?.name) {
            setCurrentUser(response.data.data.user);
          } else {
            setLoading(false);
            setAddationalFields({
              user: response.data.data.user,
            });
          }
        }
      } catch (error: any) {
        setLoading(false);
        setAlert({
          text: error.response.data.message,
          type: "error",
          active: true,
        });
        // ამოშალე JWT ტოკენები
        await AsyncStorage.removeItem("IQ-Night:jwtToken");
        await AsyncStorage.removeItem("IQ-Night:jwtRefreshToken");

        // მომხმარებლის მონაცემების განულება
        setCurrentUser(null);
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
      GetUserAuth();
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
        addationalFields,
        setAddationalFields,
      }}
    >
      {children}
    </Auth.Provider>
  );
};

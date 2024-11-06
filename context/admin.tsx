import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Dimensions } from "react-native";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";
import axios from "axios";

/**
 * Admin context state
 */
const Admin = createContext<any>(null);

export const useAdminContext = () => useContext(Admin);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface contextProps {
  children: ReactNode;
}

export const AdminContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * App context
   */
  const { apiUrl } = useAppContext();
  /**
   * auth user state
   */
  const { currentUser, setCurrentUser } = useAuthContext();

  // unread notifications
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [loadingAdminNotifications, setLoadingAdminNotifications] =
    useState(false);

  const GetAdminNotifications = async () => {
    try {
      setLoadingAdminNotifications(true);
      const response = await axios.get(apiUrl + "/api/v1/admin/notifications");
      if (response?.data?.status === "success") {
        setAdminNotifications(response?.data?.data?.notifications);
        setLoadingAdminNotifications(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoadingAdminNotifications(false);
    }
  };

  useEffect(() => {
    if (currentUser?.admin?.active) {
      GetAdminNotifications();
    }
  }, [currentUser]);

  return (
    <Admin.Provider
      value={{
        adminNotifications,
        GetAdminNotifications,
        setAdminNotifications,
        loadingAdminNotifications,
      }}
    >
      {children}
    </Admin.Provider>
  );
};

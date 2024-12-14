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
import { useGameContext } from "./game";

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
   * Game context
   */
  const { socket } = useGameContext();
  /**
   * auth user state
   */
  const { currentUser, setCurrentUser } = useAuthContext();

  // unread notifications
  const [reportsNotifications, setReportsNotifications] = useState([]);
  const [ticketsNotifications, setTicketNotifications] = useState([]);
  const [loadingAdminNotifications, setLoadingAdminNotifications] =
    useState(false);
  const GetAdminNotifications = async () => {
    try {
      setLoadingAdminNotifications(true);
      const response = await axios.get(apiUrl + "/api/v1/admin/notifications");
      if (response?.data?.status === "success") {
        setTicketNotifications(response?.data?.data?.reports);
        setTicketNotifications(response?.data?.data?.tickets);
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

  useEffect(() => {
    if (socket) {
      socket.on("rerenderedAdmin", () => {
        GetAdminNotifications();
      });

      // Clean up the listener when component unmounts or socket changes
      return () => {
        socket.off("rerenderedAdmin");
      };
    }
  }, [socket]);

  return (
    <Admin.Provider
      value={{
        reportsNotifications,
        setReportsNotifications,
        GetAdminNotifications,
        ticketsNotifications,
        setTicketNotifications,
        loadingAdminNotifications,
      }}
    >
      {children}
    </Admin.Provider>
  );
};

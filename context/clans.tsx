import axios from "axios";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, Dimensions, Easing } from "react-native";
import { useAppContext } from "./app";
import { useContentContext } from "./content";
import { useNotificationsContext } from "./notifications";
import { useAuthContext } from "./auth";
import { useGameContext } from "./game";
import { useIsFocused, useNavigationState } from "@react-navigation/native";
/**
 * Clans context state
 */
const Clans = createContext<any>(null);

export const useClansContext = () => useContext(Clans);

interface contextProps {
  children: ReactNode;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ClansContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * Api context
   */
  const { apiUrl } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser, setCurentUser } = useAuthContext();
  /**
   * Game context
   */
  const { socket } = useGameContext();

  /**
   * Content context
   */
  const { rerenderClans, setRerenderClans } = useContentContext();
  /**
   * Notifications context
   */
  const { setRerenderNotifications } = useNotificationsContext();

  /**
   * Clans state
   */
  const [clans, setClans] = useState<any>([]);
  const [totalClans, setTotalClans] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [loadClans, setLoadClans] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const GetClans = async (page: number) => {
    try {
      setLoadClans(true);
      const response = await axios.get(
        apiUrl +
          "/api/v1/clans?page=1&limit=" +
          limit +
          "&search=" +
          search +
          "&currentUser=" +
          currentUser?._id
      );

      if (response.data.status === "success") {
        setClans(response.data.data.clans);
        setTotalClans(response.data.totalClans);
        setPage(page);
        setRerenderClans(false);
        setLoadClans(false);
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoadClans(false);
    }
  };
  useEffect(() => {
    if (rerenderClans || clans?.length < 1) {
      GetClans(1);
    }
  }, [apiUrl, search, rerenderClans]);

  // update clans wiht live socket
  // Inside the ClansContextWrapper component or any other component
  const focusedScreen = useNavigationState((state: any) => {
    const activeRoute = state.routes[state.index]; // Get the currently focused route
    return activeRoute.name; // Return the name of the focused screen
  });
  useEffect(() => {
    const updateClans = (data: any) => {
      if (focusedScreen === "Clans") {
        setClans((prev: any) =>
          prev?.map((pc: any) => {
            if (data?._id == pc?._id) {
              return data;
            } else {
              return pc;
            }
          })
        );
      }
      setRerenderNotifications(true);
    };
    socket.on("updateClan", updateClans);
    return () => {
      socket.off("updateClan", updateClans);
    };
  }, [socket, focusedScreen]);

  // delete clan confirm state
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /**
   * Update states
   */
  const [updateState, setUpdateState] = useState<any>(null);

  /**
   * Update clan state
   */
  const [updateClanState, setUpdateClanState] = useState("");

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
   * confirm change founder
   */
  const [confirm, setConfirm] = useState(null);

  return (
    <Clans.Provider
      value={{
        clans,
        GetClans,
        totalClans,
        setClans,
        search,
        setSearch,
        deleteConfirm,
        setDeleteConfirm,
        updateState,
        setUpdateState,
        loadClans,
        totalPages,
        setUpdateClanState,
        openDeleteConfirm,
        updateClanState,
        closeDeleteConfirm,
        slideAnimDelete,
        confirm,
        setConfirm,
      }}
    >
      {children}
    </Clans.Provider>
  );
};

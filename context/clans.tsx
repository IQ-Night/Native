import axios from "axios";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated, Dimensions } from "react-native";
import { useAppContext } from "./app";
import { useContentContext } from "./content";
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
   * Content context
   */
  const { rerenderClans, setRerenderClans } = useContentContext();

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
        apiUrl + "/api/v1/clans?page=1&limit=" + limit + "&search=" + search
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

  // delete clan confirm state
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /**
   * Update states
   */
  const [updateState, setUpdateState] = useState<any>(null);

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
      }}
    >
      {children}
    </Clans.Provider>
  );
};

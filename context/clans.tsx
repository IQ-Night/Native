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

  const GetClans = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/clans?page=1&limit=" + limit + "&search=" + search
      );
      if (response.data.status === "success") {
        setClans(response.data.data.clans);
        setTotalClans(response.data.totalClans);
        setPage(1);
        setRerenderClans(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };
  useEffect(() => {
    GetClans();
  }, [apiUrl, search, rerenderClans]);

  const [loadAddClans, setLoadAddClans] = useState(false);

  const AddClans = async () => {
    const newPage = page + 1;
    setLoadAddClans(true);
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/clans?page=" +
          newPage +
          "&limit=" +
          limit +
          "&search=" +
          search
      );
      if (response.data.status === "success") {
        let clansList = response.data.data.clans;
        setClans((prevClans: any) => {
          // Create a Map with existing clans using clanId as the key
          const clanMap = new Map(
            prevClans.map((clan: any) => [clan._id, clan])
          );

          // Iterate over new clans and add them to the Map if they don't already exist
          clansList.forEach((newClan: any) => {
            if (!clanMap.has(newClan._id)) {
              clanMap.set(newClan._id, newClan);
            }
          });

          // Convert the Map values back to an array
          const uniqueClans = Array.from(clanMap.values());

          return uniqueClans;
        });
        setLoadAddClans(false);
        setPage(newPage);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

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
        AddClans,
        loadAddClans,
        deleteConfirm,
        setDeleteConfirm,
        updateState,
        setUpdateState,
      }}
    >
      {children}
    </Clans.Provider>
  );
};

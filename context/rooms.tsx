import axios from "axios";
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
import { useContentContext } from "./content";
import { useGameContext } from "./game";
/**
 * Rooms context state
 */
const Rooms = createContext<any>(null);

export const useRoomsContext = () => useContext(Rooms);

interface contextProps {
  children: ReactNode;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const RoomsContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * App context
   */
  const { apiUrl, setLoading } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser, GetUser } = useAuthContext();
  /**
   * Content context
   */
  const { rerenderRooms, setRerenderRooms } = useContentContext();
  /**
   * Rooms state
   */
  const [loadRooms, setLoadRooms] = useState(false);
  const [rooms, setRooms] = useState<any>([]);
  const [totalRooms, setTotalRooms] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [languageTotals, setLanguageTotals] = useState(0);
  //filter
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const GetRooms = async (pg: number) => {
    setLoadRooms(true); // Set loading state to true before fetching
    try {
      const response = await axios.get(
        `${apiUrl}/api/v1/rooms?page=${pg}&limit=${limit}&search=${search}&language=${language}&currentUser=${currentUser?._id}`
      );

      if (response.data.status === "success") {
        // Append the new rooms to the existing ones
        setRooms(response.data.data.rooms);

        // Set additional state values from the response
        setTotalRooms(response.data.totalRooms);
        setLanguageTotals(response.data.data.languageTotals);
        setPage(pg); // Update the current page
        setTotalPages(response.data.totalPages); // Update total pages

        // Reset loading state
        setRerenderRooms(false);
        setLoading(false);
        setLoadRooms(false);
      } else {
        console.error("Failed to fetch rooms: ", response.data.message);
        setLoadRooms(false); // Stop loading even on failure
      }
    } catch (error: any) {
      console.error(
        "API Error: ",
        error.response?.data?.message || error.message
      );
      setLoadRooms(false); // Stop loading on error
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (rooms?.length < 1 || rerenderRooms) {
        GetRooms(1);
      }
    }
  }, [apiUrl, search, currentUser, language, rerenderRooms]);

  const [loadMore, setLoadMore] = useState(false);

  const AddRooms = async () => {
    setLoadMore(true);
    const newPage = page + 1;
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/rooms?page=" +
          newPage +
          "&limit=" +
          limit +
          "&search=" +
          search +
          "&language=" +
          language +
          "&currentUser=" +
          currentUser?._id
      );
      if (response.data.status === "success") {
        let roomsList = response.data.data.rooms;
        setRooms((prevRooms: any) => {
          // Create a Map with existing rooms using roomId as the key
          const roomMap = new Map(
            prevRooms.map((room: any) => [room._id, room])
          );

          // Iterate over new rooms and add them to the Map if they don't already exist
          roomsList.forEach((newRoom: any) => {
            if (!roomMap.has(newRoom._id)) {
              roomMap.set(newRoom._id, newRoom);
            }
          });

          // Convert the Map values back to an array
          const uniqueRooms = Array.from(roomMap.values());

          return uniqueRooms;
        });
        setRooms((prev: any) => [...prev, ...roomsList]);
        setPage(newPage);
        setLoadMore(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoadMore(false);
    }
  };

  /**
   * Game context
   */
  const { socket } = useGameContext();

  useEffect(() => {
    if (socket) {
      const handleDoorInfo = (updatedUsers: any) => {
        if (updatedUsers.roomId) {
          console.log(
            "Updating activeMembersTotal to: " + updatedUsers.users.length
          );
        }
      };

      socket.on("doorInfo", handleDoorInfo);

      return () => {
        socket.off("doorInfo", handleDoorInfo);
      };
    }
  }, [socket]);

  // filter active or not
  let filterStatus: any;
  if (language?.length > 0) {
    filterStatus = true;
  }

  useEffect(() => {
    if (!socket) return; // Early return if socket is not available

    const handleRerenderedRooms = () => {
      GetRooms(1); // Call the function when the event is triggered
    };

    socket.on("rerenderedRooms", handleRerenderedRooms); // Listen for the event

    // Cleanup function to remove the event listener
    return () => {
      socket.off("rerenderedRooms", handleRerenderedRooms);
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("rerenderedAuthUser", () => {
        GetUser();
        GetRooms(1);
      });

      // Clean up the listener when component unmounts or socket changes
      return () => {
        socket.off("rerenderedAuthUser");
      };
    }
  }, [socket]);

  return (
    <Rooms.Provider
      value={{
        rooms,
        totalRooms,
        setRooms,
        search,
        setSearch,
        languageTotals,
        language,
        setLanguage,
        page,
        totalPages,
        AddRooms,
        filterStatus,
        loadRooms,
        loadMore,
      }}
    >
      {children}
    </Rooms.Provider>
  );
};

/*
 * Roles
 */
export const roles = [
  {
    value: "mafia",
    label: "Mafia",
    rules: "",
    img: "",
  },
  {
    value: "citizen",
    label: "Citizen",
    rules: "",
    img: "",
  },
  {
    value: "doctor",
    label: "Doctor",
    rules: "",
    img: "",
  },
  {
    value: "police",
    label: "Police",
    rules: "",
    img: "",
  },
  {
    value: "serial-killer",
    label: "Serial Killer",
    rules: "",
    img: "",
    price: 500,
  },
  {
    value: "mafia-don",
    label: "Mafia Don",
    rules: "",
    img: "",
    price: 1000,
  },
];

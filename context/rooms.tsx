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
   * Context context
   */
  const { rerenderRooms, setRerenderRooms } = useContentContext();
  /**
   * Auth context
   */
  const { currentUser, GetUser } = useAuthContext();
  /**
   * Rooms state
   */
  const [rooms, setRooms] = useState<any>([]);
  const [totalRooms, setTotalRooms] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [languageTotals, setLanguageTotals] = useState(0);
  //filter
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");

  const GetRooms = async () => {
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/rooms?page=1&limit=" +
          limit +
          "&search=" +
          search +
          "&language=" +
          language +
          "&currentUser=" +
          currentUser?._id
      );
      if (response.data.status === "success") {
        setRooms(response.data.data.rooms);
        setTotalRooms(`${response.data.totalRooms}`);
        setLanguageTotals(response.data.data.languageTotals);
        setPage(1);
        setRerenderRooms(false);

        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      GetRooms();
    }
  }, [apiUrl, search, currentUser, language, rerenderRooms]);

  const [loadAddRooms, setLoadAddRooms] = useState(false);

  const AddRooms = async () => {
    const newPage = page + 1;
    setLoadAddRooms(true);
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
        setLoadAddRooms(false);
        setPage(newPage);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
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
      GetRooms(); // Call the function when the event is triggered
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
        GetRooms();
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
        AddRooms,
        loadAddRooms,
        setLoadAddRooms,
        GetRooms,
        filterStatus,
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
    price: 100,
  },
  {
    value: "mafia-don",
    label: "Mafia Don",
    rules: "",
    img: "",
    price: 100,
  },
  {
    value: "police",
    label: "Police",
    rules: "",
    img: "",
    price: 100,
  },
  {
    value: "serial-killer",
    label: "Serial Killer",
    rules: "",
    img: "",
    price: 100,
  },
];

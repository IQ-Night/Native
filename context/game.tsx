import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dimensions } from "react-native";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";
import { io } from "socket.io-client";
import axios from "axios";
import { useContentContext } from "./content";

/**
 * Game context state
 */
const Game = createContext<any>(null);

export const useGameContext = () => useContext<any>(Game);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface contextProps {
  children: ReactNode;
}

export const GameContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * App context
   */
  const { apiUrl } = useAppContext();

  /**
   * Auth user state
   */
  const { currentUser } = useAuthContext();

  /**
   * Active Room and Users
   */
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [spectators, setSpectators] = useState<any[]>([]);
  const [gamePlayers, setGamePlayers] = useState<any[]>([]);

  // Socket server reference
  const socket = useRef<any>(null);

  // State to track connection status
  const [connectionStatus, setConnectionStatus] = useState<string>("online");

  // State to track reconnection attempts
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  // Connect to the socket server unconditionally
  useEffect(() => {
    if (currentUser && !socket.current) {
      console.log(`Attempting to connect to ${apiUrl}`);
      socket.current = io(apiUrl, {
        transports: ["websocket"], // Ensures the WebSocket protocol is used
        query: { userId: currentUser._id },
      });

      // On successful connection
      socket.current.on("connect", () => {
        console.log("Connected to socket server:", socket.current.id);
        setConnectionStatus("online");
        setReconnectAttempts(0);
      });

      // Handle connection errors
      socket.current.on("connect_error", (error: any) => {
        console.error("Connection error:", error);
        setConnectionStatus("reconnecting");
      });

      // Handle disconnection
      socket.current.on("disconnect", (reason: any) => {
        console.log(`Disconnected: ${reason}`);
        setConnectionStatus(
          reason === "io server disconnect" ? "disconnected" : "reconnecting"
        );
      });
      const handleUserConnected = (data: any) => {
        const getRoom = async () => {
          if (data?.roomId) {
            setActiveRoom({ ...data, reJoin: true });

            // Join the room
            socket.current.emit(
              "joinRoom",
              data?.roomId,
              data?.roomName,
              data?.userId,
              data?.type
            );
          }
        };
        getRoom(); // Call the async function
      };
      socket.current.on("userConnected", handleUserConnected);

      // Cleanup function to disconnect socket when component unmounts
      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
        }
      };
    }
  }, [currentUser?._id, apiUrl]);

  /**
   * Screen message
   */
  const [message, setMessage] = useState({
    active: true,
    type: "",
    data: [],
  });

  const [loadingSpectate, setLoadingSpectate] = useState(false); // for spectators

  return (
    <Game.Provider
      value={{
        socket: socket.current,
        activeRoom,
        setActiveRoom,
        spectators,
        setSpectators,
        gamePlayers,
        setGamePlayers,
        message,
        setMessage,
        loadingSpectate,
        setLoadingSpectate,
        connectionStatus, // Add connection status to the context
        reconnectAttempts, // Expose the reconnection attempts to other components
      }}
    >
      {children}
    </Game.Provider>
  );
};

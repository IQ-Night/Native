import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dimensions } from "react-native";
import { io } from "socket.io-client";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";
import { mediaDevices, RTCView, RTCPeerConnection } from "react-native-webrtc";

// Game Context
const Game = createContext<any>(null);

export const useGameContext = () => useContext<any>(Game);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface contextProps {
  children: ReactNode;
}

export const GameContextWrapper: React.FC<contextProps> = ({ children }) => {
  const { apiUrl } = useAppContext();
  const { currentUser } = useAuthContext();

  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [spectators, setSpectators] = useState<any[]>([]);
  const [gamePlayers, setGamePlayers] = useState<any[]>([]);

  const socket = useRef<any>(null);

  const [connectionStatus, setConnectionStatus] = useState<string>("online");
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  // Connect to the socket server
  useEffect(() => {
    if (currentUser && !socket.current) {
      console.log(`Attempting to connect to ${apiUrl}`);
      socket.current = io(apiUrl, {
        transports: ["websocket"],
        query: { userId: currentUser._id },
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket server:", socket.current.id);
        setConnectionStatus("online");
        setReconnectAttempts(0);
      });

      socket.current.on("connect_error", (error: any) => {
        console.error("Connection error:", error);
        setConnectionStatus("reconnecting");
      });

      socket.current.on("disconnect", (reason: any) => {
        console.log(`Disconnected: ${reason}`);
        setConnectionStatus(
          reason === "io server disconnect" ? "disconnected" : "reconnecting"
        );
      });

      const handleUserConnected = (data: any) => {
        if (data?.roomId) {
          setActiveRoom({ ...data, reJoin: true });
          socket.current.emit(
            "joinRoom",
            data?.roomId,
            data?.roomName,
            data?.userId,
            data?.type
          );
        }
      };

      socket.current.on("userConnected", handleUserConnected);

      return () => {
        if (socket.current) {
          socket.current.disconnect();
          socket.current = null;
        }
      };
    }
  }, [currentUser?._id, apiUrl]);

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
        message: { active: true, type: "", data: [] },
        setMessage: () => {},
        loadingSpectate: false,
        setLoadingSpectate: () => {},
        connectionStatus,
        reconnectAttempts,
      }}
    >
      {children}
    </Game.Provider>
  );
};

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
 * Chat context state
 */
const Chat = createContext<any>(null);

export const useChatContext = () => useContext(Chat);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface contextProps {
  children: ReactNode;
}

export const ChatContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * App context
   */
  const { apiUrl } = useAppContext();
  /**
   * auth user state
   */
  const { currentUser, setCurrentUser } = useAuthContext();

  /**
   * Chats
   */
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(1);
  const [totalChats, setTotalChats] = useState<any>(null);
  const [chats, setChats] = useState<any>([]);
  const [chatNotifications, setChatNotifications] = useState<any>([]);

  // get chats
  const GetChats = async () => {
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/chats?page=1&search=" +
          search +
          "&userId=" +
          currentUser?._id
      );
      if (response?.data?.status === "success") {
        setChats(response?.data?.data?.chats);
        setTotalChats(response?.data?.totalChats);
        setPage(1);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      GetChats();
    }
  }, [search, currentUser]);

  // notifications
  const { socket } = useGameContext();

  useEffect(() => {
    if (socket) {
      // Define the event handler
      const handleGetNewMessage = (data: any) => {
        if (data?.message?.sender?.userId !== currentUser?._id) {
          setChatNotifications((prev: any) => [data?.message, ...prev]);
          const chatDefined = chats.find(
            (chat: any) =>
              chat.members?.find(
                (member: any) => member?.id === data?.message?.sender?.userId
              ) && chat.type?.value === "user"
          );
          if (chatDefined) {
            setChats((prev: any) => {
              return prev?.map((p: any) => {
                if (p?._id === chatDefined?._id) {
                  return {
                    ...p,
                    lastMessage: data?.message,
                  };
                }
                return p; // Explicitly return prev if condition is not met
              });
            });
          } else {
            GetChats(); // Fetch chats if no matching chat is found
          }
        }
      };

      // Attach the event listener
      socket.on("sendMessage", handleGetNewMessage);

      // Clean up by removing the event listener
      return () => {
        socket.off("sendMessage", handleGetNewMessage);
      };
    }
  }, [socket, currentUser?._id]);

  useEffect(() => {
    if (socket) {
      // Define the event handler
      const handleSeenMessage = (data: any) => {
        setChats((prev: any) => {
          return prev?.map((p: any) => {
            if (p?._id === data?.chat?._id?.toString()) {
              return data?.chat;
            }
            return p;
          });
        });
      };

      // Attach the event listener
      socket.on("seenMessage", handleSeenMessage);

      // Clean up by removing the event listener
      return () => {
        socket.off("seenMessage", handleSeenMessage);
      };
    }
  }, [socket, currentUser?._id]);
  useEffect(() => {
    if (socket) {
      // Define the event handler
      const handleDeleteChat = (data: any) => {
        setChats((prev: any) =>
          prev?.filter((p: any) => p?._id !== data?.chatId)
        );
      };

      // Attach the event listener
      socket.on("deleteChat", handleDeleteChat);

      // Clean up by removing the event listener
      return () => {
        socket.off("deleteChat", handleDeleteChat);
      };
    }
  }, [socket, currentUser?._id]);
  return (
    <Chat.Provider
      value={{
        loading,
        setChats,
        totalChats,
        chats,
        setPage,
        page,
        chatNotifications,
        setChatNotifications,
      }}
    >
      {children}
    </Chat.Provider>
  );
};

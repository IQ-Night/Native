import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuthContext } from "./auth";
import { useAppContext } from "./app";
import axios from "axios";
import { useContentContext } from "./content";
import { useGameContext } from "./game";
import AsyncStorage from "@react-native-async-storage/async-storage";
/**
 * Notifications context state
 */
const Notifications = createContext<any>(null);

export const useNotificationsContext = () => useContext(Notifications);

interface contextProps {
  children: ReactNode;
}

export const NotificationsContextWrapper: React.FC<contextProps> = ({
  children,
}) => {
  /**
   * App context
   */
  const { apiUrl } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Game context
   */
  const { socket } = useGameContext();
  /**
   * Content context
   */
  const { setRerenderNotifications, rerenderNotifications } =
    useContentContext();
  /**
   * Notifications state
   */
  const [totalNotifications, setTotalNotifications] = useState<any>(null);
  const [notifications, setNotifications] = useState<any>([]);
  const [page, setPage] = useState(1);
  const unreadNotifications = notifications.filter(
    (notif: any) => notif.status === "unread"
  );

  const [clansNotifications, setClansNotifications] = useState<any>([]);
  const [supportTickets, setSupportTickets] = useState<any>([]);

  useEffect(() => {
    const GetNotifications = async () => {
      try {
        const response = await axios.get(
          apiUrl + "/api/v1/users/" + currentUser._id + "/notifications?page=1"
        );
        if (response.data.status === "success") {
          setNotifications(response.data.data.notifications);
          setClansNotifications(response.data.data.clansNotifications);
          setSupportTickets(response.data.data.tickets);
          setTotalNotifications(response.data.total);
          setPage(1);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    if (currentUser) {
      GetNotifications();
    }
  }, [currentUser, rerenderNotifications]);

  /**
   * Add  Notifications
   */

  const AddNotifications = async () => {
    const newPage = page + 1;
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/users/" +
          currentUser._id +
          "/notifications?page=" +
          newPage
      );
      if (response.data.status === "success") {
        let notificationsList = response.data.data.notifications;

        setNotifications((prevNotifications: any) => {
          // Create a Map with existing notifications using notificationId as the key
          const notificationsMap = new Map(
            prevNotifications.map((notification: any) => [
              notification.notificationId,
              notification,
            ])
          );

          // Iterate over new notifications and add them to the Map if they don't already exist
          notificationsList.forEach((newNotification: any) => {
            if (!notificationsMap.has(newNotification.notificationId)) {
              notificationsMap.set(
                newNotification.notificationId,
                newNotification
              );
            }
          });

          // Convert the Map values back to an array
          const uniqueNotifications = Array.from(notificationsMap.values());

          return uniqueNotifications;
        });

        setClansNotifications(response.data.data.clansNotifications);
        setTotalNotifications(response.data.total);
        setPage(newPage);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  /**
   get total of requests
   *  */
  let clansRequestsNotifications = clansNotifications.filter((clan: any) =>
    clan.admin?.some((a: any) => a.user.id === currentUser._id)
  );

  // Initialize total requests
  let totalRequests = 0;

  // Loop through each clan and find members with "request" status
  clansRequestsNotifications.forEach((clan: any) => {
    const requestMembers = clan.members.filter(
      (member: any) => member.status === "request"
    );
    totalRequests += requestMembers.length; // Add the number of requests to total
  });

  /**
   get total of pendings
   *  */
  let clansPendingsNotifications = clansNotifications.filter((clan: any) =>
    clan.members.some(
      (member: any) =>
        member.userId === currentUser._id && member.status === "pending"
    )
  );

  // Initialize total pending requests counter
  let totalPending = 0;

  // Loop through each clan and count the pending requests for the current user
  clansPendingsNotifications.forEach((clan: any) => {
    const pendingMembers = clan.members.filter(
      (member: any) =>
        member.userId === currentUser._id && member.status === "pending"
    );
    totalPending += pendingMembers.length; // Add the count of pending members
  });

  let clansTotalBadge = totalRequests + totalPending;
  let totalBadge =
    unreadNotifications.length +
    totalRequests +
    totalPending +
    supportTickets?.length;

  useEffect(() => {
    if (socket) {
      socket.on("updateNotifications", () => {
        setRerenderNotifications((prev: any) => !prev);
      });

      // Clean up the listener when component unmounts or socket changes
      return () => {
        socket.off("updateNotifications");
      };
    }
  }, [socket]);

  /**
   * Send notification
   */
  // send notifications to user
  const SendNotification = async ({
    userId,
    type,
    title,
    name,
    newRole,
    warnings,
    warningType,
  }: any) => {
    try {
      if (userId) {
        const response = await axios.post(
          apiUrl + "/api/v1/users/" + userId + "/notifications",
          {
            sender: currentUser._id,
            receiver: userId,
            type: type,
            status: "unread",
            title,
            name,
            newRole,
            warnings,
            warningType,
          }
        );
        if (response.data.status === "success") {
          socket.emit("notifications", { userId: userId });
        }
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  // clear notifications
  const [loading, setLoading] = useState(false);
  const [clearState, setClearState] = useState<any>(null);
  const ClearNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.patch(
        apiUrl + "/api/v1/users/" + currentUser?._id + "/clearNotifications"
      );
      if (response.data.status === "success") {
        setNotifications([]);
        setTotalNotifications(0);
        setClearState(null);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  /**
   * unauth user notifications
   */
  const [noAuthTickets, setNoAuthTickets] = useState([]);
  useEffect(() => {
    const GetNouAuthTickets = async () => {
      const noAuthId = await AsyncStorage.getItem("IQ-Night:noAuthUserId");
      if (noAuthId) {
        try {
          const response = await axios.get(
            apiUrl + "/api/v1//tickets/noauth/" + noAuthId
          );
          if (response.data.status === "success") {
            setNoAuthTickets(response.data.data.tickets);
          }
        } catch (error: any) {
          console.log(error.response.data.message);
        }
      }
    };
    if (!currentUser) {
      GetNouAuthTickets();
    }
  }, [currentUser]);

  return (
    <Notifications.Provider
      value={{
        notifications,
        setNotifications,
        AddNotifications,
        unreadNotifications,
        totalNotifications,
        setTotalNotifications,
        clansNotifications,
        setClansNotifications,
        totalBadge,
        clansTotalBadge,
        SendNotification,
        loading,
        clearState,
        setClearState,
        ClearNotifications,
        supportTickets,
        setSupportTickets,
        noAuthTickets,
        setNoAuthTickets,
      }}
    >
      {children}
    </Notifications.Provider>
  );
};

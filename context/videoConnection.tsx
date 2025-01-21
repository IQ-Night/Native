import axios from "axios";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dimensions } from "react-native";
import { mediaDevices } from "react-native-webrtc";
import { handleReceiveAnswer } from "../functions/videoConnections/handleReceiveAnswer";
import { handleReceiveCandidate } from "../functions/videoConnections/handleReceiverCandidates";
import { handleReceiveOffer } from "../functions/videoConnections/handleRecieveOffer";
import { StartConnection } from "../functions/videoConnections/startConnections";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";
import { useGameContext } from "./game";

const VideoConnection = createContext<any>(null);

export const useVideoConnectionContext = () => useContext(VideoConnection);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface contextProps {
  children: ReactNode;
}

export const VideoConnectionContextWrapper: React.FC<contextProps> = ({
  children,
}) => {
  /**
   * აპი კონტექსტი
   */
  const { apiUrl } = useAppContext();
  /**
   * ავტორიზირებული იუზერი
   */
  const { currentUser } = useAuthContext();

  /**
   * თამაშის და სოქეთ სერვერის კონტექსტი
   */
  const { socket, activeRoom, gamePlayers, spectators, allUsers } =
    useGameContext();

  /**
   * ვიდეოს ჩატვირთვის ინდიკატორი
   */
  const [loading, setLoading] = useState<any>(false);

  /**
   * ლოკალური სთრიმის საცავი
   */
  const [localStream, setLocalStream] = useState<any>(null);

  /**
   * შემოსული სთრიმის ნაკადი
   */
  const [remoteStreams, setRemoteStreams] = useState<any>([]);

  /**
   * დამყარებული კავშირები, სადაც მოთავსებულია სხვა და სხვა იუზერებთან დამყარებული კავშირები
   * რომლებიც განსაზღვრულია იუზერის აიდის მიხედვით ობიექტში.
   */
  const peerConnections = useRef<{ [userId: string]: any }>({});

  /**
   * სოქეთიდან მიღებული სიგნალების მიღება და გაშვება
   */
  useEffect(() => {
    if (socket && peerConnections?.current) {
      // მიღებები
      socket?.on("receive-offer", (data: any) => {
        if (localStream) {
          handleReceiveOffer({
            ...data,
            peerConnections,
            socket,
            setLoading,
            setRemoteStreams,
            currentUser,
            localStream,
          });
        }
      });
      socket?.on("receive-answer", (data: any) => {
        handleReceiveAnswer({
          ...data,
          peerConnections,
          setLoading,
          setRemoteStreams,
        });
      });
      socket?.on("receive-candidate", (data: any) => {
        handleReceiveCandidate({
          ...data,
          peerConnections,
        });
      });

      return () => {
        socket?.off("receive-offer", (data: any) => {
          if (localStream) {
            handleReceiveOffer({
              ...data,
              peerConnections,
              socket,
              setLoading,
              setRemoteStreams,
              currentUser,
              localStream,
            });
          }
        });
        socket?.off("receive-answer", (data: any) => {
          handleReceiveAnswer({
            ...data,
            peerConnections,
            setLoading,
            setRemoteStreams,
          });
        });
        socket?.off("receive-candidate", (data: any) => {
          handleReceiveCandidate({
            ...data,
            peerConnections,
          });
        });

        Object.values(peerConnections.current).forEach((connection) => {
          connection.close();
        });
      };
    }
  }, [socket, currentUser?._id, localStream]);

  /**
   * კავშირის სტატუსო
   */
  const [connectionStatus, setConnectionStatus] = useState<any>("inactive");

  /**
   * ვიდეოს აქტივაცია
   */
  const [video, setVideo] = useState<any>("inactive");

  /**
   * მიკროფონის კონტროლი
   */
  const [microphone, setMicrophone] = useState<any>("inactive");

  // ვიდეო და აუდიო სტატუსის ცვლილებები უნდა აისახოს სოქეთის გავლით სხვა იუზერებთან
  useEffect(() => {
    socket.emit("userMediaStatusUpdate", {
      video,
      audio: microphone,
      userId: currentUser?._id,
      roomId: activeRoom?._id,
    });
  }, [video, microphone, activeRoom?._id]);

  /**
   * ლოკალური კავშირის შექმნა
   */
  useEffect(() => {
    const initLocalStream = async () => {
      try {
        if (!localStream) {
          const stream = await mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          setLocalStream(stream); // ლოკალური სტრიმის შენახვა
        }
      } catch (error) {
        console.log("Error initializing local stream:", error);
      }
    };
    initLocalStream();
  }, []);

  /**
   * სთრიმის გაგზავნა იუზერებთან
   */
  useEffect(() => {
    // მივიღოთ ოთახში დაკავშირებული იუზერების სია სერვერიდან რათა მათ გაეგზავნოთ სთრიმები ახლად შემოსული იუზერისგან
    const sendStream = async () => {
      try {
        const response = await axios.get(
          apiUrl + "/api/v1/users/connected?roomId=" + activeRoom?._id
        );
        const allUsers = response.data.data.users.filter(
          (u: any) => u.userId !== currentUser?._id
        );
        if (allUsers.length > 0) {
          StartConnection(
            localStream,
            currentUser,
            peerConnections,
            socket,
            setRemoteStreams,
            allUsers
          );
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    if (localStream) {
      sendStream();
    }
  }, [localStream]);
  /** ვიდეოს გახსნა დახურვა */
  const [openVideo, setOpenVideo] = useState<any>(false);

  return (
    <VideoConnection.Provider
      value={{
        video,
        setVideo,
        localStream,
        setLocalStream,
        remoteStreams,
        StartConnection,
        openVideo,
        setOpenVideo,
        setLoading,
        loading,
        microphone,
        setMicrophone,
      }}
    >
      {children}
    </VideoConnection.Provider>
  );
};

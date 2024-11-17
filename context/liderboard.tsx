import axios from "axios";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAppContext } from "./app";
import { useContentContext } from "./content";
/**
 * Liderboard context state
 */
const Liderboard = createContext<any>(null);

export const useLiderboardContext = () => useContext(Liderboard);

interface contextProps {
  children: ReactNode;
}

export const LiderboardContextWrapper: React.FC<contextProps> = ({
  children,
}) => {
  /**
   * App context
   */
  const { apiUrl } = useAppContext();
  /**
   * Content context
   */
  const { rerenderLiderBoard, setRerenderLiderBoard } = useContentContext();
  /**
   * Liderboard state
   */
  const [loadList, setLoadList] = useState(true);
  const [liderboard, setLiderboard] = useState([]);

  useEffect(() => {
    const GetUsers = async () => {
      try {
        const response = await axios.get(apiUrl + "/api/v1/users");
        if (response.data.status === "success") {
          setLiderboard(response.data.data.users);
          setRerenderLiderBoard(false);
          setLoadList(false);
        }
      } catch (error: any) {
        console.log(error);
        setRerenderLiderBoard(false);
        setLoadList(false);
      }
    };
    if (rerenderLiderBoard || liderboard?.length < 1) {
      GetUsers();
    }
  }, [rerenderLiderBoard]);

  return (
    <Liderboard.Provider value={{ liderboard, loadList }}>
      {children}
    </Liderboard.Provider>
  );
};

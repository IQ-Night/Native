import { ReactNode, createContext, useContext } from "react";
import { Dimensions } from "react-native";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";

/**
 * Admin context state
 */
const Admin = createContext<any>(null);

export const useAdminContext = () => useContext(Admin);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface contextProps {
  children: ReactNode;
}

export const AdminContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * auth user state
   */
  const { currentUser, setCurrentUser } = useAuthContext();

  return <Admin.Provider value={{}}>{children}</Admin.Provider>;
};

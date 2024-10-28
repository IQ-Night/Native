import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";

/**
 * Content context state
 */

const Content = createContext<any>(null);

export const useContentContext = () => useContext(Content);

interface contextProps {
  children: ReactNode;
}

export const ContentContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * Rerenders
   */
  const [rerenderRooms, setRerenderRooms] = useState(false);
  const [rerenderClans, setRerenderClans] = useState(false);
  const [rerenderProducts, setRerenderProducts] = useState(false);
  const [rerenderLiderBoard, setRerenderLiderBoard] = useState(false);
  const [rerenderProfile, setRerenderProfile] = useState(false);
  const [rerenderNotifications, setRerenderNotifications] = useState(false);

  /**
   * scrollY
   */
  const [scrollYRooms, setScrollYRooms] = useState(0);
  const [scrollYClans, setScrollYClans] = useState(0);
  const [scrollYStore, setScrollYStore] = useState(0);
  const [scrollYLiderBoard, setScrollYLiderBoard] = useState(0);
  const [scrollYProfile, setScrollYProfile] = useState(0);

  const scrollViewRefRooms = useRef<any>(null);
  const scrollViewRefClans = useRef<any>(null);
  const scrollViewRefStore = useRef<any>(null);
  const scrollViewRefLiderBoard = useRef<any>(null);
  const scrollViewRefProfile = useRef<any>(null);

  const scrollToTop = (screen: string) => {
    if (screen === "Rooms") {
      if (scrollViewRefRooms.current) {
        scrollViewRefRooms.current.scrollTo({
          y: 0,
          animated: true, // This enables smooth scrolling
        });
      }
    } else if (screen === "Clans") {
      if (scrollViewRefClans.current) {
        scrollViewRefClans.current.scrollTo({
          y: 0,
          animated: true, // This enables smooth scrolling
        });
      }
    } else if (screen === "Liderboard") {
      if (scrollViewRefLiderBoard.current) {
        scrollViewRefLiderBoard.current.scrollTo({
          y: 0,
          animated: true, // This enables smooth scrolling
        });
      }
    } else if (screen === "Profile") {
      if (scrollViewRefProfile.current) {
        scrollViewRefProfile.current.scrollTo({
          y: 0,
          animated: true, // This enables smooth scrolling
        });
      }
    }
  };

  /**
   * loading animation
   */
  const transformListY = useRef(new Animated.Value(0)).current;
  const opacityList = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationY = Animated.timing(transformListY, {
      toValue:
        rerenderRooms || rerenderClans || rerenderLiderBoard || rerenderProfile
          ? 40
          : 0,
      duration: 200,
      useNativeDriver: true,
    });

    const animationOpacity = Animated.timing(opacityList, {
      toValue:
        rerenderRooms || rerenderClans || rerenderLiderBoard || rerenderProfile
          ? 1
          : 0,
      duration: 200,
      useNativeDriver: true,
    });

    // Running animations simultaneously
    Animated.parallel([animationY, animationOpacity]).start();
  }, [
    rerenderRooms,
    rerenderClans,
    rerenderProducts,
    rerenderLiderBoard,
    rerenderProfile,
  ]);

  return (
    <Content.Provider
      value={{
        rerenderRooms,
        setRerenderRooms,
        rerenderClans,
        setRerenderClans,
        rerenderProducts,
        setRerenderProducts,
        rerenderLiderBoard,
        setRerenderLiderBoard,
        rerenderProfile,
        setRerenderProfile,
        rerenderNotifications,
        setRerenderNotifications,
        scrollYClans,
        scrollYRooms,
        scrollYStore,
        scrollYLiderBoard,
        scrollYProfile,
        setScrollYClans,
        setScrollYRooms,
        setScrollYStore,
        setScrollYLiderBoard,
        setScrollYProfile,
        scrollViewRefRooms,
        scrollViewRefClans,
        scrollViewRefStore,
        scrollViewRefLiderBoard,
        scrollViewRefProfile,
        scrollToTop,
        transformListY,
        opacityList,
      }}
    >
      {children}
    </Content.Provider>
  );
};

import axios from "axios";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppContext } from "./app";
import { Animated, Dimensions } from "react-native";
import { useContentContext } from "./content";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Store context state
 */
const Store = createContext<any>(null);

export const useStoreContext = () => useContext(Store);

interface contextProps {
  children: ReactNode;
}

export const StoreContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * App context
   */
  const { apiUrl } = useAppContext();
  /**
   * Context context
   */
  const { setRerenderProducts, rerenderProducts } = useContentContext();
  /**
   * Store state
   */
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(null);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  //Get Products
  const GetProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        apiUrl + "/api/v1/products?type=" + type + "&search=" + search
      );
      if (response.data.status === "success") {
        setProducts(response.data.data.products);
        setTotalProducts(response.data.totalProducts);
        setLoading(false);
        setRerenderProducts(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rerenderProducts || products?.length < 1) {
      GetProducts();
    }
  }, [type, search, rerenderProducts]);

  /**
   * Filter
   */
  const [openFilter, setOpenFilter] = useState(false);
  const translateYFilter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateYFilter, {
      toValue: openFilter ? 0 : SCREEN_HEIGHT - 180,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {});
  }, [openFilter]);

  /**
   * Search Animation
   */

  // Boolean to track input focus
  const [isFocused, setIsFocused] = useState(false);
  // Animated values
  const slideAnim = useRef(new Animated.Value(-100)).current; // Initial position off-screen
  const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity 0

  /**
   * Open search
   */
  const [open, setOpen] = useState(false);

  // Ref for the TextInput
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        inputRef.current?.focus();
        setIsFocused(true);
      });
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  /**
   * BG scale
   */

  const scaleBg = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (openFilter) {
      Animated.timing(scaleBg, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleBg, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [openFilter]);

  return (
    <Store.Provider
      value={{
        products,
        setProducts,
        totalProducts,
        type,
        setType,
        loading,
        setLoading,
        search,
        setSearch,
        open,
        setOpen,
        slideAnim,
        opacityAnim,
        isFocused,
        setIsFocused,
        inputRef,
        openFilter,
        setOpenFilter,
        translateYFilter,
        scaleBg,
      }}
    >
      {children}
    </Store.Provider>
  );
};

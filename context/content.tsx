import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";
import Purchases from "react-native-purchases";
import { REVENUE_CAT_API_KEY } from "@env";
import { useAuthContext } from "./auth";
import { useAppContext } from "./app";

/**
 * Content context state
 */

const Content = createContext<any>(null);

export const useContentContext = () => useContext(Content);

interface contextProps {
  children: ReactNode;
}

export const ContentContextWrapper: React.FC<contextProps> = ({ children }) => {
  const { setAlert, activeLanguage } = useAppContext();
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
  const scrollYRooms = useRef<any>(0);
  const setScrollYRooms = (y: any) => {
    scrollYRooms.current = y;
  };
  const scrollYClans = useRef<any>(0);
  const setScrollYClans = (y: any) => {
    scrollYClans.current = y;
  };
  const scrollYStore = useRef<any>(0);
  const setScrollYStore = (y: any) => {
    scrollYStore.current = y;
  };
  const scrollYLiderBoard = useRef<any>(0);
  const setScrollYLiderBoard = (y: any) => {
    scrollYLiderBoard.current = y;
  };

  const scrollYProfile = useRef<any>(0);
  const setScrollYProfile = (y: any) => {
    scrollYProfile.current = y;
  };

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
    } else if (screen === "Store") {
      if (scrollViewRefStore.current) {
        scrollViewRefStore.current.scrollTo({
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
        rerenderRooms ||
        rerenderClans ||
        rerenderLiderBoard ||
        rerenderProducts ||
        rerenderProfile
          ? 40
          : 0,
      duration: 200,
      useNativeDriver: true,
    });

    const animationOpacity = Animated.timing(opacityList, {
      toValue:
        rerenderRooms ||
        rerenderClans ||
        rerenderLiderBoard ||
        rerenderProducts ||
        rerenderProfile
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

  // confirm action
  const [confirmAction, setConfirmAction] = useState({ active: false });

  const [products, setProducts] = useState<any>([]);
  const [coins, setCoins] = useState<any>([]);

  const { currentUser } = useAuthContext();
  Purchases.configure({
    apiKey: REVENUE_CAT_API_KEY, // აქ ჩასვით თქვენი რეალური Public API Key
    appUserID: currentUser?._id,
  });
  // Fetch products from RevenueCat
  const fetchProducts = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.all;
      if (currentOffering) {
        setProducts(currentOffering["VIP Subscription"]?.availablePackages);
        setCoins(currentOffering["Coins"]?.availablePackages);
      } else {
        console.log("No current offerings available.");
      }
    } catch (error) {
      console.log("Error fetching products: ", error);
      setAlert({
        active: true,
        type: "error",
        text:
          activeLanguage?.errorFetchingProducts || "Failed to fetch products",
      });
    }
  };

  const fetchCoinProducts = async () => {
    try {
      const productIdentifiers = [
        "INCOINS_100",
        "INCOINS_500",
        "INCOINS_1000",
        "INCOINS_1500",
        "INCOINS_2000",
        "INCOINS_3000",
      ];
      const products = await Purchases.getProducts(productIdentifiers);
      setCoins(products);
    } catch (error) {
      console.log("Error fetching coin products:", error);
      setAlert({
        active: true,
        type: "error",
        text:
          activeLanguage?.errorFetchingProducts || "Failed to fetch products",
      });
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    if (currentUser) {
      fetchProducts();
      fetchCoinProducts();
    }
  }, [currentUser]);

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
        setScrollYRooms,
        scrollYStore,
        scrollYLiderBoard,
        scrollYProfile,
        setScrollYClans,
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
        confirmAction,
        setConfirmAction,
        products,
        setProducts,
        coins,
      }}
    >
      {children}
    </Content.Provider>
  );
};

// warnings
export const warnings = [
  {
    id: 1,
    value: "offensive_language",
    en: "Using offensive language",
    ka: "ბილწ სიტყვაობა",
    ru: "Использование нецензурной лексики",
  },
  {
    id: 2,
    value: "insulting_others",
    en: "Insulting others",
    ka: "სხვისი შეურაწყოფა",
    ru: "Оскорбление других",
  },
  {
    id: 3,
    value: "revealing_roles",
    en: "Revealing roles, showing cards",
    ka: "როლის გამოვკენა , კარტის ჩვენება",
    ru: "Раскрытие ролей, показ карт",
  },
  {
    id: 4,
    value: "swearing_without_argument",
    en: "Swearing, oath-taking without arguments",
    ka: "დაფიცება , დაგინება , ღმერთის ხსენება, დაფიცება, თავის გაწითლება არა არგუმენტებით",
    ru: "Клятва, упоминание Бога, без аргументов",
  },
  {
    id: 5,
    value: "clan_member_insult",
    en: "Insulting or belittling members of other clans",
    ka: "სხვა კლანში მყოფი ადამიანის დამცირება , ცუდად მოხსენიება , შეურაწყოფა",
    ru: "Оскорбление членов других кланов",
  },
  {
    id: 6,
    value: "intentional_exit",
    en: "Intentional exit from the game",
    ka: "შუა თამაშიდან განზრახ გასვლა",
    ru: "Намеренный выход из игры",
  },
  {
    id: 7,
    value: "harassment_threats",
    en: "Harassment, threats, blackmail",
    ka: "ადამიანის შევიწროვება , მუქარა, შანტაჟი",
    ru: "Преследование, угрозы, шантаж",
  },
  {
    id: 8,
    value: "foreign_language",
    en: "Using foreign language not set as room language",
    ka: "უცხო ენის გამოყენება რომელიც არ არის რუმის ენად მითითებული და გაუგებარია მოთამაშეთათვის",
    ru: "Использование иностранного языка, непонятного игрокам",
  },
  {
    id: 9,
    value: "offensive_nickname",
    en: "Offensive nicknames",
    ka: "მეტსახელები რომელიც შეიცავს შეურაწყოფას",
    ru: "Оскорбительные прозвища",
  },
  {
    id: 10,
    value: "betting_challenge",
    en: "Betting challenges",
    ka: "ჩელენჯი ფსონზე , დანინძალევბა",
    ru: "Челленджи с пари",
  },
  {
    id: 11,
    value: "ability_abuse",
    en: "Abuse of abilities, unfair conduct",
    ka: "შესაძლებლობების ბოროტად გამოყენება , არასამართლიანად",
    ru: "Злоупотребление возможностями, несправедливое поведение",
  },
];

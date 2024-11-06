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

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { en, ka, ru } from "../languages/languages";

/**
 * App context state
 */

const App = createContext<any>(null);

export const useAppContext = () => useContext(App);

interface contextProps {
  children: ReactNode;
}

export const AppContextWrapper: React.FC<contextProps> = ({ children }) => {
  /**
   * API Url
   */
  // const apiUrl = "192.168.1.137:5000";
  // const apiUrl = "http://192.168.1.6:5000";
  // const apiUrl = "http://192.168.100.4:5000";
  const apiUrl = "https://iq-night-acb3bc094c45.herokuapp.com";

  /**
   * Loading State
   */
  const [loading, setLoading] = useState(true);

  /**
   * app theme
   */
  const [appTheme, setAppTheme] = useState("dark");
  const dark = { text: "#c7c7c7", active: "#d0a640" };
  const light = { text: "black", active: "#d0a640" };
  const [theme, setTheme] = useState(dark);

  useEffect(() => {
    if (appTheme === "dark") {
      setTheme(dark);
    } else {
      setTheme(light);
    }
  }, [appTheme]);

  /**
   * app language
   */
  const [language, setLanguage] = useState("GE");
  const [activeLanguage, setActiveLanguage] = useState(en);

  useEffect(() => {
    if (language === "GE") {
      setActiveLanguage(ka);
    } else if (language === "GB") {
      setActiveLanguage(en);
    } else {
      setActiveLanguage(ru);
    }
  }, [language]);

  useEffect(() => {
    const GetLanguages = async () => {
      const appLang = await AsyncStorage.getItem("IQ-Night:language");
      setLanguage(appLang || "GE");
    };
    GetLanguages();
  }, []);

  /**
   * haptics context
   */
  const [haptics, setHaptics] = useState(true);
  useEffect(() => {
    const GetHaptics = async () => {
      const hapticStorage = await AsyncStorage.getItem("IQ-Night:haptics");
      if (hapticStorage) {
        setHaptics(hapticStorage === "Active" ? true : false);
      }
    };
    GetHaptics();
  }, []);

  /**
   * bg sound context
   */
  const [bgSound, setBgSound] = useState(false);
  useEffect(() => {
    const GetBgSound = async () => {
      const soundStorage = await AsyncStorage.getItem("IQ-Night:bgSound");
      if (soundStorage) {
        setBgSound(soundStorage === "Active" ? true : false);
      } else {
        setBgSound(true);
      }
    };
    GetBgSound();
  }, []);

  /**
   * Alert context
   */
  const [alert, setAlert] = useState({ active: false, type: "", text: "" });

  /**
   * app state position
   */
  const [appStatePosition, setAppStatePosition] = useState("active");

  return (
    <App.Provider
      value={{
        apiUrl,
        loading,
        setLoading,
        setAppTheme,
        appTheme,
        theme,
        alert,
        setAlert,
        language,
        setLanguage,
        activeLanguage,
        haptics,
        setHaptics,
        bgSound,
        setBgSound,
        appStatePosition,
        setAppStatePosition,
      }}
    >
      {children}
    </App.Provider>
  );
};

export const privacyPolicyContentEn = [
  {
    title: "Privacy Policy",
    content: `Last updated: December 06, 2024\n\nThis Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.\n\nWe use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.`,
  },
  {
    title: "Interpretation and Definitions",
    subsections: [
      {
        subtitle: "Interpretation",
        content: `The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.`,
      },
      {
        subtitle: "Definitions",
        content: `For the purposes of this Privacy Policy:\n
        - **Account** means a unique account created for You to access our Service or parts of our Service.\n
        - **Affiliate** means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.\n
        - **Application** refers to IQ NIGHT, the software program provided by the Company.\n
        - **Company** (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to IQ NIGHT LLC, TBILISI, GEORGIA, LENTEKHI II TURN.\n
        - **Country** refers to: Georgia\n
        - **Device** means any device that can access the Service such as a computer, a cellphone or a digital tablet.\n
        - **Personal Data** is any information that relates to an identified or identifiable individual.\n
        - **Service** refers to the Application.\n
        - **Service Provider** means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.\n
        - **Usage Data** refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).\n
        - **You** means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.`,
      },
    ],
  },
  {
    title: "Collecting and Using Your Personal Data",
    subsections: [
      {
        subtitle: "Types of Data Collected",
        content: `Personal Data\n\nWhile using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:\n\n
        - Email address\n
        - First name and last name\n
        - Address, State, Province, ZIP/Postal code, City\n
        - Usage Data`,
      },
      {
        subtitle: "Usage Data",
        content: `Usage Data is collected automatically when using the Service.\n\nUsage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.\n\nWhen You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.\n\nWe may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.`,
      },
      {
        subtitle: "Information Collected while Using the Application",
        content: `While using Our Application, in order to provide features of Our Application, We may collect, with Your prior permission:\n\n
        - Pictures and other information from your Device's camera and photo library\n\n
        We use this information to provide features of Our Service, to improve and customize Our Service. The information may be uploaded to the Company's servers and/or a Service Provider's server or it may be simply stored on Your device.\n\n
        You can enable or disable access to this information at any time, through Your Device settings.`,
      },
    ],
  },
  {
    title: "Use of Your Personal Data",
    content: `The Company may use Personal Data for the following purposes:\n\n
    - To provide and maintain our Service, including to monitor the usage of our Service.\n
    - To manage Your Account: to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.\n
    - For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.\n
    - To contact You: To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.\n
    - To provide You with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.\n
    - To manage Your requests: To attend and manage Your requests to Us.`,
  },
  {
    title: "Retention of Your Personal Data",
    content: `The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.\n\nThe Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.`,
  },
  {
    title: "Transfer of Your Personal Data",
    content: `Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.\n\nYour consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.\n\nThe Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.`,
  },
  {
    title: "Delete Your Personal Data",
    content: `You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.\n\nOur Service may give You the ability to delete certain information about You from within the Service.\n\nYou may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.\n\nPlease note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.`,
  },
  {
    title: "Disclosure of Your Personal Data",
    subsections: [
      {
        subtitle: "Business Transactions",
        content: `If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.`,
      },
      {
        subtitle: "Law enforcement",
        content: `Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).`,
      },
      {
        subtitle: "Other legal requirements",
        content: `The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:\n\n
        - Comply with a legal obligation\n
        - Protect and defend the rights or property of the Company\n
        - Prevent or investigate possible wrongdoing in connection with the Service\n
        - Protect the personal safety of Users of the Service or the public\n
        - Protect against legal liability`,
      },
    ],
  },
  {
    title: "Security of Your Personal Data",
    content: `The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.`,
  },
  {
    title: "Children's Privacy",
    content: `Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.\n\nIf We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.`,
  },
  {
    title: "Links to Other Websites",
    content: `Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.\n\nWe have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.`,
  },
  {
    title: "Changes to this Privacy Policy",
    content: `We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.\n\nWe will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.\n\nYou are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.`,
  },
  {
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy, You can contact us:\n\n
    - By email: info@iqnight.app`,
  },
];

export const privacyPolicyContentKa = [
  {
    title: "კონფიდენციალურობის პოლიტიკა",
    content: `ბოლო განახლება: 2024 წლის 6 დეკემბერი\n\nეს კონფიდენციალურობის პოლიტიკა აღწერს ჩვენს პოლიტიკას და პროცედურებს თქვენი ინფორმაციის შეგროვებაზე, გამოყენებასა და გამჟღავნებაზე, როცა თქვენ იყენებთ სერვისს, და გატყობინებთ თქვენს კონფიდენციალურობის უფლებებს და როგორ იცავს კანონები თქვენ.\n\nჩვენ ვიყენებთ თქვენს პერსონალურ მონაცემებს სერვისის გასაუმჯობესებლად. სერვისის გამოყენებით, თქვენ ეთანხმებით ინფორმაციის შეგროვებასა და გამოყენებას ამ კონფიდენციალურობის პოლიტიკის შესაბამისად.`,
  },
  {
    title: "ტერმინების განმარტება და განმარტებები",
    subsections: [
      {
        subtitle: "ტერმინების განმარტება",
        content: `სიტყვებს, რომელთა პირველი ასო კაპიტალიზებულია, აქვთ განსაზღვრული მნიშვნელობა შემდეგ პირობებში. ეს განსაზღვრებები ერთნაირად გამოიყენება როგორც მხოლობითში, ისე მრავლობითში.`,
      },
      {
        subtitle: "განსაზღვრებები",
        content: `ამ კონფიდენციალურობის პოლიტიკის მიზნებისთვის:\n\n
        - **ანგარიში** ნიშნავს უნიკალურ ანგარიშს, რომელიც შექმნილია სერვისის ან მისი ნაწილის წვდომისთვის.\n
        - **თანამშრომელი** ნიშნავს სუბიექტს, რომელიც აკონტროლებს, იმართება ან იმყოფება საერთო კონტროლის ქვეშ მხარესთან, სადაც "კონტროლი" ნიშნავს 50%-ზე მეტ წილს ან სხვა ფასიანი ქაღალდების საკუთრებას, რომლებიც უფლებას აძლევს არჩევანის უფლების გამოყენებას.\n
        - **აპლიკაცია** ნიშნავს IQ NIGHT-ს, კომპანიის მიერ მოწოდებულ პროგრამულ უზრუნველყოფას.\n
        - **კომპანია** (მოხსენიებული როგორც "კომპანია", "ჩვენ", "ჩვენი" ან "ჩვენს" ამ შეთანხმებაში) ნიშნავს IQ NIGHT LLC-ს, თბილისი, საქართველო, ლენტეხი II შესახვევი.\n
        - **ქვეყანა** ნიშნავს: საქართველო\n
        - **მოწყობილობა** ნიშნავს ნებისმიერ მოწყობილობას, რომელიც წვდომას უზრუნველყოფს სერვისზე, როგორიცაა კომპიუტერი, მობილური ტელეფონი ან პლანშეტი.\n
        - **პერსონალური მონაცემები** არის ნებისმიერი ინფორმაცია, რომელიც უკავშირდება იდენტიფიცირებულ ან იდენტიფიცირებად ფიზიკურ პირს.\n
        - **სერვისი** ნიშნავს აპლიკაციას.\n
        - **მომსახურების მიმწოდებელი** ნიშნავს ნებისმიერ ფიზიკურ ან იურიდიულ პირს, რომელიც მონაცემებს ამუშავებს კომპანიის სახელით. ის გულისხმობს მესამე მხარის კომპანიებს ან პირებს, რომლებიც დასაქმებული არიან კომპანიის მიერ სერვისის გასაუმჯობესებლად ან მისი ანალიზისთვის.\n
        - **გამოყენების მონაცემები** ნიშნავს მონაცემებს, რომლებიც ავტომატურად იკრიბება, სერვისის გამოყენების ან მისი ინფრასტრუქტურის მეშვეობით (მაგალითად, გვერდის მონახულების ხანგრძლივობა).\n
        - **თქვენ** ნიშნავს პირს, რომელიც წვდომას ახორციელებს სერვისზე ან კომპანიის, ან სხვა იურიდიული პირის სახელით, როგორც მოქმედებს შესაბამისი.`,
      },
    ],
  },
  {
    title: "თქვენი პერსონალური მონაცემების შეგროვება და გამოყენება",
    subsections: [
      {
        subtitle: "შეგროვებული მონაცემების ტიპები",
        content: `პერსონალური მონაცემები\n\nსერვისის გამოყენებისას, ჩვენ შეგვიძლია მოგთხოვოთ კონკრეტული პიროვნული ინფორმაცია, რომელიც შეიძლება გამოყენებულ იქნეს თქვენი იდენტიფიცირებისთვის ან თქვენთან საკონტაქტოდ. პიროვნულად იდენტიფიცირებადი ინფორმაცია შეიძლება მოიცავდეს, მაგრამ არ შემოიფარგლება შემდეგით:\n\n
        - ელექტრონული ფოსტის მისამართი\n
        - სახელი და გვარი\n
        - მისამართი, სახელმწიფო, რეგიონი, ZIP/საფოსტო კოდი, ქალაქი\n
        - გამოყენების მონაცემები`,
      },
      {
        subtitle: "გამოყენების მონაცემები",
        content: `გამოყენების მონაცემები ავტომატურად იკრიბება სერვისის გამოყენებისას.\n\nგამოყენების მონაცემებში შეიძლება შედიოდეს ინფორმაცია, როგორიცაა თქვენი მოწყობილობის IP მისამართი (მაგალითად, IP მისამართი), ბრაუზერის ტიპი, ბრაუზერის ვერსია, ჩვენი სერვისის გვერდები, რომლებიც თქვენ ეწვიეთ, თქვენი ვიზიტის დრო და თარიღი, ამ გვერდებზე გატარებული დრო, უნიკალური მოწყობილობის იდენტიფიკატორები და სხვა დიაგნოსტიკური მონაცემები.\n\nროდესაც თქვენ წვდებით სერვისს მობილური მოწყობილობით ან მისი მეშვეობით, ჩვენ შეგვიძლია ავტომატურად შევაგროვოთ კონკრეტული ინფორმაცია, მათ შორის, მაგრამ არ შემოიფარგლება შემდეგით: მობილური მოწყობილობის ტიპი, თქვენი მობილური მოწყობილობის უნიკალური ID, მობილური მოწყობილობის ოპერაციული სისტემა, მობილური ინტერნეტის ბრაუზერის ტიპი, უნიკალური მოწყობილობის იდენტიფიკატორები და სხვა დიაგნოსტიკური მონაცემები.`,
      },
      {
        subtitle: "ინფორმაცია, რომელიც შეგროვებულია აპლიკაციის გამოყენებისას",
        content: `აპლიკაციის გამოყენებისას, ჩვენი აპლიკაციის ფუნქციების მიწოდების მიზნით, ჩვენ შეგვიძლია შევაგროვოთ თქვენი ნებართვით:\n\n
        - სურათები და სხვა ინფორმაცია თქვენი მოწყობილობის კამერიდან და ფოტოების ბიბლიოთეკიდან\n\n
        ეს ინფორმაცია გამოიყენება სერვისის ფუნქციების მიწოდების, გაუმჯობესებისა და მორგებისთვის. ინფორმაცია შეიძლება აიტვირთოს კომპანიის სერვერებზე ან/და მომსახურების მიმწოდებლის სერვერზე ან უბრალოდ შეინახოს თქვენს მოწყობილობაზე.\n\n
        თქვენ შეგიძლიათ jederzeit ჩართოთ ან გამორთოთ წვდომა ამ ინფორმაციაზე თქვენი მოწყობილობის პარამეტრებში.`,
      },
    ],
  },
  {
    title: "თქვენი პერსონალური მონაცემების გამოყენება",
    content: `კომპანია შეიძლება გამოიყენოს პერსონალური მონაცემები შემდეგი მიზნებისთვის:\n\n
    - სერვისის მიწოდება და მისი შენარჩუნება, მათ შორის სერვისის გამოყენების მონიტორინგი.\n
    - თქვენი ანგარიშის მართვა: სერვისის მომხმარებლად თქვენი რეგისტრაციის მართვა. თქვენს მიერ მოწოდებული პერსონალური მონაცემები საშუალებას გაძლევთ გამოიყენოთ სერვისის სხვადასხვა ფუნქციები, როგორც რეგისტრირებული მომხმარებელი.\n
    - კონტრაქტის შესრულება: შესყიდვის კონტრაქტის განვითარება, შესრულება და მართვა იმ პროდუქტებისთვის, ნივთებისთვის ან მომსახურებისთვის, რომლებიც თქვენ შეიძინეთ ან რომელზეც კონტრაქტი დადეთ ჩვენთან სერვისის მეშვეობით.\n
    - თქვენთან კონტაქტი: თქვენთან კონტაქტი ელექტრონული ფოსტით, სატელეფონო ზარებით, SMS-ით ან სხვა ელექტრონული კომუნიკაციის საშუალებებით, როგორიცაა მობილური აპლიკაციის push შეტყობინებები, განახლებების ან ფუნქციების შესახებ ინფორმაციის მიწოდების მიზნით.\n
    - თქვენთვის სიახლეების, სპეციალური შეთავაზებების და ჩვენი სხვა პროდუქტების, მომსახურებების და ღონისძიებების ზოგადი ინფორმაციის მიწოდება.`,
  },
  {
    title: "თქვენი პერსონალური მონაცემების უსაფრთხოება",
    content: `ჩვენთვის მნიშვნელოვანია თქვენი პერსონალური მონაცემების უსაფრთხოება, მაგრამ გახსოვდეთ, რომ გადაცემის ან ელექტრონული შენახვის მეთოდი 100%-ით უსაფრთხო არ არის. მიუხედავად იმისა, რომ ჩვენ ვცდილობთ დავიცვათ თქვენი მონაცემები კომერციულად მისაღები მეთოდებით, მათი სრული უსაფრთხოება არ შეგვიძლია გარანტიით.`,
  },
  {
    title: "დაგვიკავშირდით",
    content: `თუ გაქვთ კითხვები ამ კონფიდენციალურობის პოლიტიკის შესახებ, შეგიძლიათ დაგვიკავშირდეთ:\n\n
    - ელექტრონული ფოსტით: info@iqnight.app`,
  },
];

export const privacyPolicyContentRu = [
  {
    title: "Политика конфиденциальности",
    content: `Последнее обновление: 6 декабря 2024 г.\n\nЭта Политика конфиденциальности описывает нашу политику и процедуры в отношении сбора, использования и раскрытия вашей информации при использовании вами Сервиса, а также информирует вас о ваших правах на конфиденциальность и о том, как закон защищает вас.\n\nМы используем ваши персональные данные для предоставления и улучшения Сервиса. Используя Сервис, вы соглашаетесь на сбор и использование информации в соответствии с этой Политикой конфиденциальности.`,
  },
  {
    title: "Толкование и определения",
    subsections: [
      {
        subtitle: "Толкование",
        content: `Слова, первая буква которых написана с заглавной буквы, имеют значения, определенные при следующих условиях. Эти определения имеют одно и то же значение независимо от того, используются ли они в единственном или множественном числе.`,
      },
      {
        subtitle: "Определения",
        content: `Для целей настоящей Политики конфиденциальности:\n\n
        - **Аккаунт** означает уникальную учетную запись, созданную для вас для доступа к нашему Сервису или его частям.\n
        - **Аффилированное лицо** означает юридическое лицо, которое контролирует, находится под контролем или находится под общим контролем с другой стороной, где "контроль" означает владение 50% или более акциями, долями участия или другими ценными бумагами, дающими право голосовать при избрании директоров или другой управляющей структуры.\n
        - **Приложение** относится к IQ NIGHT, программному обеспечению, предоставленному Компанией.\n
        - **Компания** (в настоящем Соглашении именуемая "Компания", "Мы", "Нас" или "Наши") означает IQ NIGHT LLC, Тбилиси, Грузия, Лентехи II Переулок.\n
        - **Страна** относится к: Грузия\n
        - **Устройство** означает любое устройство, которое может получить доступ к Сервису, такое как компьютер, мобильный телефон или планшет.\n
        - **Персональные данные** означает любую информацию, относящуюся к идентифицированному или идентифицируемому физическому лицу.\n
        - **Сервис** относится к Приложению.\n
        - **Поставщик услуг** означает любое физическое или юридическое лицо, которое обрабатывает данные от имени Компании. Это относится к сторонним компаниям или лицам, нанятым Компанией для облегчения предоставления Сервиса, предоставления Сервиса от имени Компании, выполнения услуг, связанных с Сервисом, или для помощи Компании в анализе того, как используется Сервис.\n
        - **Данные об использовании** относятся к данным, которые собираются автоматически, либо генерируются при использовании Сервиса, либо от инфраструктуры Сервиса (например, продолжительность посещения страницы).\n
        - **Вы** означает физическое лицо, получающее доступ или использующее Сервис, или компанию, или другое юридическое лицо, от имени которого такое физическое лицо получает доступ или использует Сервис, в зависимости от обстоятельств.`,
      },
    ],
  },
  {
    title: "Сбор и использование ваших персональных данных",
    subsections: [
      {
        subtitle: "Типы собираемых данных",
        content: `Персональные данные\n\nПри использовании нашего Сервиса мы можем попросить вас предоставить нам определенную персональную информацию, которая может быть использована для связи с вами или для вашей идентификации. Персональная информация может включать, но не ограничивается следующим:\n\n
        - Адрес электронной почты\n
        - Имя и фамилия\n
        - Адрес, штат, область, почтовый индекс, город\n
        - Данные об использовании`,
      },
      {
        subtitle: "Данные об использовании",
        content: `Данные об использовании собираются автоматически при использовании Сервиса.\n\nДанные об использовании могут включать информацию, такую как IP-адрес вашего устройства (например, IP-адрес), тип браузера, версия браузера, страницы нашего Сервиса, которые вы посещаете, время и дата вашего визита, время, проведенное на этих страницах, уникальные идентификаторы устройства и другие диагностические данные.\n\nКогда вы получаете доступ к Сервису с помощью мобильного устройства или через него, мы можем автоматически собирать определенную информацию, включая, но не ограничиваясь этим: тип мобильного устройства, уникальный ID вашего мобильного устройства, IP-адрес вашего мобильного устройства, операционная система вашего мобильного устройства, тип мобильного интернет-браузера, уникальные идентификаторы устройства и другие диагностические данные.`,
      },
      {
        subtitle: "Информация, собираемая при использовании приложения",
        content: `При использовании нашего приложения для предоставления функций нашего приложения мы можем собирать с вашего предварительного разрешения:\n\n
        - Изображения и другую информацию из камеры вашего устройства и библиотеки фотографий\n\n
        Мы используем эту информацию для предоставления функций нашего Сервиса, для улучшения и настройки нашего Сервиса. Информация может быть загружена на серверы Компании и/или серверы Поставщика услуг или просто храниться на вашем устройстве.\n\n
        Вы можете включить или отключить доступ к этой информации в любое время через настройки вашего устройства.`,
      },
    ],
  },
  {
    title: "Использование ваших персональных данных",
    content: `Компания может использовать персональные данные для следующих целей:\n\n
    - Для предоставления и поддержания нашего Сервиса, включая мониторинг использования нашего Сервиса.\n
    - Для управления вашей учетной записью: управления вашей регистрацией в качестве пользователя Сервиса. Персональные данные, которые вы предоставляете, могут предоставить вам доступ к различным функциям Сервиса, доступным вам как зарегистрированному пользователю.\n
    - Для выполнения контракта: разработка, соблюдение и выполнение контракта на покупку продуктов, товаров или услуг, которые вы приобрели, или любого другого контракта с нами через Сервис.\n
    - Для связи с вами: для связи с вами по электронной почте, телефонным звонкам, SMS или другим аналогичным формам электронной связи, таким как push-уведомления мобильных приложений, относительно обновлений или информационных сообщений, связанных с функциями, продуктами или заключенными услугами, включая обновления безопасности, когда это необходимо или разумно для их реализации.\n
    - Для предоставления вам новостей, специальных предложений и общей информации о других товарах, услугах и событиях, которые мы предлагаем, аналогичных тем, которые вы уже приобрели или о которых вы спрашивали, если вы не отказались от получения такой информации.`,
  },
  {
    title: "Безопасность ваших персональных данных",
    content: `Безопасность ваших персональных данных важна для нас, но помните, что ни один метод передачи данных через Интернет или метод электронного хранения данных не является 100% безопасным. Несмотря на то, что мы стремимся использовать коммерчески приемлемые средства для защиты ваших персональных данных, мы не можем гарантировать их абсолютную безопасность.`,
  },
  {
    title: "Свяжитесь с нами",
    content: `Если у вас есть вопросы относительно этой Политики конфиденциальности, вы можете связаться с нами:\n\n
    - По электронной почте: info@iqnight.app`,
  },
];

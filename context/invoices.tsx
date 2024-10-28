import axios from "axios";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAppContext } from "./app";
import { useAuthContext } from "./auth";
import { useGameContext } from "./game";
/**
 * Invoices context state
 */
const Invoices = createContext<any>(null);

export const useInvoicesContext = () => useContext(Invoices);

interface contextProps {
  children: ReactNode;
}

export const InvoicesContextWrapper: React.FC<contextProps> = ({
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
   * Invoices state
   */
  const [totalInvoices, setTotalInvoices] = useState<any>(null);
  const [invoices, setInvoices] = useState<any>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const GetInvoices = async () => {
      try {
        const response = await axios.get(
          apiUrl + "/api/v1/users/" + currentUser._id + "/invoices?page=1"
        );
        if (response.data.status === "success") {
          setInvoices(response.data.data.invoices);
          setTotalInvoices(response.data.total);
          setPage(1);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    if (currentUser) {
      GetInvoices();
    }
  }, [currentUser]);

  /**
   * Add  Invoices
   */

  const AddInvoices = async () => {
    const newPage = page + 1;
    try {
      const response = await axios.get(
        apiUrl +
          "/api/v1/users/" +
          currentUser._id +
          "/invoices?page=" +
          newPage
      );
      if (response.data.status === "success") {
        let InvoicesList = response.data.data.invoices;

        setInvoices((prevInvoices: any) => {
          // Create a Map with existing Invoices using notificationId as the key
          const InvoicesMap = new Map(
            prevInvoices.map((invoice: any) => [invoice.id, invoice])
          );

          // Iterate over new Invoices and add them to the Map if they don't already exist
          InvoicesList.forEach((newInvoice: any) => {
            if (!InvoicesMap.has(newInvoice.id)) {
              InvoicesMap.set(newInvoice.id, newInvoice);
            }
          });

          // Convert the Map values back to an array
          const uniqueInvoices = Array.from(InvoicesMap.values());

          return uniqueInvoices;
        });

        setTotalInvoices(response.data.total);
        setPage(newPage);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  // clear Invoices
  const [loadingClearInvoices, setLoadingClearInvoices] = useState<any>(null);
  const [clearInvoicesState, setClearInvoicesState] = useState<any>(null);
  const ClearInvoices = async () => {
    try {
      setLoadingClearInvoices(true);
      const response = await axios.delete(
        apiUrl + "/api/v1/users/" + currentUser?._id + "/invoices"
      );

      if (response.data.status === "success") {
        setInvoices([]);
        setTotalInvoices(0);
        setClearInvoicesState(null);
        setLoadingClearInvoices(false);
      }
    } catch (error: any) {
      // console.log(error.response.data.message);
      setLoadingClearInvoices(false);
    }
  };

  return (
    <Invoices.Provider
      value={{
        invoices,
        setInvoices,
        AddInvoices,
        totalInvoices,
        setTotalInvoices,
        loadingClearInvoices,
        clearInvoicesState,
        ClearInvoices,
        setClearInvoicesState,
      }}
    >
      {children}
    </Invoices.Provider>
  );
};

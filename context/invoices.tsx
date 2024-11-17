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
  const [loading, setLoading] = useState(true);
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
          setTimeout(() => {
            setLoading(false);
          }, 200);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
        setLoading(false);
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
        const invoicesList = response.data.data.invoices;

        setInvoices((prevInvoices: any[]) => {
          // Create a Map with existing Invoices using invoice.id as the key
          const invoicesMap = new Map(
            prevInvoices.map((invoice) => [invoice.id, invoice])
          );

          // Iterate over new invoices and add them to the Map if they don't already exist
          invoicesList.forEach((newInvoice: any) => {
            if (!invoicesMap.has(newInvoice.id)) {
              invoicesMap.set(newInvoice.id, newInvoice);
            }
          });

          // Convert the Map values back to an array
          return Array.from(invoicesMap.values());
        });

        setTotalInvoices(response.data.total);
        setPage(newPage);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  console.log(page);

  console.log("total: " + invoices?.length);

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
        loading,
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

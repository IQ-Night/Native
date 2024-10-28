import { useEffect, useState } from "react";

const useDealingCardsTimer = ({ socket }: any) => {
  const [dealingCardsTimer, setDealingCardsTimer] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("DealingCardsTimerUpdate", (timeLeft: any) => {
        setDealingCardsTimer(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("DealingCardsTimerUpdate");
      }
    };
  }, [socket]);
  return { dealingCardsTimer };
};

export default useDealingCardsTimer;

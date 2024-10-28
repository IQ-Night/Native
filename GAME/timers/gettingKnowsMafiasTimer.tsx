import { useEffect, useState } from "react";

const useGettingKnowsMafias = ({ socket }: { socket: any }) => {
  const [gettingKnowsMafiasTimer, setGettingKnowsMafiaTimer] =
    useState<number>(0);

  useEffect(() => {
    if (socket) {
      socket.on("GettingKnowMafiasTimerUpdate", (timeLeft: number) => {
        setGettingKnowsMafiaTimer(timeLeft);
      });
    }

    return () => {
      if (socket) {
        socket.off("GettingKnowMafiasTimerUpdate");
      }
    };
  }, [socket]);

  return { gettingKnowsMafiasTimer };
};

export default useGettingKnowsMafias;

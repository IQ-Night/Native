import { useEffect, useState } from "react";

const NightTimer = ({ socket }: any) => {
  const [nightTimer, setNightTimer] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("NightTimerUpdate", (timeLeft: any) => {
        setNightTimer(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("NightTimerUpdate");
      }
    };
  }, [socket]);
  return { nightTimer };
};

export default NightTimer;

import { useEffect, useState } from "react";

const CommonTimer = ({ socket }: any) => {
  const [commonTimer, setCommonTimer] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("CommonTimerUpdate", (timeLeft: any) => {
        setCommonTimer(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("CommonTimerUpdate");
      }
    };
  }, [socket]);
  return { commonTimer };
};

export default CommonTimer;

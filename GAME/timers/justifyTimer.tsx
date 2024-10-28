import { useEffect, useState } from "react";

const JustifyTimer = ({ socket }: any) => {
  const [justifyTimer, setJustifyTimer] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("JustifyTimerUpdate", (timeLeft: any) => {
        setJustifyTimer(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("JustifyTimerUpdate");
      }
    };
  }, [socket]);
  return { justifyTimer, setJustifyTimer };
};

export default JustifyTimer;

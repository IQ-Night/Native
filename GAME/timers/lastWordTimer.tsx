import { useEffect, useState } from "react";

const LastWordTimer = ({ socket }: any) => {
  const [lastWordTimer, setLastWordTimer] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("LastWordTimerUpdate", (timeLeft: any) => {
        setLastWordTimer(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("LastWordTimerUpdate");
      }
    };
  }, [socket]);
  return { lastWordTimer };
};

export default LastWordTimer;

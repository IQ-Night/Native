import { useEffect, useState } from "react";

const SpeechTimer = ({ socket }: any) => {
  const [speechTimer, setSpeechTimer] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("SpeechTimerUpdate", (timeLeft: any) => {
        setSpeechTimer(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("SpeechTimerUpdate");
      }
    };
  }, [socket]);
  return { speechTimer };
};

export default SpeechTimer;

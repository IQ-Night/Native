import { useEffect, useState } from "react";

const JustifyTimer2 = ({ socket }: any) => {
  const [justifyTimer2, setJustifyTimer2] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("JustifyTimer2Update", (timeLeft: any) => {
        console.log("timeLeft: " + timeLeft);
        setJustifyTimer2(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("JustifyTimer2Update");
      }
    };
  }, [socket]);
  return { justifyTimer2, setJustifyTimer2 };
};

export default JustifyTimer2;

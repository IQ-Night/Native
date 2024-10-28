import { useEffect, useState } from "react";

const PeopleDecide = ({ socket }: any) => {
  const [peopleDecide, setPeopleDecide] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("PeopleDecideTimerUpdate", (timeLeft: any) => {
        setPeopleDecide(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("PeopleDecideTimerUpdate");
      }
    };
  }, [socket]);
  return { peopleDecide };
};

export default PeopleDecide;

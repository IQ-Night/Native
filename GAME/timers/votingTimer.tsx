import { useEffect, useState } from "react";

const VotingTimer = ({ socket }: any) => {
  const [votingTimer, setVotingTimer] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("VotingTimerUpdate", (timeLeft: any) => {
        setVotingTimer(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("VotingTimerUpdate");
      }
    };
  }, [socket]);
  return { votingTimer };
};

export default VotingTimer;

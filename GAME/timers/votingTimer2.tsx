import { useEffect, useState } from "react";

const VotingTimer2 = ({ socket }: any) => {
  const [votingTimer2, setVotingTimer2] = useState(0);

  useEffect(() => {
    if (socket) {
      // თაიმერის განახლება
      socket.on("VotingTimer2Update", (timeLeft: any) => {
        setVotingTimer2(timeLeft);
      });
    }

    // თაიმერის გასუფთავება როდესაც კომპონენთი ჩაქრება
    return () => {
      if (socket) {
        socket.off("VotingTimer2Update");
      }
    };
  }, [socket]);
  return { votingTimer2 };
};

export default VotingTimer2;

import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

const BanTimer = ({ duration, createdAt, afterExpire }: any) => {
  const banDuration = duration * 60 * 60 * 1000; // Duration in milliseconds
  const [remainingTime, setRemainingTime] = useState(banDuration);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const expirationTime = new Date(createdAt).getTime() + banDuration;

    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = expirationTime - now;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        setIsExpired(true);
        setRemainingTime(0);
        afterExpire();
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [banDuration, createdAt]);

  const formatTime = (ms: number) => {
    const seconds = String(Math.floor((ms / 1000) % 60)).padStart(2, "0");
    const minutes = String(Math.floor((ms / (1000 * 60)) % 60)).padStart(
      2,
      "0"
    );
    const hours = String(Math.floor((ms / (1000 * 60 * 60)) % 24)).padStart(
      2,
      "0"
    );
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <Text style={styles.timerText}>
      {isExpired ? "Ban has expired!" : `${formatTime(remainingTime)}`}
    </Text>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default BanTimer;

import React, { useEffect, useState } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { View, Text } from "react-native";

const BgSound = () => {
  const [sound, setSound] = useState<any>(null);

  // Load and play the background sound when the BgSound starts
  const playBackgroundSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/The Godfather Theme Song.mp3"), // Path to your sound file
        {
          shouldPlay: true, // Automatically play the sound
          isLooping: true, // Loop the background sound
        }
      );

      setSound(sound);
      await sound.setVolumeAsync(0.1);
      await sound.playAsync(); // Play the sound
    } catch (error) {
      console.log("Error loading or playing sound", error);
    }
  };

  // Stop the sound and clean up when the component unmounts
  const stopBackgroundSound = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync(); // Unload sound from memory
      } catch (error) {
        console.log("Error stopping or unloading sound", error);
      }
    }
  };

  // useEffect(() => {
  //   playBackgroundSound();

  //   // Cleanup the sound on component unmount
  //   return () => {
  //     stopBackgroundSound();
  //   };
  // }, []);
  return;
};

export default BgSound;

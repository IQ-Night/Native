import React, { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { View } from "react-native";

const BgSound = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

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
      await sound.setVolumeAsync(0.1); // Set the volume (optional)
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

  useEffect(() => {
    playBackgroundSound();

    // Cleanup the sound on component unmount
    return () => {
      stopBackgroundSound();
    };
  }, []); // Empty dependency array to run only once on mount/unmount

  // Return an empty view or null since this component only handles audio
  return <View />; // Or you could return null if you don't want to render anything
};

export default BgSound;

import { FontAwesome5 } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useAppContext } from "../context/app";
import Img from "./image";

/**
 * input cover image component on ios
 */

async function readImageData(uri: any) {
  try {
    const binaryData = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const base64Data = `data:image/jpeg;base64,${binaryData}`;
    return base64Data;
  } catch (err) {
    console.log("Failed to read image data:", err);
    return null;
  }
}

const InputFile = ({ file, setFile, style }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme } = useAppContext();

  //resize image
  const ResizeAndCompressImage = async (
    uri: any,
    originalWidth: any,
    originalHeight: any
  ) => {
    const wdth = 300;
    const newMobHeight = (originalHeight / originalWidth) * wdth;
    try {
      const cover = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: wdth,
              height: newMobHeight,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const coverImageData = await readImageData(cover.uri);

      setFile({ ...cover, base64: coverImageData });
    } catch (err) {
      console.log("Failed to resize image:", err);
      return uri;
    }
  };

  const selectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      await ResizeAndCompressImage(
        result.assets[0].uri,
        result.assets[0].width,
        result.assets[0].height
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        style
          ? style
          : {
              width: 180,
              height: 180,
              borderRadius: 10,
            },
      ]}
    >
      {file?.uri ? (
        <Pressable
          onPress={selectImage}
          style={
            style
              ? { ...style }
              : {
                  width: 180,
                  height: 180,
                  borderRadius: 10,
                }
          }
        >
          <Img
            uri={file.uri} // Ensure the uri is passed correctly here
          />
        </Pressable>
      ) : (
        <FontAwesome5
          onPress={selectImage}
          name="image"
          color={theme.text}
          size={style ? style?.width / 2 : 64}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  button: {
    width: 110,
    height: 110,
    borderRadius: 100,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default InputFile;

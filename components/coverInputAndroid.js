import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BackDrop } from "./backDropLoader";
import { storage } from "../firebase";
import { setCleanUp, setRerenderCurrentUser } from "../redux/rerenders";

/**
 * Input cover image for android
 */

const InputFile = ({ targetUser }) => {
  const [file, setFile] = useState(null);

  const dispatch = useDispatch();
  //resize image
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Sorry, we need camera roll permissions to make this work!"
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
      base64: true, // This option will return base64 data
    });

    if (result.assets) {
      let newWidth = 500;
      let newHeight =
        (newWidth / result.assets[0].width) * result.assets[0].height;

      const resizedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: newWidth, height: newHeight } }],
        { format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      setFile({
        uri: resizedImage.uri,
        base64: result.assets[0]?.base64,
      });
    }
  };

  const [loading, setLoading] = useState(false);

  async function uriToBlob(uri) {
    if (Platform.OS === "android" || Platform.OS === "ios") {
      const response = await fetch(uri);
      return await response.blob();
    }
  }

  const backendUrl = useSelector((state) => state.storeApp.backendUrl);

  async function FileUpload() {
    /* aadd cover
     */
    if (file == null) return;
    if (file != null) {
      setLoading(true);
      // add in storage
      const imageRef = ref(storage, `images/${targetUser?._id}/cover`);

      const coverBlob = await uriToBlob(file?.uri);
      await uploadBytes(imageRef, coverBlob).then((snapshot) => {
        getDownloadURL(snapshot.ref)
          .then((url) => {
            const UploadCover = async () => {
              const response = await axios.patch(
                `${backendUrl}/api/v1/users/${targetUser?._id}`,
                {
                  cover: url,
                }
              );
            };
            if (url) {
              UploadCover();
            }
            dispatch(setRerenderCurrentUser());
            dispatch(setCleanUp());
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  }

  React.useEffect(() => {
    FileUpload();
  }, [file]);

  return (
    <View style={styles.container}>
      <BackDrop loading={loading} setLoading={setLoading} />
      <TouchableOpacity
        onPress={pickImage}
        style={styles.button}
      ></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 110,
    height: 110,
    borderRadius: 100,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  preview: {
    width: 300,
    height: 300,
  },
});

export default InputFile;

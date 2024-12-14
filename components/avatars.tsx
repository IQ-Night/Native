import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "../context/app";
import InputFile from "./fileInput";
import Img from "./image";
import { BlurView } from "expo-blur";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useAuthContext } from "../context/auth";
import { storage } from "../firebase";
import Button from "./button";
import CheckboxWithLabel from "./checkBox";
import Input from "./input";
import { useNavigation } from "@react-navigation/native";
import BuyItem from "../screens/screen-store/buyItem";
import { useContentContext } from "../context/content";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Avatars = ({
  state,
  setState,
  type,
  file,
  setFile,
  onChange,
  item,
}: any) => {
  /**
   * App context
   */
  const { theme, apiUrl, haptics, activeLanguage } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Avatars
   */

  const [avatars, setAvatars] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [openAddForSale, setOpenAddForSale] = useState(false);
  const [addForSale, setAddForSale] = useState(false);
  const [salePrice, setSalePrice] = useState<any>(0);

  //Get Products
  const GetAvatars = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        apiUrl + "/api/v1/products?type=" + type
      );
      if (response.data.status === "success") {
        setAvatars(response.data.data.products);
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAvatars();
  }, [type]);

  /* add file in cloud
   */

  const [uploader, setUploader] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  async function HandleUpload() {
    setUploadLoading(true);
    async function uriToBlob(uri: any) {
      if (Platform.OS === "android" || Platform.OS === "ios") {
        const response = await fetch(uri);
        return await response.blob();
      }
    }

    if (file == null) return;
    if (file != null) {
      setUploader(true);
      // add in storage

      const pathName = `avatar-${new Date()}`;
      const imageRef = ref(storage, `products/${pathName}`);

      const fileBlob = await uriToBlob(file?.base64);

      if (fileBlob) {
        await uploadBytesResumable(imageRef, fileBlob).then((snapshot: any) => {
          getDownloadURL(snapshot.ref)
            .then((url) => {
              const UploadCover = async () => {
                const response = await axios.post(`${apiUrl}/api/v1/products`, {
                  title: "Avatar",
                  pathName: pathName,
                  type: [type],
                  price: salePrice,
                  file: url,
                  owners: [currentUser?._id],
                  founder: {
                    type: "User",
                    userId: currentUser?._id,
                    cover: currentUser?.cover,
                    name: currentUser?.name,
                  },
                  status: addForSale ? "for sale" : "not for sale",
                });

                if (response.data.status === "success") {
                  setAvatars((prev: any) => [
                    response.data.data.product,
                    ...prev,
                  ]);
                  setFile(null);
                  setUploadLoading(false);
                  setAddForSale(false);
                  setOpenAddForSale(false);
                }
              };
              if (url) {
                UploadCover();
              }
              setUploader(false);
            })
            .catch((error) => {
              console.log(error);
              setUploadLoading(false);
            });
        });
      }
    }
  }

  /**
   * buy item
   */

  const [openBuyItem, setOpenBuyItem] = useState(null);
  return (
    <>
      {openAddForSale && (
        <BlurView
          intensity={120}
          tint="dark"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 90,
          }}
        >
          <Pressable
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              flex: 1,
              gap: 40,
              padding: 12,
            }}
            onPress={() => Keyboard.dismiss()}
          >
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: 600 }}>
              {activeLanguage?.confirmUpload}
            </Text>
            <View style={{ gap: 8, height: 200, paddingHorizontal: 12 }}>
              <CheckboxWithLabel
                isChecked={addForSale}
                setIsChecked={setAddForSale}
                label={activeLanguage?.addForSale}
              />
              <Text
                style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
              >
                {activeLanguage?.addForSaleText}
              </Text>
              {addForSale && (
                <View style={{ marginTop: 8, gap: 8 }}>
                  <Text
                    style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
                  >
                    {activeLanguage?.price}{" "}
                    <FontAwesome5 name="coins" size={14} color="orange" />
                  </Text>

                  <Input
                    placeholder="0"
                    onChangeText={setSalePrice}
                    type="numeric"
                    value={salePrice}
                    returnKeyType="default"
                  />
                </View>
              )}
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Button
                title={activeLanguage?.cancel}
                onPressFunction={() => setOpenAddForSale(false)}
                style={{
                  width: "45%",
                  backgroundColor: "#444",
                  color: "white",
                }}
              />

              <Button
                loading={uploadLoading}
                title={activeLanguage?.confirm}
                onPressFunction={HandleUpload}
                style={{
                  width: "45%",
                  backgroundColor: theme.active,
                  color: "white",
                }}
              />
            </View>
          </Pressable>
        </BlurView>
      )}
      {!currentUser?.editOptions?.paidForCover && type === "profile-avatar" && (
        <Text style={{ color: theme.text, fontWeight: 600, marginVertical: 6 }}>
          {activeLanguage?.first_avatar_change} 1500{" "}
          <FontAwesome5 name="coins" size={14} color={theme.active} />
        </Text>
      )}
      {item?.price.cover < 1 && type === "clan-avatar" && (
        <Text style={{ color: theme.text, fontWeight: 600, marginVertical: 6 }}>
          {activeLanguage?.first_avatar_change} 2000{" "}
          <FontAwesome5 name="coins" size={14} color={theme.active} />
        </Text>
      )}
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.gridContainer}
      >
        {!loading && (
          <View
            style={{
              width: (SCREEN_WIDTH - 40) / 3,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 10,
            }}
          >
            <InputFile
              setFile={(e: any) => setFile(e)}
              file={file}
              style={{
                width: (SCREEN_WIDTH - 40) / 3,
                aspectRatio: 1,
                borderRadius: 10,
                overflow: "hidden",
              }}
            />
            {uploader && (
              <View
                style={{
                  position: "absolute",
                  zIndex: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  width: (SCREEN_WIDTH - 40) / 3,
                  aspectRatio: 1,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <BlurView
                  intensity={10}
                  tint="dark"
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: (SCREEN_WIDTH - 40) / 3,
                    aspectRatio: 1,
                  }}
                >
                  <ActivityIndicator size={24} color={theme.active} />
                </BlurView>
              </View>
            )}
            {file && (
              <Pressable
                onPress={() => {
                  if (haptics) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                  }
                  setOpenAddForSale(true);
                }}
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  zIndex: 60,
                  backgroundColor: theme.active,
                  borderRadius: 50,
                  padding: 6,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: "white", fontWeight: 500, fontSize: 12 }}>
                  {activeLanguage?.upload}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {loading ? (
          <View style={{ width: "100%", alignItems: "center" }}>
            <ActivityIndicator
              size={32}
              color={theme.active}
              style={{ marginTop: 48 }}
            />
          </View>
        ) : (
          avatars.map((item: any, index: number) => {
            return (
              <Item
                key={index}
                item={item}
                state={state}
                setState={setState}
                setAvatars={setAvatars}
                setOpenBuyItem={setOpenBuyItem}
                onChange={onChange}
              />
            );
          })
        )}
      </ScrollView>
      {openBuyItem && (
        <BuyItem
          item={openBuyItem}
          closeComponent={() => setOpenBuyItem(null)}
          setState={setAvatars}
        />
      )}
    </>
  );
};

const Item = ({
  item,
  state,
  setState,
  setAvatars,
  setOpenBuyItem,
  onChange,
}: any) => {
  const { theme, haptics, activeLanguage } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();
  const navigation: any = useNavigation();
  /**
   * Content context
   */
  const { setConfirmAction } = useContentContext();
  return (
    <Pressable
      onPress={() => {
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        if (
          item?.owners?.find((o: any) => o === currentUser?._id) ||
          item?.price === 0
        ) {
          if (setState) {
            setState((prev: any) => ({ ...prev, cover: item.file }));
          } else {
            setConfirmAction({
              active: true,
              text: activeLanguage?.first_avatar_change,
              price: currentUser?.editOptions?.paidForCover ? 0 : 1500,
              Function: () => onChange(item.file),
            });
          }
        } else {
          setOpenBuyItem(item);
        }
      }}
      style={[
        styles.gridItem,
        { opacity: item.file === state?.cover ? 1 : 0.4 },
      ]}
    >
      <Img uri={item.file} />

      {item.owner === currentUser?._id && (
        <Pressable
          onPress={() => {
            if (haptics) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
            }
            setAvatars((prev: any) => prev.filter((a: any) => a !== item));
          }}
          style={{ position: "absolute", top: 8, right: 8, zIndex: 50 }}
        >
          <MaterialIcons name="close" size={24} color={"red"} />
        </Pressable>
      )}
      {item.file === state?.cover && (
        <MaterialIcons
          name="done"
          size={24}
          color={theme.active}
          style={{ position: "absolute", bottom: 8, right: 8, zIndex: 70 }}
        />
      )}
      {item?.founder?.userId !== currentUser?._id && (
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.4,
            shadowRadius: 2,
            // Elevation for Android
            elevation: 4,
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 60,
            width: 24,
            height: 24,
          }}
        >
          <Pressable
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              const founder = item?.founder;
              navigation.navigate("User", {
                item: { ...founder, _id: founder?.userId },
              });
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 100,
              overflow: "hidden",
            }}
          >
            <Img uri={item.founder.cover} />
          </Pressable>
        </View>
      )}
      {item.price > 0 &&
        !item?.owners?.find((o: any) => o === currentUser?._id) && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              position: "absolute",
              bottom: 8,
              left: 8,
              backgroundColor: theme.active,
              borderRadius: 10,
              padding: 2,
              paddingHorizontal: 8,
            }}
          >
            <FontAwesome5 name="coins" size={12} color="white" />
            <Text
              style={{
                color: "white",
                marginLeft: 4,
                fontWeight: "500",
                fontSize: 12,
              }}
            >
              {item.price}
            </Text>
          </View>
        )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
    paddingHorizontal: 12,
    width: "100%",
  },
  gridItem: {
    width: (SCREEN_WIDTH - 40) / 3, // Divide the screen width by 2 for two columns, with padding
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
  },
});

export default Avatars;

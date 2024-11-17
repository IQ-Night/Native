import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../../context/app";
import axios from "axios";
import { useAuthContext } from "../../../context/auth";
import Avatars from "../../../components/avatars";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import Img from "../../../components/image";
import * as Haptics from "expo-haptics";
import InputFile from "../../../components/fileInput";
import { BlurView } from "expo-blur";
import { ActivityIndicator } from "react-native-paper";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase";
import Button from "../../../components/button";
import Input from "../../../components/input";
import CheckboxWithLabel from "../../../components/checkBox";
import EditProduct from "../../../admin/products/editProduct";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Assets = () => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics } = useAppContext();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  // assets
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any>([]);

  const GetAssets = async () => {
    try {
      const response = await axios.get(
        apiUrl + "/api/v1/products/user/" + currentUser?._id
      );
      if (response?.data?.status === "success") {
        setAssets(response.data.data.products);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  useEffect(() => {
    GetAssets();
  }, []);

  // file
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<any>(null);
  const [openAddForSale, setOpenAddForSale] = useState(false);
  const [addForSale, setAddForSale] = useState(false);
  const [salePrice, setSalePrice] = useState<any>(0);
  const [type, setType] = useState([]);

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
                  title: title,
                  pathName: pathName,
                  type: type,
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
                  setAssets((prev: any) => [
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
   * product types
   */
  const types = [
    {
      value: "profile-avatar",
      label: "Profile Avatar",
    },
    {
      value: "room-avatar",
      label: "Room Avatar",
    },
    {
      value: "clan-avatar",
      label: "Clan Avatar",
    },
  ];

  // edit product
  const [editProduct, setEditProduct] = useState(null);
  const translateYEditProduct = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  useEffect(() => {
    if (editProduct) {
      Animated.timing(translateYEditProduct, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {});
    }
  }, [editProduct, translateYEditProduct]);

  const closePopup = () => {
    Animated.timing(translateYEditProduct, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setEditProduct(null));
  };

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
            paddingHorizontal: 12,
          }}
        >
          <Pressable
            style={{
              alignItems: "center",
              width: "100%",
              flex: 1,
              gap: 24,
              padding: 12,
              paddingTop: 48,
            }}
            onPress={() => Keyboard.dismiss()}
          >
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: 600 }}>
              Confirm upload
            </Text>
            <View style={{ gap: 8, width: "100%" }}>
              <Text style={[styles.title, { color: theme.text }]}>Title*</Text>
              <Input
                placeholder="Enter Product's Title"
                value={title}
                onChangeText={setTitle}
                type="text"
              />
            </View>
            <View style={{ width: "100%", gap: 8 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: theme.text,
                  marginBottom: 4,
                }}
              >
                Select Type*
              </Text>

              <View style={{ gap: 8 }}>
                {types.map((item: any, index: number) => {
                  return (
                    <Pressable
                      onPress={() => {
                        if (haptics) {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }
                        setType((prev: any) => {
                          // Ensure `type` is an array to prevent runtime errors
                          const currentTypes = prev || [];

                          if (currentTypes.includes(item.value)) {
                            // Remove `item.value` if it exists in the array
                            return currentTypes?.filter(
                              (i: any) => i !== item.value
                            );
                          } else {
                            // Add `item.value` if it doesn’t exist in the array
                            return [...prev, item.value];
                          }
                        });
                      }}
                      style={styles.button}
                      key={index}
                    >
                      <Text
                        style={{
                          color: type.find((t: any) => t === item.value)
                            ? theme.active
                            : theme.text,
                          fontWeight: 600,
                        }}
                      >
                        {item.label}
                      </Text>
                      {type === item.value && (
                        <MaterialIcons
                          name="done"
                          size={16}
                          color={theme.active}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={{ gap: 8, marginBottom: 24, paddingHorizontal: 12 }}>
              <CheckboxWithLabel
                isChecked={addForSale}
                setIsChecked={setAddForSale}
                label="Add for sale"
              />
              <Text
                style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
              >
                You can sale your asset to people.
              </Text>
              {addForSale && (
                <View style={{ marginTop: 8, gap: 8 }}>
                  <Text
                    style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
                  >
                    Price <FontAwesome5 name="coins" size={14} color="orange" />
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
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Button
                title="Cancel"
                onPressFunction={() => setOpenAddForSale(false)}
                style={{
                  width: "50%",
                  backgroundColor: "#444",
                  color: "white",
                }}
              />

              <Button
                loading={uploadLoading}
                title="Confirm"
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
                  Upload Image
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
          assets.map((item: any, index: number) => {
            return (
              <Item key={index} item={item} setEditProduct={setEditProduct} />
            );
          })
        )}
      </ScrollView>
      <Animated.View
        style={[
          styles.screen,
          {
            transform: [{ translateY: translateYEditProduct }],
          },
        ]}
      >
        <EditProduct
          closePopup={closePopup}
          setProducts={setAssets}
          item={editProduct}
        />
      </Animated.View>
    </>
  );
};

const Item = ({ item, setEditProduct, state, setAvatars }: any) => {
  const { theme, haptics } = useAppContext();
  const navigation: any = useNavigation();
  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  return (
    <Pressable
      onPress={() => {
        if (haptics) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
        setEditProduct(item);
      }}
      style={styles.gridItem}
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
          style={{ position: "absolute", top: 8, right: 8, zIndex: 50 }}
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

export default Assets;

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
  title: {
    fontWeight: "500",
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
  },
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 50,
    paddingBottom: 96,
  },
});

import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "../../components/button";
import InputFile from "../../components/fileInput";
import Input from "../../components/input";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { storage } from "../../firebase";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CreateProduct = ({ setCreateProduct, setProducts }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics, activeLanguage } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  // styles
  const styles = createStyles(theme);

  /**
   * Open popup
   */
  const [openPopup, setOpenPopup] = useState("");

  /**
   * Creat Product State
   */
  const [productState, setProductState] = useState<any>({
    title: "",
    type: [],
    file: null,
    path: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  /**
   * product types
   */
  const types = [
    {
      value: "profile-avatar",
      label: activeLanguage?.profileAvatar,
    },
    {
      value: "room-avatar",
      label: activeLanguage?.roomAvatar,
    },
    {
      value: "clan-avatar",
      label: activeLanguage?.clanAvatar,
    },
  ];

  /** Upload Product */

  async function HandleCreateProduct() {
    async function uriToBlob(uri: any) {
      if (Platform.OS === "android" || Platform.OS === "ios") {
        const response = await fetch(uri);
        return await response.blob();
      }
    }
    /* add file in cloud
     */
    if (productState.file == null) return;
    if (productState.file != null) {
      setLoading(true);
      // add in storage
      const pathName = productState.title + new Date();
      const imageRef = ref(storage, `products/${pathName}`);

      const fileBlob = await uriToBlob(productState.file?.base64);

      if (fileBlob) {
        await uploadBytesResumable(imageRef, fileBlob).then((snapshot: any) => {
          getDownloadURL(snapshot.ref)
            .then((url) => {
              const UploadCover = async () => {
                try {
                  const response = await axios.post(
                    `${apiUrl}/api/v1/products`,
                    {
                      title: productState.title,
                      pathName: pathName,
                      type: productState.type,
                      price: productState.price,
                      newPrice: productState.newPrice,
                      file: url,
                      founder: {
                        type: "Admin",
                        userId: currentUser?._id,
                        cover: currentUser?.cover,
                        name: currentUser?.name,
                      },
                      owners: [currentUser?._id],
                      status: "for sale",
                    }
                  );
                  if (response.data.status === "success") {
                    setCreateProduct(false);
                    setProducts((prev: any) => [
                      response.data.data.product,
                      ...prev,
                    ]);
                    setProductState({
                      title: "",
                      type: [],
                      file: null,
                      path: "",
                      price: 0,
                    });
                  }
                } catch (error: any) {
                  console.log(error.response.data.message);
                }
              };
              if (url) {
                UploadCover();
              }
              setLoading(false);
            })
            .catch((error) => {
              console.log(error);
            });
        });
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: "100%" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <BlurView intensity={120} tint="dark" style={styles.container}>
        <BlurView intensity={120} tint="dark" style={styles.header}>
          <Text style={{ color: theme.active, fontSize: 18, fontWeight: 500 }}>
            {activeLanguage?.create_product}
          </Text>
          <Ionicons
            onPress={() => {
              if (haptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
              }
              setCreateProduct(false);
            }}
            name="caret-down-outline"
            color={theme.text}
            size={24}
          />
        </BlurView>
        <ScrollView
          style={{ paddingHorizontal: 12, paddingTop: 64 }}
          contentContainerStyle={{ gap: 16, paddingBottom: 160 }}
        >
          <View style={{ width: "100%", flex: 1, gap: 8 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: theme.text,
                marginBottom: 4,
              }}
            >
              {activeLanguage?.select_type}*
            </Text>

            <View style={{ gap: 8 }}>
              {types.map((item: any, index: number) => {
                return (
                  <Pressable
                    onPress={() => {
                      if (haptics) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                      }

                      setProductState((prev: any) => {
                        // Ensure `type` is an array to prevent runtime errors
                        const currentTypes = prev?.type || [];

                        if (currentTypes.includes(item.value)) {
                          // Remove `item.value` if it exists in the array
                          return {
                            ...prev,
                            type: currentTypes.filter(
                              (i: any) => i !== item.value
                            ),
                          };
                        } else {
                          // Add `item.value` if it doesn’t exist in the array
                          return {
                            ...prev,
                            type: [...currentTypes, item.value],
                          };
                        }
                      });
                    }}
                    style={styles.button}
                    key={index}
                  >
                    <Text
                      style={{
                        color: productState.type.find(
                          (t: any) => t === item.value
                        )
                          ? theme.active
                          : theme.text,
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </Text>
                    {productState.type === item.value && (
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
          <View style={{ gap: 8 }}>
            <Text style={styles.title}>{activeLanguage?.title}*</Text>
            <Input
              placeholder={activeLanguage?.title}
              value={productState.title}
              onChangeText={(text: string) =>
                setProductState((prev: any) => ({ ...prev, title: text }))
              }
              type="text"
            />
          </View>
          <View style={{ gap: 8 }}>
            <Text style={styles.title}>{activeLanguage?.avatar}*</Text>
            {/* <FontAwesome5 name="image" color={theme.text} size={64} /> */}
            <InputFile
              setFile={(e: any) =>
                setProductState((prev: any) => ({ ...prev, file: e }))
              }
              file={productState.file}
            />
          </View>
          <View style={{ gap: 8 }}>
            <View
              style={{ alignItems: "center", gap: 4, flexDirection: "row" }}
            >
              <FontAwesome5 name="coins" size={14} color={theme.active} />
              <Text style={styles.title}>{activeLanguage?.price}</Text>
            </View>
            <Input
              placeholder={activeLanguage?.price}
              value={productState.price}
              onChangeText={(text: string) =>
                setProductState((prev: any) => ({ ...prev, price: text }))
              }
              type="numeric"
            />
          </View>

          <Button
            title={activeLanguage?.create}
            loading={loading}
            style={{
              width: "100%",
              backgroundColor: theme.active,
              color: "white",
            }}
            disabled={
              !productState?.file ||
              activeLanguage?.title?.length < 3 ||
              activeLanguage?.type?.length < 1
            }
            onPressFunction={HandleCreateProduct}
          />
        </ScrollView>
      </BlurView>
    </KeyboardAvoidingView>
  );
};

export default CreateProduct;

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: "100%",
      zIndex: 20,
    },
    header: {
      width: "100%",
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      position: "absolute",
      top: 0,
      zIndex: 20,
    },

    title: {
      color: theme.text,
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
    image: {
      width: 100,
      height: 100,
      resizeMode: "cover",
      borderRadius: 6,
    },
  });

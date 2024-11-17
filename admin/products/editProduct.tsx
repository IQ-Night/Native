import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { BlurView } from "expo-blur";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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
import _ from "lodash";
import Img from "../../components/image";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const EditProduct = ({ closePopup, setProducts, item }: any) => {
  /**
   * App context
   */
  const { apiUrl, theme, haptics } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  // styles
  const styles = createStyles(theme);

  /**
   * Creat Product State
   */
  const [oldState, setOldState] = useState<any>(item);
  const [productState, setProductState] = useState<any>(item);

  useEffect(() => {
    setOldState(item);
    setProductState(item);
  }, [item]);

  const [loading, setLoading] = useState(false);

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

  /** Upload Product */

  async function HandleEditProduct() {
    const UploadCover = async () => {
      setLoading(true);
      try {
        const response = await axios.patch(
          `${apiUrl}/api/v1/products/${item?._id}`,
          {
            ...productState,
          }
        );
        if (response.data.status === "success") {
          closePopup();
          setProducts((prev: any) => [
            response.data.data.product,
            ...prev?.filter(
              (p: any) => p?._id !== response.data.data.product?._id
            ),
          ]);
          setLoading(false);
        }
      } catch (error: any) {
        console.log(error.response.data.message);
        setLoading(false);
      }
    };

    UploadCover();
  }

  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  // Animation for confirmation popup
  const slideAnim = useRef(new Animated.Value(300)).current; // Start off-screen

  const openDeleteConfirm = ({ p }: any) => {
    setDeleteConfirm(p);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeDeleteConfirm = () => {
    Animated.timing(slideAnim, {
      toValue: 300, // Slide back down
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setDeleteConfirm(null));
  };

  /**
   * Remove item
   */
  const [loadingDelete, setLoadingDelete] = useState(false);
  const Remove = async () => {
    try {
      setLoadingDelete(true);

      // Send request to delete from API
      const response = await axios.delete(
        `${apiUrl}/api/v1/products/${deleteConfirm?._id}?currentUserId=${currentUser?._id}`
      );

      if (response.data.status === "success") {
        // Define the path in Firebase Storage
        const path = `products/${deleteConfirm?.pathName}`;
        const fileRef = ref(storage, path); // Create reference

        if (deleteConfirm?.owners?.length === 1) {
          try {
            // Attempt to delete the file from Firebase Storage
            await deleteObject(fileRef);
            console.log("File successfully deleted from Firebase storage");
          } catch (storageError) {
            console.error("Firebase Storage delete error:", storageError);
          }
        }
        setProducts((prev: any) =>
          prev?.filter((p: any) => p?._id !== deleteConfirm?._id)
        );
        setDeleteConfirm(false);
        closePopup();
        setTimeout(() => {
          setLoadingDelete(false);
        }, 300);
      }
    } catch (error: any) {
      setLoadingDelete(false);
      console.log("API delete error:", error?.response?.data?.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: "100%" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <BlurView intensity={120} tint="dark" style={styles.container}>
        <BlurView intensity={120} tint="dark" style={styles.header}>
          <Text style={{ color: theme.active, fontSize: 18, fontWeight: 500 }}>
            {item?.founder.userId === currentUser?._id && "Edit Product"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                openDeleteConfirm({ p: item });
              }}
            >
              <MaterialIcons name="delete" color="red" size={24} />
            </Pressable>
            <Ionicons
              onPress={() => {
                if (haptics) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                }
                closePopup();
              }}
              name="caret-down-outline"
              color={theme.text}
              size={24}
            />
          </View>
        </BlurView>
        {item?.founder.userId === currentUser?._id && (
          <ScrollView
            style={{ paddingHorizontal: 12, paddingTop: 64 }}
            contentContainerStyle={{ gap: 16, paddingBottom: 160 }}
          >
            <View style={{ gap: 8 }}>
              <Text style={styles.title}>Title*</Text>
              <Input
                placeholder="Enter Product's Title"
                value={productState?.title}
                onChangeText={(text: string) =>
                  setProductState((prev: any) => ({ ...prev, title: text }))
                }
                type="text"
              />
            </View>
            <View style={{ width: "100%", flex: 1, gap: 8 }}>
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
                        if (
                          productState?.type?.find((i: any) => i === item.value)
                        ) {
                          if (productState?.type?.length === 1) {
                            return alert("Can't remove last type.");
                          }
                          setProductState((prev: any) => ({
                            ...prev,
                            type: prev.type?.filter(
                              (i: any) => i !== item.value
                            ),
                          }));
                        } else {
                          setProductState((prev: any) => ({
                            ...prev,
                            type: [...prev.type, item.value],
                          }));
                        }
                      }}
                      style={styles.button}
                      key={index}
                    >
                      <Text
                        style={{
                          color: productState?.type?.find(
                            (i: any) => i === item.value
                          )
                            ? theme.active
                            : theme.text,
                          fontWeight: 600,
                        }}
                      >
                        {item.label}
                      </Text>
                      {productState?.type?.find(
                        (i: any) => i === item.value
                      ) && (
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
              <Text
                style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}
              >
                Price <FontAwesome5 name="coins" size={14} color="orange" />
              </Text>
              <Input
                placeholder="Price"
                value={`${productState?.price}`}
                onChangeText={(text: string) =>
                  setProductState((prev: any) => ({ ...prev, price: text }))
                }
                type="numeric"
              />
            </View>

            <Button
              title="Save"
              loading={loading}
              style={{
                width: "100%",
                backgroundColor: theme.active,
                color: "white",
              }}
              disabled={_.isEqual(oldState, productState)}
              onPressFunction={HandleEditProduct}
            />
          </ScrollView>
        )}
        {item?.founder.userId !== currentUser?._id && (
          <View>
            <View
              style={{
                width: 180,
                height: 180,
                borderRadius: 8,
                overflow: "hidden",
                marginTop: 70,
                marginLeft: 12,
              }}
            >
              <Img uri={item?.file} />
            </View>
            <View style={{ margin: 12, gap: 8 }}>
              {item?.type?.map((t: any, x: number) => {
                const label = types?.find((tp: any) => tp.value === t)?.label;
                return (
                  <Text
                    key={x}
                    style={{ color: theme.text, fontSize: 16, fontWeight: 600 }}
                  >
                    {label}
                  </Text>
                );
              })}
            </View>
          </View>
        )}
        {deleteConfirm && (
          <BlurView
            intensity={20}
            tint="dark"
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              zIndex: 80,
            }}
          >
            <Pressable
              onPress={closeDeleteConfirm}
              style={{ width: "100%", height: "100%" }}
            >
              <Animated.View
                style={[
                  styles.confirmPopup,
                  { transform: [{ translateY: slideAnim }] },
                ]}
              >
                <BlurView
                  intensity={120}
                  tint="dark"
                  style={styles.confirmBlur}
                >
                  <Text style={styles.confirmText}>
                    Are you sure you want to remove this product?
                  </Text>
                  <View style={styles.confirmButtons}>
                    <Button
                      title="Cancel"
                      style={styles.cancelButton}
                      onPressFunction={closeDeleteConfirm}
                    />
                    <Button
                      loading={loadingDelete}
                      title="Remove"
                      style={styles.removeButton}
                      onPressFunction={Remove}
                    />
                  </View>
                </BlurView>
              </Animated.View>
            </Pressable>
          </BlurView>
        )}
      </BlurView>
    </KeyboardAvoidingView>
  );
};

export default EditProduct;

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
    confirmPopup: {
      height: 300,
      zIndex: 80,
      position: "absolute",
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      width: "100%",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: "hidden",
    },
    confirmBlur: {
      width: "100%",
      height: 300,
      padding: 24,
      paddingTop: 48,
      gap: 32,
    },
    confirmText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: 28,
    },
    confirmButtons: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
    },
    cancelButton: {
      width: "45%",
      backgroundColor: "#888",
      color: "white",
    },
    removeButton: {
      width: "45%",
      backgroundColor: "red",
      color: "white",
    },
  });

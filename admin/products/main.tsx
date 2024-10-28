import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import Filter from "./filter";
import List from "./list";
import CreateProduct from "./createProduct";
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Products = () => {
  /**
   * App context
   */
  const { theme, apiUrl } = useAppContext();

  /**
   * Products List
   */
  const [products, setProducts] = useState([]);
  const [productsLength, setProductsLength] = useState(0);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  //Get Products
  const GetProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        apiUrl + "/api/v1/products?type=" + type
      );
      if (response.data.status === "success") {
        setProducts(response.data.data.products);
        setLoading(false);
      }
    } catch (error: any) {
      console.log(error.response.data.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetProducts();
  }, [type]);

  /**
   * Create product
   */
  const [createProduct, setCreateProduct] = useState(false);

  const translateYCreateProduct = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  useEffect(() => {
    Animated.timing(translateYCreateProduct, {
      toValue: createProduct ? 0 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {});
  }, [createProduct, translateYCreateProduct]);

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <View>
        <Filter type={type} setType={setType} />
      </View>
      {loading ? (
        <ActivityIndicator
          size={32}
          color={theme.active}
          style={{ marginTop: 48 }}
        />
      ) : (
        <List products={products} />
      )}
      <View
        style={{
          width: "100%",
          alignItems: "center",
          position: "absolute",
          bottom: 80,
          padding: 12,
        }}
      >
        <Button
          title="Create Product"
          style={{
            width: "100%",
            backgroundColor: theme.active,
            color: "white",
          }}
          onPressFunction={() => setCreateProduct(true)}
        />
      </View>
      <Animated.View
        style={[
          styles.screen,
          {
            transform: [{ translateY: translateYCreateProduct }],
          },
        ]}
      >
        <CreateProduct
          setCreateProduct={setCreateProduct}
          setProducts={setProducts}
        />
      </Animated.View>
    </View>
  );
};

export default Products;

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 50,
    paddingBottom: 96,
  },
});

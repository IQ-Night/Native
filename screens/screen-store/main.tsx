import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useAppContext } from "../../context/app";
import { useStoreContext } from "../../context/store";
import List from "./list";
import Header from "../../components/header";
import Filter from "../../admin/products/filter";
import { ActivityIndicator } from "react-native-paper";
import { useContentContext } from "../../context/content";
import BuyItem from "./buyItem";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Store = () => {
  /**
   * App state
   */
  const { rerenderProducts, activeLanguage, theme, haptics } = useAppContext();
  /**
   * Store state
   */

  const {
    products,
    setProducts,
    openFilter,
    setOpenFilter,
    open,
    search,
    setSearch,
    slideAnim,
    opacityAnim,
    setOpen,
    isFocused,
    setIsFocused,
    inputRef,
    translateYFilter,
    scaleBg,
    totalProducts,
    type,
    setType,
  } = useStoreContext();

  /**
   * App state
   */
  const { transformListY, opacityList } = useContentContext();

  // buy item
  const [openBuyItem, setOpenBuyItem] = useState(null);
  return (
    <View style={{ flex: 1, minHeight: "100%" }}>
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleBg }] }}>
        <Header
          list={products}
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          load={rerenderProducts}
          open={open}
          search={search}
          setSearch={setSearch}
          slideAnim={slideAnim}
          opacityAnim={opacityAnim}
          setOpen={setOpen}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          inputRef={inputRef}
          tab="Assets"
          tabTitle={activeLanguage?.store}
          totalData={totalProducts}
        />
        <Animated.View
          style={{
            opacity: opacityList,
            transform: [{ scale: opacityList }],
            height: 30,
            width: 40,
            position: "absolute",
            top: 156,
            zIndex: 80,
            left: SCREEN_WIDTH / 2 - 20,
          }}
        >
          <ActivityIndicator color="orange" size="small" />
        </Animated.View>
        <Animated.View
          style={{
            paddingTop: 148,
            paddingBottom: 56,
            transform: [{ translateY: transformListY }],
          }}
        >
          <View>
            <Filter type={type} setType={setType} />
          </View>
          <List setOpenBuyItem={setOpenBuyItem} setState={setProducts} />
        </Animated.View>
      </Animated.View>

      {openFilter && (
        <Animated.View style={[styles.screen]}>
          <Filter
            openFilter={openFilter}
            setOpenFilter={setOpenFilter}
            translateYFilter={translateYFilter}
          />
        </Animated.View>
      )}
      {openBuyItem && (
        <BuyItem
          item={openBuyItem}
          closeComponent={() => setOpenBuyItem(null)}
          setState={setProducts}
        />
      )}
    </View>
  );
};

export default Store;

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    height: "110%",
    position: "absolute",
    top: 0,
    zIndex: 50,
  },
});

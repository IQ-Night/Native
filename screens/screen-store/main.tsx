import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/app";
import { useStoreContext } from "../../context/store";
import List from "./list";
import Header from "../../components/header";
import Filter from "./filter";

const Store = () => {
  /**
   * App state
   */
  const { rerenderProducts } = useAppContext();
  /**
   * Store state
   */

  const {
    products,
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
    type,
    setType,
    totalProducts,
  } = useStoreContext();

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
          title="Assets"
          totalData={totalProducts}
        />

        <List />
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
    paddingBottom: 96,
  },
});

import React, { useState, useRef, useEffect } from "react";
import { Animated, StyleSheet, View, Keyboard } from "react-native";
import { TextInput } from "react-native-paper";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useAppContext } from "../context/app";

const Search = ({
  search,
  setSearch,
  isFocused,
  setIsFocused,
  slideAnim,
  opacityAnim,
  inputRef,
  open,
  setOpen,
}: any) => {
  /**
   * App context
   */
  const { theme } = useAppContext();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            transform: [{ translateX: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.searchInner}>
          <TextInput
            ref={inputRef}
            placeholder="Search.."
            placeholderTextColor={"#888"}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => {
              if (search?.length === 0) {
                setOpen(false);
              }
              setIsFocused(false);
            }}
            value={search}
            textColor={theme.text}
            onChangeText={setSearch}
            style={styles.textInput}
            autoFocus={false} // Handle focus manually
          />
          {search?.length > 0 && (
            <FontAwesome
              onPress={() => {
                if (!isFocused) {
                  setOpen(false);
                }
                setSearch("");
              }}
              name="close"
              size={16}
              color={theme.active}
            />
          )}
        </View>
      </Animated.View>
      <Feather
        onPress={() => {
          if (!open) {
            setOpen(true);
          }
        }}
        name="search"
        color="rgba(255,255,255,0.1)"
        size={24}
        style={styles.searchIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "74%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 50,
    zIndex: 50,
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  searchContainer: {
    width: "100%",
    position: "relative",
    height: 25,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#333",
    paddingRight: 8,
  },
  searchInner: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textInput: {
    backgroundColor: "transparent",
    paddingLeft: 20,
    fontSize: 14,
    width: "90%",
  },
  searchIcon: {
    marginLeft: 8,
  },
});

export default Search;

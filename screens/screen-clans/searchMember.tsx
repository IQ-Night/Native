import React, { useState, useRef, useEffect } from "react";
import { Animated, StyleSheet, View, Keyboard } from "react-native";
import { TextInput } from "react-native-paper";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useAppContext } from "../../context/app";

const Search = ({
  search,
  setSearch,
  open,
  setOpen,
  isFocused,
  setIsFocused,
  slideAnim,
  opacityAnim,
  inputRef,
}: any) => {
  /**
   * App context
   */
  const { theme, activeLanguage } = useAppContext();

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
            placeholder={`${activeLanguage?.search_player}..`}
            placeholderTextColor={"#888"}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
            value={search}
            textColor={theme.text}
            onChangeText={setSearch}
            style={styles.textInput}
            autoFocus={true} // Handle focus manually
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
        <Feather
          onPress={() => {
            if (!open) {
              setOpen(true);
            }
          }}
          name="search"
          color="rgba(255,255,255,0.1)"
          size={20}
          style={styles.searchIcon}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
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
    height: 32,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#333",
    paddingRight: 8,
    justifyContent: "center",
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

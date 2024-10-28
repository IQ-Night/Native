import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Input from "../../components/input";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useProfileContext } from "../../context/profile";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const EditNameWindow = () => {
  /**
   * App context
   */
  const { theme, activeLanguage } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Profile context
   */
  const { UpdateUser, updateLoading } = useProfileContext();

  /**
   * Edit field
   */
  const [input, setInput] = useState(currentUser.name);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        position: "relative",
        bottom: 40,
      }}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={{
          borderRadius: 10,
          width: "90%",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <Input
          placeholder={activeLanguage.fullName}
          onChangeText={(text: string) => setInput(text)}
          type="text"
          onSubmitEditing={() => UpdateUser({ name: input })}
          returnKeyType="go"
          value={input}
        />
        <Button
          style={{
            width: (SCREEN_WIDTH / 100) * 90,
            color: theme.text,
            backgroundColor: theme.active,
          }}
          disabled={input === currentUser?.name}
          icon=""
          title={activeLanguage.changeName}
          loading={updateLoading}
          onPressFunction={() => UpdateUser({ name: input })}
        />
      </Pressable>
    </View>
  );
};

export default EditNameWindow;

const styles = StyleSheet.create({});

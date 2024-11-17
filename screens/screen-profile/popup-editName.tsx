import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Input from "../../components/input";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useProfileContext } from "../../context/profile";
import { FontAwesome5 } from "@expo/vector-icons";

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
        justifyContent: "center",
        position: "relative",
        height: "80%",
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
        {currentUser?.editOptions?.totalFreeEditName > 0 && (
          <Text
            style={{
              color: theme.active,
              fontWeight: 600,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {currentUser?.editOptions?.totalFreeEditName} free changes left!
          </Text>
        )}
        <Input
          placeholder={activeLanguage.fullName}
          onChangeText={(text: string) => setInput(text)}
          type="text"
          value={input}
        />
        <Button
          style={{
            width: (SCREEN_WIDTH / 100) * 90,
            color: "white",
            backgroundColor: theme.active,
          }}
          disabled={input === currentUser?.name}
          title={
            <Text>
              {activeLanguage.changeName}

              {currentUser?.editOptions?.totalFreeEditName === 0 && (
                <>
                  {"  150 "}
                  <FontAwesome5 name="coins" size={14} />
                </>
              )}
            </Text>
          }
          loading={updateLoading}
          onPressFunction={() => UpdateUser({ name: input })}
        />
      </Pressable>
    </View>
  );
};

export default EditNameWindow;

const styles = StyleSheet.create({});

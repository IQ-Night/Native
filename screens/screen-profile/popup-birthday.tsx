import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Dimensions, StyleSheet, View, Platform } from "react-native";
import { useAppContext } from "../../context/app";
import { useAuthContext } from "../../context/auth";
import { useProfileContext } from "../../context/profile";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button from "../../components/button";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const BirthdayWindow = () => {
  /**
   * App context
   */
  const { theme, activeLanguage } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser, setCurrentUser } = useAuthContext();

  /**
   * Profile context
   */
  const { UpdateUser, updateLoading } = useProfileContext();

  /**
   * Date input state
   */
  const [birthDay, setBirthDay] = useState(
    currentUser?.birthday ? new Date(currentUser?.birthday) : new Date()
  );
  const onChange = (event: any, selectedDate: any) => {
    setBirthDay(selectedDate);
    setCurrentUser((prev: any) => ({ ...prev, birthday: selectedDate }));
  };
  return (
    <View
      style={{
        borderRadius: 10,
        width: "100%",
        height: "60%",
        gap: 10,
        marginTop: "40%",
      }}
    >
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: theme.text,
            borderRadius: 10,
            padding: 10,
            width: "90%",
          }}
        >
          <DateTimePicker
            value={birthDay}
            mode="date"
            display="inline"
            onChange={onChange}
          />
        </View>
        <View style={{ width: "90%", marginTop: 8 }}>
          <Button
            title={activeLanguage?.save}
            onPressFunction={() => {
              if (birthDay !== new Date()) {
                const formattedDate = birthDay.toISOString().split("T")[0];
                UpdateUser({ birthday: formattedDate });
              }
            }}
            style={{
              backgroundColor: "orange",
              color: "white",
              width: "100%",
            }}
            icon=""
            loading={updateLoading}
          />
        </View>
      </View>
    </View>
  );
};

export default BirthdayWindow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    bottom: 100,
  },
});

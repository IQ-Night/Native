import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Button from "../../components/button";
import { useAppContext } from "../../context/app";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const Activation = ({
  setOpenActivation,
  setCouponState,
  openActivation,
}: any) => {
  /**
   * App context
   */
  const { theme, activeLanguage } = useAppContext();

  /**
   * Date input state
   */
  const [date, setDate] = useState(
    openActivation?.expiresAt ? new Date(openActivation?.expiresAt) : new Date()
  );
  const onChange = (event: any, selectedDate: any) => {
    setDate(selectedDate);
    setCouponState((prev: any) => ({
      ...prev,
      expiresAt: selectedDate,
    }));
  };
  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        borderRadius: 10,
        width: "100%",
        height: "100%",
        gap: 10,
      }}
    >
      <View style={styles.container}>
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: 600 }}>
          {activeLanguage?.expireDate}
        </Text>
        <View
          style={{
            backgroundColor: theme.text,
            borderRadius: 10,
            padding: 10,
            width: "90%",
          }}
        >
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            onChange={onChange}
          />
        </View>
        <View style={{ width: "90%", marginTop: 8 }}>
          <Button
            title={activeLanguage?.save}
            onPressFunction={() => {
              setCouponState((prev: any) => ({
                ...prev,
                expiresAt: date,
              }));
              setOpenActivation(null);
            }}
            style={{
              backgroundColor: "orange",
              color: "white",
              width: "100%",
            }}
            icon=""
          />
        </View>
      </View>
    </BlurView>
  );
};

export default Activation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    bottom: 100,
    gap: 16,
  },
});

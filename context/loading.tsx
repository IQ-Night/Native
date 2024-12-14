import { Dimensions, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAppContext } from "./app";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const Loading = () => {
  /**
   * App context
   */
  const { theme } = useAppContext();
  return (
    <View style={styles.container}>
      <Text>
        <ActivityIndicator size={32} color={theme.active} />
      </Text>
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    zIndex: 100,
    width: "100%",
    height: SCREEN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
  },
});

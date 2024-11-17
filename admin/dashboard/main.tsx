import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef } from "react";
import Menu from "./menu";
import { ActivityIndicator } from "react-native-paper";
import { useAdminContext } from "../../context/admin";
import { useAuthContext } from "../../context/auth";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AdminDashboard = ({ navigation }: any) => {
  const { currentUser } = useAuthContext();
  const { loadingAdminNotifications } = useAdminContext();
  /**
   * loading animation
   */
  const transformListY = useRef(new Animated.Value(0)).current;
  const opacityList = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationY = Animated.timing(transformListY, {
      toValue: loadingAdminNotifications ? 40 : 0,
      duration: 200,
      useNativeDriver: true,
    });

    const animationOpacity = Animated.timing(opacityList, {
      toValue: loadingAdminNotifications ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    });

    // Running animations simultaneously
    Animated.parallel([animationY, animationOpacity]).start();
  }, [loadingAdminNotifications]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Animated.View
        style={{
          opacity: opacityList,
          transform: [{ scale: opacityList }],
          height: 30,
          width: 40,
          position: "absolute",
          top: 116,
          left: SCREEN_WIDTH / 2 - 20,
        }}
      >
        <ActivityIndicator color="orange" size="small" />
      </Animated.View>
      <View
        style={{
          width: "100%",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.1)",
          marginTop: 40,
        }}
      >
        <Text style={{ color: "white", fontSize: 24, fontWeight: 600 }}>
          {currentUser?.admin?.role} Dashboard
        </Text>
      </View>
      <Animated.View
        style={{ flex: 1, transform: [{ translateY: transformListY }] }}
      >
        <Menu navigation={navigation} />
      </Animated.View>
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({});

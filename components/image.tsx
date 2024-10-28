import { FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { useAppContext } from "../context/app";

const Img = ({ uri, onLoad }: any) => {
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
  const [loadImg, setLoadImg] = useState(true);
  const { theme } = useAppContext();
  useEffect(() => {
    if (uri?.length < 1) {
      setLoadImg(false);
    }
  }, []);

  return (
    <>
      <BlurView
        intensity={120}
        tint="dark"
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: 1,
          position: "absolute",
          zIndex: 10,
          transform: [{ scale: loadImg ? 1 : 0 }],
        }}
      >
        <ShimmerPlaceholder
          height="100%"
          shimmerColors={[
            "rgba(255,255,255,0.1)",
            "rgba(255,255,255,0.2)",
            "rgba(255,255,255,0)",
          ]}
          duration={1500}
        />
      </BlurView>

      <BlurView
        intensity={50}
        tint="dark"
        style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
      >
        {uri?.length > 0 ? (
          <Image
            onLoad={() => {
              setLoadImg(false);
              if (onLoad) {
                onLoad();
              }
            }}
            source={{ uri: uri }}
            style={[styles.image]}
          />
        ) : (
          <FontAwesome5 name="image" size={72} color={theme.text} />
        )}
      </BlurView>
    </>
  );
};

export default Img;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover", // Ensures the image covers the entire grid item
    // borderRadius: 8,
  },
});

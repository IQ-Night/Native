import { FontAwesome6 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { useAppContext } from "../context/app";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const FlipCard = ({ img, item, roomState, sizes, from }: any) => {
  const { theme, haptics } = useAppContext();
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Flip logic
  const handleFlip = () => {
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1, // Flip back to 0 or flip forward to 1
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setFlipped(!flipped);
    });
  };

  // Interpolations for front and back
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  //   const [loaded, setLoaded] = useState(false);
  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

  const [loadImg, setLoadImg] = useState(true);
  return (
    <>
      {from === "door-review" ? (
        <Pressable
          onPress={handleFlip}
          style={[
            styles.container,
            {
              width: sizes?.width,
              height: sizes?.height,
              borderRadius: sizes?.borderRadius,
            },
          ]}
        >
          {loadImg && (
            <ShimmerPlaceholder
              height="100%"
              shimmerColors={[
                "rgba(255,255,255,0.1)",
                "rgba(255,255,255,0.2)",
                "rgba(255,255,255,0)",
              ]}
              duration={1500}
            />
          )}

          {/* Front Side */}
          <Animated.View
            style={[
              styles.card,
              styles.frontCard,
              {
                transform: [{ rotateY: frontInterpolate }],
                width: sizes?.width,
                height: sizes?.height,
                borderWidth: from === "door-review" ? 0 : 2,
                opacity:
                  roomState && roomState.roles.includes(item)
                    ? 1
                    : !roomState
                    ? 1
                    : 0.5,
                borderColor: theme.active,
                borderRadius: sizes?.borderRadius,
              },
            ]}
          >
            <Image
              source={img?.front}
              onLoad={() => setLoadImg(false)}
              style={[
                styles.image,
                { width: sizes?.width, height: sizes?.height },
              ]}
            />
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={[
              styles.card,
              styles.backCard,
              {
                transform: [{ rotateY: backInterpolate }],
                width: sizes?.width,
                height: sizes?.height,
                borderWidth: from === "door-review" ? 0 : 2,
                opacity:
                  roomState && roomState.roles.includes(item)
                    ? 1
                    : !roomState
                    ? 1
                    : 0.5,
                borderColor: theme.active,
                borderRadius: sizes?.borderRadius,
              },
            ]}
          >
            <Image
              source={img?.back}
              onLoad={() => setLoadImg(false)}
              style={[
                styles.image,
                {
                  width: sizes?.width,
                  height: sizes?.height,
                },
              ]}
            />
          </Animated.View>
        </Pressable>
      ) : (
        <View
          style={[
            styles.container,
            {
              width: sizes?.width,
              height: sizes?.height,
            },
          ]}
        >
          {loadImg && (
            <ShimmerPlaceholder
              height="100%"
              shimmerColors={[
                "rgba(255,255,255,0.1)",
                "rgba(255,255,255,0.2)",
                "rgba(255,255,255,0)",
              ]}
              duration={1500}
            />
          )}
          <Pressable
            onPress={handleFlip}
            style={{ position: "absolute", bottom: 8, right: 8, zIndex: 60 }}
          >
            <FontAwesome6 name="circle-info" size={18} color={theme.text} />
          </Pressable>
          {/* Front Side */}
          <Animated.View
            style={[
              styles.card,
              styles.frontCard,
              {
                transform: [{ rotateY: frontInterpolate }],
                width: sizes?.width,
                height: sizes?.height,
                borderWidth: from === "door-review" ? 0 : 2,
                opacity:
                  roomState &&
                  roomState.roles.find((r: any) => r.value === item.value)
                    ? 1
                    : !roomState
                    ? 1
                    : 0.5,
                borderColor: theme.active,
              },
            ]}
          >
            <Image
              source={img?.front}
              onLoad={() => setLoadImg(false)}
              style={[
                styles.image,
                { width: sizes?.width, height: sizes?.height },
              ]}
            />
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={[
              styles.card,
              styles.backCard,
              {
                transform: [{ rotateY: backInterpolate }],
                width: sizes?.width,
                height: sizes?.height,
                borderWidth: from === "door-review" ? 0 : 2,
                borderColor: theme.active,
                opacity:
                  (roomState &&
                    roomState.roles.find((r: any) => r.value === item.value)) ||
                  from === "door-review"
                    ? 1
                    : !roomState
                    ? 1
                    : 0.5,
              },
            ]}
          >
            <Image
              source={img?.back}
              onLoad={() => setLoadImg(false)}
              style={[
                styles.image,
                {
                  width: sizes?.width,
                  height: sizes?.height,
                },
              ]}
            />
          </Animated.View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    // borderRadius: 10,
    overflow: "hidden",
  },
  card: {
    position: "absolute", // Ensures both sides overlap
    backfaceVisibility: "hidden", // Hides the backface when flipped
  },
  frontCard: {
    // borderRadius: 10,
    overflow: "hidden",
  },
  backCard: {
    // borderRadius: 10,
    overflow: "hidden",
  },
  image: {},
});

export default FlipCard;

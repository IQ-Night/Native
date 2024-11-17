// import { MaterialIcons } from "@expo/vector-icons";
// import { BlurView } from "expo-blur";
// import { useEffect, useRef } from "react";
// import {
//   Dimensions,
//   Platform,
//   Pressable,
//   ScrollView,
//   Text,
// } from "react-native";
// import { useAppContext } from "../context/app";

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// export const Pagination = ({ totalPages, currentPage, debouncedAdd }: any) => {
//   const { theme } = useAppContext();
//   const scrollViewRef = useRef<ScrollView>(null);

//   const pageButtons = [];

//   // Center the current page in the ScrollView when it changes
//   useEffect(() => {
//     if (scrollViewRef.current && currentPage > 0) {
//       const pageWidth = 48; // Width of each page button including padding
//       const scrollToX =
//         pageWidth * (currentPage - 1) - SCREEN_WIDTH / 2 + pageWidth / 2;

//       // Ensure that page 1 is always in view
//       const adjustedScrollToX = Math.max(0, scrollToX);
//       scrollViewRef.current.scrollTo({ x: adjustedScrollToX, animated: true });
//     }
//   }, [currentPage]);

//   // Create an array of page buttons
//   for (let i = 1; i <= totalPages; i++) {
//     pageButtons.push(
//       <Pressable
//         key={i}
//         style={{
//           paddingHorizontal: 8,
//           paddingVertical: 4,
//           borderRadius: 4,
//           backgroundColor: currentPage === i ? theme.active : theme.inactive,
//           alignItems: "center",
//         }}
//         onPress={() => debouncedAdd(i)}
//       >
//         <Text
//           style={{
//             color: currentPage === i ? "#fff" : "#444",
//             fontSize: 16,
//             fontWeight: "600",
//           }}
//         >
//           {i}
//         </Text>
//       </Pressable>
//     );
//   }

//   return (
//     <BlurView
//       intensity={120}
//       tint="dark"
//       style={{
//         flexDirection: "row",
//         alignItems: "center",
//         gap: 16,
//         position: "absolute",
//         bottom: 79,
//         zIndex: 80,
//         height: 50,
//         width: SCREEN_WIDTH,
//         paddingHorizontal: 12,
//       }}
//     >
//       <Pressable
//         onPress={
//           currentPage > 1 ? () => debouncedAdd(currentPage - 1) : undefined
//         }
//         style={{
//           width: SCREEN_WIDTH * 0.1,
//           alignItems: "center",
//           backgroundColor: "rgba(255,255,255,0.1)",
//           borderRadius: 4,
//           opacity: currentPage > 1 ? 1 : 0.5,
//         }}
//       >
//         <MaterialIcons name="arrow-left" size={32} color={theme.active} />
//       </Pressable>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         bounces={Platform.OS === "ios" ? false : undefined}
//         overScrollMode={Platform.OS === "ios" ? "never" : "always"}
//         ref={scrollViewRef}
//         contentContainerStyle={{
//           flexDirection: "row",
//           alignItems: "center",
//           gap: 8,
//         }}
//         style={{
//           width: SCREEN_WIDTH * 0.8,
//           overflow: "hidden",
//         }}
//       >
//         {pageButtons}
//       </ScrollView>
//       <Pressable
//         onPress={
//           currentPage < totalPages
//             ? () => debouncedAdd(currentPage + 1)
//             : undefined
//         }
//         style={{
//           width: SCREEN_WIDTH * 0.1,
//           alignItems: "center",
//           backgroundColor: "rgba(255,255,255,0.1)",
//           borderRadius: 4,
//           opacity: currentPage < totalPages ? 1 : 0.5,
//         }}
//       >
//         <MaterialIcons name="arrow-right" size={32} color={theme.active} />
//       </Pressable>
//     </BlurView>
//   );
// };

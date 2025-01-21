import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import Button from "../components/button";
import FlipCard from "../components/flipCard";
import { useAppContext } from "../context/app";
import { useAuthContext } from "../context/auth";
import { useGameContext } from "../context/game";
import roleImageGenerator from "../functions/roleImageGenerator";

const DealingCards = ({ timeController, loading, setLoading }: any) => {
  /**
   * App context
   */
  const { theme, activeLanguage, language } = useAppContext();

  /**
   * Auth context
   */
  const { currentUser } = useAuthContext();

  /**
   * Game context
   */
  const { gamePlayers, socket, activeRoom } = useGameContext();

  /**
   * როლის დადასტურების ფუნქცია
   */

  const ConfirmRole = () => {
    if (socket) {
      setLoading(true);
      socket.emit("confirmRole", {
        roomId: activeRoom._id,
        userId: currentUser._id,
      });
    }
  };

  const currentUserRole = gamePlayers.find(
    (user: any) => user.userId === currentUser._id
  )?.role;

  const roleImage = roleImageGenerator({
    role: currentUserRole,
    language: language,
  });

  return (
    <BlurView
      intensity={120}
      tint="dark"
      style={{
        position: "absolute",
        top: 0,
        zIndex: 90,
        width: "100%",
        height: "100%",
      }}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          paddingVertical: "10%",
        }}
      >
        <View
          style={{
            width: "60%",
            height: 380,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <FlipCard
            img={roleImage}
            item={currentUserRole}
            sizes={{ width: "100%", height: 380, borderRadius: 16 }}
            from="door-review"
          />
        </View>
        <View style={{ width: "90%" }}>
          <Button
            loading={loading}
            title={
              timeController > 0
                ? `${activeLanguage?.confirm} ${timeController} ${activeLanguage?.sec}`
                : activeLanguage?.confirm
            }
            onPressFunction={ConfirmRole}
            style={{
              backgroundColor: theme.active,
              color: "white",
              width: "100%",
            }}
          />
        </View>
      </View>
    </BlurView>
  );
};

export default DealingCards;

const styles = StyleSheet.create({});

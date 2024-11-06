import { StyleSheet, Text } from "react-native";
import BanTimer from "../../components/banTimer";
import { checkBanExpired } from "../../functions/checkBan";

// Extracted Component for Ban Timer Message
const BanMessage = ({ duration, createdAt, onExpire }: any) => (
  <Text style={{ color: "#888", fontSize: 14 }}>
    Ban:{" "}
    <BanTimer
      duration={duration}
      createdAt={createdAt}
      afterExpire={onExpire}
    />
  </Text>
);

// Main Component for Join Button Text
export const JoinButtonText = ({
  gameLevel,
  roomIsOpen,
  currentUser,
  theme,
  item,
  liveUsers,
  setCurrentUser,
  setRooms,
}: any) => {
  // Check if the game is currently being played or if the room is open
  const isPlayingNow = gameLevel?.status === "In Play";
  const isRoomOpen = roomIsOpen?.status === "open";
  const levelMismatch = roomIsOpen?.reason === "rating";

  // Define ban conditions with expiration checks
  const isUserBannedInApp =
    currentUser?.status?.type === "blocked in app" &&
    !checkBanExpired(currentUser?.status);

  const isUserBannedInRoom =
    roomIsOpen?.reason === "ban" &&
    item?.blackList?.some(
      (ban: any) => ban.user === currentUser?._id && !checkBanExpired(ban)
    );

  const clanBan =
    roomIsOpen?.reason === "clan ban" &&
    item?.bannedUserInfo &&
    !checkBanExpired(item?.bannedUserInfo);

  // Helper function to handle ban expiration actions
  const handleBanExpiration = (type: any) => {
    switch (type) {
      case "userBlock":
        setCurrentUser((prev: any) => ({ ...prev, status: undefined }));
        break;
      case "roomBan":
        setRooms((prevRooms: any) =>
          prevRooms.map((room: any) =>
            room._id === item?._id
              ? {
                  ...room,
                  blackList: room.blackList.filter(
                    (b: any) => b.user !== currentUser?._id
                  ),
                }
              : room
          )
        );
        break;
      case "clanBan":
        setRooms((prevRooms: any) =>
          prevRooms.map((room: any) =>
            room._id === item?._id
              ? {
                  ...room,
                  bannedUserInfo: undefined, // Clear clan ban info
                }
              : room
          )
        );
        break;
      default:
        break;
    }
  };

  return (
    <>
      {isPlayingNow ? (
        <Text style={styles.joinButtonText}>Playing now</Text>
      ) : (
        <Text
          style={[
            styles.joinButtonText,
            { color: isRoomOpen ? theme.active : "#888", fontWeight: 600 },
          ]}
        >
          {levelMismatch && <Text>Level doesn't match</Text>}

          {isUserBannedInApp ? (
            <BanMessage
              duration={currentUser?.status?.totalHours}
              createdAt={currentUser?.status?.createdAt}
              onExpire={() => handleBanExpiration("userBlock")}
            />
          ) : isUserBannedInRoom ? (
            <BanMessage
              duration={
                item?.blackList?.find((i: any) => i.user === currentUser?._id)
                  ?.totalHours
              }
              createdAt={
                item?.blackList?.find((i: any) => i.user === currentUser?._id)
                  ?.createdAt
              }
              onExpire={() => handleBanExpiration("roomBan")}
            />
          ) : clanBan ? (
            <BanMessage
              duration={item?.bannedUserInfo?.totalHours}
              createdAt={item?.bannedUserInfo?.createdAt}
              onExpire={() => handleBanExpiration("clanBan")}
            />
          ) : (
            <Text>
              {liveUsers?.some((u: any) => u.userId === item.admin.founder._id)
                ? "Join"
                : item.admin.founder._id === currentUser._id
                ? "Open Room"
                : "Closed"}
            </Text>
          )}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  joinButton: {
    width: "100%",
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 48,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "orange",
  },
});

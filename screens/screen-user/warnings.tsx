import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../../context/app";
import { warnings } from "../../context/content";
import { FormatDate } from "../../functions/formatDate";

const Warnings = ({ list }: any) => {
  const { theme, language } = useAppContext();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.animatedContainer,
          {
            gap: 16,
          },
        ]}
      >
        <View
          style={{
            width: "100%",
            gap: 8,
            alignItems: "center",
          }}
        >
          {list?.map((item: any, index: number) => {
            let warning = warnings?.find((w: any) => w.value === item.warning);
            return (
              <View
                style={{
                  width: "100%",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.1)",
                  padding: 12,
                  gap: 8,
                }}
                key={index}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: 500,
                    fontSize: 12,
                    lineHeight: 18,
                    letterSpacing: 0.5,
                  }}
                >
                  {language === "GB"
                    ? warning?.en
                    : language === "GE"
                    ? warning?.ka
                    : warning?.ru}
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: 500,
                    fontSize: 12,
                    lineHeight: 18,
                    letterSpacing: 0.5,
                  }}
                >
                  {FormatDate(item?.createdAt, "")}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default Warnings;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  animatedContainer: {
    padding: 12,
    borderRadius: 10,
    width: "100%",
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

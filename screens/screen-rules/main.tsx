import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import {
  privacyPolicyContentEn,
  privacyPolicyContentKa,
  privacyPolicyContentRu,
  useAppContext,
} from "../../context/app";

const Rules = () => {
  const { language } = useAppContext();
  let currentLangText: any;
  if (language === "GE") {
    currentLangText = privacyPolicyContentKa;
  } else if (language === "RU") {
    currentLangText = privacyPolicyContentRu;
  } else {
    currentLangText = privacyPolicyContentEn;
  }
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {currentLangText?.map((section: any, index: any) => (
        <View key={index} style={styles.section}>
          <Text style={styles.title}>{section.title}</Text>
          {section.content && (
            <Text style={styles.text}>{section.content}</Text>
          )}
          {section.subsections &&
            section.subsections.map((subsection: any, subIndex: any) => (
              <View key={subIndex} style={{ gap: 8 }}>
                <Text style={styles.subtitle}>{subsection.subtitle}</Text>
                <Text style={styles.text}>{subsection.content}</Text>
              </View>
            ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 4,
    marginTop: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
});

export default Rules;

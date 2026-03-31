import { useColorScheme } from "nativewind";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdvocateCases() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.text, isDark && styles.textDark]}>
        Cases Pipeline
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  containerDark: { backgroundColor: "#000" },
  text: { fontSize: 24, fontWeight: "bold" },
  textDark: { color: "#FFF" },
});

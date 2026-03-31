import { useColorScheme } from "nativewind";

export const useLegalTheme = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: {
      background: isDark ? "#171717" : "#FAFAFA", // Legal Buddy body colors
      text: isDark ? "#FAFAFA" : "#1F2937",
      primary: isDark ? "#FAFAFA" : "#1F2937",
      accent: "#737373", // Neutral-500
      card: isDark ? "#262626" : "#FFFFFF",
      border: isDark ? "#374151" : "#E5E5E5",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
  };
};

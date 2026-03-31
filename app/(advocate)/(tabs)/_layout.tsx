import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { Platform, StyleSheet } from "react-native";

export default function AdvocateTabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 24 : 16,
          left: 16,
          right: 16,
          height: 64,
          borderRadius: 32,
          backgroundColor: isDark
            ? "rgba(23, 23, 23, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          paddingBottom: 0, // prevents safe area push
          paddingTop: 12, // centers the icon correctly
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          height: 40,
        },
        tabBarBackground: () => (
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={80}
            style={StyleSheet.absoluteFill}
            className="overflow-hidden rounded-full"
          />
        ),
        tabBarActiveTintColor: isDark ? "#60A5FA" : "#3B82F6",
        tabBarInactiveTintColor: isDark ? "#9CA3AF" : "#6B7280",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cases"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "folder" : "folder-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

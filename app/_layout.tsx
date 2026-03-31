import { NAVIGATION_TIMING } from "@/utils/navigationConfig";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <KeyboardProvider>
        <GestureHandlerRootView
          style={{
            flex: 1,
            backgroundColor: colorScheme === "dark" ? "#0A0A0A" : "#FFFFFF",
          }}
        >
          <SafeAreaProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor:
                    colorScheme === "dark" ? "#0A0A0A" : "#FFFFFF",
                },
                animation: "slide_from_right",
                presentation: "card",
                gestureEnabled: true,
                gestureDirection: "horizontal",
                fullScreenGestureEnabled: true,
                animationDuration: NAVIGATION_TIMING.SCREEN_TRANSITION,
                animationTypeForReplace: "push",
              }}
            >
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                  animation: "fade",
                }}
              />
              <Stack.Screen
                name="(client)"
                options={{
                  headerShown: false,
                  animation: "none",
                  freezeOnBlur: false,
                }}
              />
              <Stack.Screen
                name="(advocate)"
                options={{
                  headerShown: false,
                  animation: "none",
                  freezeOnBlur: false,
                }}
              />
              <Stack.Screen
                name="advocate/[id]"
                options={{
                  animation: "slide_from_right",
                  animationDuration: NAVIGATION_TIMING.SCREEN_TRANSITION,
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />
              <Stack.Screen
                name="chat/[id]"
                options={{
                  animation: "slide_from_right",
                  animationDuration: NAVIGATION_TIMING.SCREEN_TRANSITION,
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />
              <Stack.Screen
                name="chat/ai/[id]"
                options={{
                  animation: "slide_from_right",
                  animationDuration: NAVIGATION_TIMING.SCREEN_TRANSITION,
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                }}
              />
              <Stack.Screen
                name="call/[id]"
                options={{
                  presentation: "fullScreenModal",
                  animation: "slide_from_bottom",
                  animationDuration: NAVIGATION_TIMING.MODAL_TRANSITION,
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
          </SafeAreaProvider>
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      </KeyboardProvider>
    </ThemeProvider>
  );
}

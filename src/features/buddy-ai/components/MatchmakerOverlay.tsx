import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemedText } from "@/components/ui/ThemedText";
import { AdvocateList } from "@/features/advocates/components/AdvocateList";
import { useCaseStore } from "@/features/case-builder/store/useCaseStore";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { SPRING_CONFIGS } from "@/utils/navigationConfig";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Sparkles, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInUp,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface MatchmakerOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SPRING_CONFIG_OPEN = SPRING_CONFIGS.modal;

const SPRING_CONFIG_CLOSE = {
  damping: 32,
  stiffness: 320,
  mass: 0.7,
  velocity: 3,
};

export function MatchmakerOverlay({
  visible,
  onClose,
}: MatchmakerOverlayProps) {
  const { colors, isDark } = useLegalTheme();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { triggerNewChat } = useCaseStore();

  const [step, setStep] = useState<"input" | "results">("input");
  const [isVisible, setIsVisible] = useState(false);

  // Start off-screen
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      translateY.value = withSpring(0, SPRING_CONFIG_OPEN);
    } else {
      // Dismiss Keyboard immediately when closing programmatically
      Keyboard.dismiss();
      translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG_CLOSE, () => {
        runOnJS(setIsVisible)(false);
        runOnJS(setStep)("input");
      });
    }
  }, [visible]);

  const handleMatch = () => {
    if (!query.trim()) return;
    Keyboard.dismiss(); // Dismiss keyboard when searching

    // Instead of showing local results, immediately dispatch to Case Builder AI
    triggerNewChat(query);
    handleClose();

    // Slight delay to ensure closing animation starts before heavy navigation
    setTimeout(() => {
      router.push("/create-case");
    }, 150);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG_CLOSE, () => {
      runOnJS(setIsVisible)(false);
      runOnJS(setStep)("input");
      runOnJS(setQuery)("");
      runOnJS(onClose)();
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      // Optional: Interaction start logic
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.value = gestureState.dy;
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 120 || gestureState.vy > 0.6) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG_OPEN);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT / 2],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  if (!isVisible && !visible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
      animationType="none"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            className="absolute inset-0 bg-black/60"
            style={backdropStyle}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[animatedStyle]}
          className="rounded-t-[32px] h-[85%] shadow-2xl overflow-hidden bg-white dark:bg-black"
          {...panResponder.panHandlers}
        >
          <LinearGradient
            colors={isDark ? ["#1E293B", "#0F172A"] : ["#FFFFFF", "#F8FAFC"]}
            className="pb-10 rounded-t-[32px] z-10 border-b border-[#E2E8F0] dark:border-[#1E293B]"
          >
            {/* Drag Handle */}
            <View className="items-center pt-6 pb-2 bg-transparent w-full">
              <View className="w-12 h-1.5 bg-[#CBD5E1] dark:bg-[#475569] rounded-full" />
            </View>

            <View className="flex-row justify-between items-center px-8 mt-4">
              <Animated.View
                entering={FadeIn.delay(200)}
                className="overflow-hidden"
              >
                {step === "input" ? (
                  <Animated.View
                    key="header-input"
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(200)}
                  >
                    <ThemedText
                      variant="h2"
                      weight="bold"
                      className="text-[#0F172A] dark:text-[#F8FAFC] tracking-tight"
                    >
                      Legal Buddy AI
                    </ThemedText>
                    <ThemedText
                      variant="caption"
                      className="text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium"
                    >
                      AI-Powered Matchmaking
                    </ThemedText>
                  </Animated.View>
                ) : (
                  <Animated.View
                    key="header-results"
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(200)}
                  >
                    <ThemedText
                      variant="h2"
                      weight="bold"
                      className="text-[#0F172A] dark:text-[#F8FAFC] tracking-tight"
                    >
                      Top Matches
                    </ThemedText>
                    <ThemedText
                      variant="caption"
                      className="text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium"
                    >
                      Based on your query
                    </ThemedText>
                  </Animated.View>
                )}
              </Animated.View>

              <View className="bg-[#F1F5F9] dark:bg-[#334155] rounded-full w-10 h-10 overflow-hidden shadow-sm">
                <TouchableWithoutFeedback onPress={handleClose}>
                  <View className="w-full h-full items-center justify-center">
                    <X size={20} color={isDark ? "#F8FAFC" : "#0F172A"} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </LinearGradient>

          {/* Body Section (Darker/Gradient) */}
          <View className="flex-1 overflow-hidden relative rounded-t-[32px] -mt-8 z-20">
            <LinearGradient
              colors={isDark ? ["#0F172A", "#000000"] : ["#F8FAFC", "#FFFFFF"]}
              className="absolute inset-0"
            />

            <View className="p-8 flex-1">
              {step === "input" ? (
                <Animated.View
                  key="step-input"
                  className="flex-1 justify-center -mt-10"
                  entering={FadeIn.delay(100)}
                  exiting={FadeOut.duration(200)} // Simple FadeOut for stability
                >
                  <Animated.View entering={FadeInUp.delay(300).springify()}>
                    <ThemedText
                      variant="h2"
                      weight="bold"
                      className="text-center mb-8 leading-snug tracking-tight text-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      Tell me about your legal situation. I'll find the perfect
                      specialist for you.
                    </ThemedText>
                  </Animated.View>

                  <Animated.View entering={FadeInUp.delay(400).springify()}>
                    <Input
                      placeholder="E.g., I need a divorce lawyer who specializes in custody..."
                      placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                      value={query}
                      onChangeText={setQuery}
                      multiline
                      numberOfLines={4}
                      containerClassName="mb-10 shadow-sm"
                      className="min-h-[140px] text-[17px] p-5 bg-white dark:bg-[#0A0A0A] border-2 border-[#E2E8F0] dark:border-[#334155] rounded-3xl text-[#0F172A] dark:text-[#F8FAFC]"
                      style={{ textAlignVertical: "top" }}
                    />
                  </Animated.View>

                  <Animated.View entering={FadeInUp.delay(500).springify()}>
                    <TouchableOpacity
                      onPress={handleMatch}
                      className="w-full flex-row items-center justify-center bg-[#3B82F6] rounded-xl h-14 shadow-form shadow-[#3B82F6]/30"
                      activeOpacity={0.8}
                    >
                      <Sparkles size={20} color="#FFFFFF" />
                      <ThemedText className="font-bold text-[16px] text-white ml-2 tracking-tight">
                        Find My Advocate
                      </ThemedText>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              ) : (
                <Animated.View
                  key="step-results"
                  className="flex-1"
                  entering={FadeIn.duration(400)} // Simple FadeIn for stability
                  exiting={FadeOut.duration(200)}
                >
                  <AdvocateList scrollEnabled={true} />
                  <Button
                    label="Start Over"
                    variant="ghost"
                    onPress={() => {
                      Keyboard.dismiss();
                      setStep("input");
                      setQuery("");
                    }}
                    className="mt-4 mb-6"
                  />
                </Animated.View>
              )}
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

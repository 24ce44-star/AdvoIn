import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ui/ThemedText";
import { useAdvocateStore } from "@/features/advocates/store/useAdvocateStore";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Mic,
    MicOff,
    PhoneOff,
    ShieldCheck,
    Volume2,
    VolumeX,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const advocate = useAdvocateStore((state) => state.getAdvocateById(id));
  const router = useRouter();
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  // Animation values for pulsing rings
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    ring1.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }),
      -1,
      false,
    );
    ring2.value = withDelay(
      500,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      ),
    );
  }, []);

  const ringStyle = (sharedValue: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: interpolate(sharedValue.value, [0, 1], [0.5, 0]),
      transform: [{ scale: interpolate(sharedValue.value, [0, 1], [1, 2.2]) }],
    }));

  if (!advocate) return null;

  return (
    <View className="flex-1 bg-legal-navy relative">
      {/* Immersive Blurred Background */}
      <Image
        source={{ uri: advocate.imageUrl }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
        blurRadius={60}
      />
      <View className="absolute inset-0 bg-black/30" />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 300,
        }}
      />

      <SafeAreaView className="flex-1 justify-between items-center py-8">
        {/* Top: Secure Badge */}
        <View className="items-center w-full mt-2">
          <View className="flex-row items-center space-x-1.5 bg-black/20 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <ShieldCheck size={12} color="rgba(255,255,255,0.7)" />
            <ThemedText className="text-white/70 text-xs font-medium uppercase tracking-wider">
              End-to-End Encrypted
            </ThemedText>
          </View>
        </View>

        {/* Center: Avatar with Pulsing Rings */}
        <View className="items-center justify-center -mt-20">
          <View className="relative items-center justify-center">
            {/* Rings - Centered on Avatar */}
            <Animated.View
              className="absolute w-40 h-40 rounded-full border border-white/20 bg-white/5"
              style={[ringStyle(ring1), { zIndex: -1 }]}
            />
            <Animated.View
              className="absolute w-40 h-40 rounded-full border border-white/10 bg-white/5"
              style={[ringStyle(ring2), { zIndex: -1 }]}
            />

            {/* Main Avatar */}
            <View className="shadow-2xl shadow-black/80 z-10 bg-legal-navy rounded-full">
              <Avatar
                source={advocate.imageUrl}
                size="xl"
                initials={advocate.name.substring(0, 2)}
                className="w-36 h-36 border-4 border-white/10"
              />
            </View>
          </View>

          {/* Name & Status */}
          <View className="mt-8 items-center space-y-2 z-10">
            <ThemedText
              variant="h1"
              weight="bold"
              className="text-white text-center text-3xl shadow-lg font-primary"
            >
              {advocate.name}
            </ThemedText>
            <ThemedText className="text-white/70 text-center text-lg shadow-sm font-medium tracking-wide">
              Calling...
            </ThemedText>
          </View>
        </View>

        {/* Bottom: Controls */}
        <View className="w-full pb-12 items-center">
          {/* Action Buttons Row */}
          <View className="flex-row items-center justify-center gap-16 mb-16">
            {/* Mute Button */}
            <View className="items-center space-y-3">
              <TouchableOpacity
                onPress={() => setMuted(!muted)}
                className={`w-20 h-20 rounded-3xl items-center justify-center backdrop-blur-xl ${
                  muted ? "bg-white" : "bg-white/10"
                }`}
              >
                {muted ? (
                  <MicOff size={32} color="#000" strokeWidth={1.5} />
                ) : (
                  <Mic size={32} color="#FFF" strokeWidth={1.5} />
                )}
              </TouchableOpacity>
              <ThemedText className="text-white/60 text-sm font-medium tracking-wide">
                Mute
              </ThemedText>
            </View>

            {/* Speaker Button */}
            <View className="items-center space-y-3">
              <TouchableOpacity
                onPress={() => setSpeaker(!speaker)}
                className={`w-20 h-20 rounded-3xl items-center justify-center backdrop-blur-xl ${
                  speaker ? "bg-white" : "bg-white/10"
                }`}
              >
                {speaker ? (
                  <Volume2 size={32} color="#000" strokeWidth={1.5} />
                ) : (
                  <VolumeX size={32} color="#FFF" strokeWidth={1.5} />
                )}
              </TouchableOpacity>
              <ThemedText className="text-white/60 text-sm font-medium tracking-wide">
                Speaker
              </ThemedText>
            </View>
          </View>

          {/* End Call Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-24 h-24 rounded-full bg-legal-crimson items-center justify-center shadow-lg shadow-legal-crimson/30"
            activeOpacity={0.8}
          >
            <PhoneOff size={40} color="white" fill="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

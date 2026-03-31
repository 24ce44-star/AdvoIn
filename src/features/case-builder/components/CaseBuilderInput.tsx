import { useLegalTheme } from "@/hooks/useLegalTheme";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import {
    ArrowUp,
    Loader2,
    Mic,
    Paperclip,
    Square,
    Trash2,
    X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Image,
    Keyboard,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { GroqService } from "../services/groq.service";

interface CaseBuilderInputProps {
  onSend: (
    message: string,
    base64Images?: string[],
    aiDetectors?: string[],
    isSpoken?: boolean,
  ) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  bottomPadding?: number;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
}

export function CaseBuilderInput({
  onSend,
  placeholder = "Describe your situation in detail...",
  isLoading = false,
  disabled = false,
  bottomPadding = 100,
  isSpeaking = false,
  onStopSpeaking,
}: CaseBuilderInputProps) {
  const { colors, isDark } = useLegalTheme();
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Audio state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const pulseScale = useSharedValue(1);

  const scale = useSharedValue(1);
  const animatedKeyboardHeight = useSharedValue(0);
  const speakingPulse = useSharedValue(1);
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    if (isSpeaking) {
      speakingPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
        true,
      );
    } else {
      speakingPulse.value = withTiming(1);
    }
  }, [isSpeaking]);

  React.useEffect(() => {
    let interval: any;
    if (recording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      );
    } else {
      pulseScale.value = withTiming(1);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") return;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const optimizedVoiceOptions = {
        isMeteringEnabled: true,
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 64000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(
        optimizedVoiceOptions,
      );
      const Speech = require("expo-speech");
      Speech.stop();
      setRecording(newRecording);
      setRecordingDuration(0);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecordingAndSend = async () => {
    if (!recording) return;
    setIsTranscribing(true);
    setRecording(null);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) {
        const spokenText = await GroqService.transcribeAudio(uri);
        if (spokenText && spokenText.trim() !== "") {
          onSend(spokenText, undefined, undefined, true);
        }
      }
    } catch (error) {
      console.error("Transcription failed:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;
    setRecording(null);
    try {
      await recording.stopAndUnloadAsync();
    } catch (e) {}
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const speakingPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speakingPulse.value }],
  }));

  const pickImage = async () => {
    try {
      if (attachments.length >= 3) {
        alert("You can only upload up to 3 images at once to save limits.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 3 - attachments.length,
        base64: true,
        quality: 0.1, // EXTREME compression to save tokens drastically
        exif: true, // Extract metadata to detect AI generators and C2PA
      });

      if (!result.canceled) {
        setAttachments([...attachments, ...result.assets].slice(0, 3));
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(attachments.filter((_, index) => index !== indexToRemove));
  };

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: any) => {
        setKeyboardVisible(true);
        if (Platform.OS === "ios" && e?.endCoordinates?.height) {
          animatedKeyboardHeight.value = withTiming(e.endCoordinates.height, {
            duration: e.duration || 250,
          });
        }
      },
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e: any) => {
        setKeyboardVisible(false);
        if (Platform.OS === "ios") {
          animatedKeyboardHeight.value = withTiming(0, {
            duration: e?.duration || 250,
          });
        }
        inputRef.current?.blur();
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !isLoading && !disabled) {
      const imagesBase64 = attachments
        .map((a) => a.base64)
        .filter(Boolean) as string[];

      const aiDetectors = attachments
        .map((a) => {
          if (!a.exif) return null;
          const eStr = JSON.stringify(a.exif).toLowerCase();
          if (eStr.includes("dall-e") || eStr.includes("openai"))
            return "OpenAI DALL-E";
          if (eStr.includes("midjourney")) return "Midjourney";
          if (eStr.includes("stable diffusion") || eStr.includes("stabilityai"))
            return "Stable Diffusion";
          if (eStr.includes("firefly")) return "Adobe Firefly";
          if (eStr.includes("bing") || eStr.includes("designer"))
            return "Microsoft Designer";
          if (
            eStr.includes("gemini") ||
            eStr.includes("imagen") ||
            eStr.includes("google ai")
          )
            return "Google Gemini/Imagen";
          if (eStr.includes("c2pa")) return "C2PA AI Entity";
          return null;
        })
        .filter(Boolean) as string[];

      onSend(
        message.trim(),
        imagesBase64.length > 0 ? imagesBase64 : undefined,
        aiDetectors.length > 0 ? aiDetectors : undefined,
      );
      setMessage("");
      setAttachments([]);
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const canSend =
    (message.trim().length > 0 || attachments.length > 0) &&
    !isLoading &&
    !disabled;

  return (
    <View className="w-full">
      <View
        className="px-4 pt-3 bg-transparent"
        style={{
          paddingBottom: isFocused || isKeyboardVisible ? 16 : bottomPadding,
        }}
      >
        {attachments.length > 0 && (
          <View className="flex-row flex-wrap gap-3 pb-3">
            {attachments.map((asset, index) => (
              <View
                key={index}
                className="relative mt-2 mr-2 bg-white dark:bg-neutral-900 rounded-xl"
                style={{
                  elevation: 4,
                  shadowColor: isDark ? "#000" : "#0F172A",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                }}
              >
                <Image
                  source={{ uri: asset.uri }}
                  className="w-20 h-20 rounded-xl"
                  style={{
                    borderWidth: 1,
                    borderColor: isDark ? "#262626" : "#E2E8F0",
                  }}
                />
                <TouchableOpacity
                  onPress={() => removeAttachment(index)}
                  className="absolute -top-2 -right-2 bg-neutral-800/90 dark:bg-neutral-600/90 rounded-full w-6 h-6 items-center justify-center border border-white/20"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={14} color="white" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View
          className={`bg-white dark:bg-neutral-900 rounded-3xl pt-2 px-3 pb-2 ${
            isFocused || isKeyboardVisible
              ? "border border-[#0F172A] dark:border-[#38BDF8]"
              : "border border-legal-slate/15 dark:border-neutral-800"
          }`}
          style={{
            elevation: 6,
            shadowColor: isDark ? "#000" : "#0F172A",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
          }}
        >
          <View className="flex-row items-end px-2">
            {isSpeaking ? (
              <Animated.View style={speakingPulseStyle} className="mr-2 mb-1">
                <TouchableOpacity
                  onPress={onStopSpeaking}
                  className="p-2 rounded-full bg-red-500/15 dark:bg-red-500/20 items-center justify-center"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View className="w-[22px] h-[22px] items-center justify-center">
                    <View className="w-[10px] h-[10px] rounded-sm bg-red-500" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                disabled={isLoading || disabled || attachments.length >= 3}
                className={`mr-2 mb-1 p-2 rounded-full justify-center items-center ${
                  attachments.length >= 3
                    ? "opacity-50"
                    : "active:bg-legal-slate/10 dark:active:bg-neutral-800"
                }`}
              >
                <Paperclip
                  size={22}
                  color={isDark ? "#A3A3A3" : "#64748B"}
                  strokeWidth={2}
                  style={{ transform: [{ rotate: "45deg" }] }}
                />
              </TouchableOpacity>
            )}

            {recording ? (
              <View className="flex-1 flex-row items-center justify-between px-2 h-10 mb-0.5">
                <View className="flex-row items-center">
                  <Animated.View style={pulseStyle}>
                    <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-3" />
                  </Animated.View>
                  <Text className="text-red-500 dark:text-red-400 font-medium text-[16px]">
                    Recording {formatDuration(recordingDuration)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={cancelRecording}
                  className="p-1 opacity-80 active:opacity-50"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={20} color={isDark ? "#F8FAFC" : "#64748B"} />
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                ref={inputRef}
                value={message}
                onChangeText={setMessage}
                placeholder={placeholder}
                placeholderTextColor={isDark ? "#737373" : "#94A3B8"}
                multiline
                maxLength={1000}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                editable={!disabled && !isLoading && !isTranscribing}
                className="flex-1 text-[16px] text-[#0F172A] dark:text-[#F8FAFC] py-2 max-h-32 mb-0.5 leading-[22px]"
                style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
            )}
            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                onPress={
                  recording
                    ? stopRecordingAndSend
                    : canSend
                      ? handleSend
                      : startRecording
                }
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || isLoading || isTranscribing}
                className={`ml-3 mb-0.5 w-10 h-10 rounded-full items-center justify-center ${
                  canSend || recording
                    ? "bg-[#0F172A] dark:bg-[#38BDF8]"
                    : "bg-legal-slate/10 dark:bg-neutral-800"
                }`}
                activeOpacity={0.8}
              >
                {isLoading || isTranscribing ? (
                  <Loader2
                    size={20}
                    color={
                      canSend || recording
                        ? isDark
                          ? "#0F172A"
                          : "white"
                        : isDark
                          ? "#525252"
                          : "#94A3B8"
                    }
                    className="animate-spin"
                  />
                ) : recording ? (
                  <Square
                    size={16}
                    color={isDark ? "#0F172A" : "white"}
                    fill={isDark ? "#0F172A" : "white"}
                  />
                ) : canSend ? (
                  <ArrowUp
                    size={20}
                    color={isDark ? "#0F172A" : "white"}
                    strokeWidth={2.5}
                  />
                ) : (
                  <Mic
                    size={20}
                    color={isDark ? "#A3A3A3" : "#64748B"}
                    strokeWidth={2.5}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
      {Platform.OS === "ios" && (
        <Animated.View
          style={[
            { width: "100%" },
            useAnimatedStyle(() => ({
              height: animatedKeyboardHeight.value,
            })),
          ]}
        />
      )}
    </View>
  );
}

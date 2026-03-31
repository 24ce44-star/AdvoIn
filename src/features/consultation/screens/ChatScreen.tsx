import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";
import { useAdvocateStore } from "@/features/advocates/store/useAdvocateStore";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
    ArrowLeft,
    Camera,
    Download,
    FileText,
    Image as ImageIcon,
    Lock,
    Mic,
    MoreVertical,
    Paperclip,
    Pause,
    Phone,
    Play,
    Plus,
    Send as SendIcon,
    Share2,
    Trash2,
    Video,
} from "lucide-react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    Modal,
    PanResponder,
    Platform,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Vibration,
    View,
} from "react-native";
import {
    Bubble,
    Composer,
    Day,
    GiftedChat,
    InputToolbar,
    Message,
    MessageText,
    Time,
} from "react-native-gifted-chat";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

interface IMessage {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: {
    _id: string | number;
    name?: string;
    avatar?: string | number;
  };
  image?: string;
  video?: string;
  audio?: string;
  document?: { uri: string; name: string; size: number; thumbnailUri?: string };
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VoiceRecordButton = ({
  isDark,
  onSendVoice,
  text,
  onSendText,
}: {
  isDark: boolean;
  onSendVoice: (time: number, uri: string) => void;
  text: string;
  onSendText: () => void;
}) => {
  const hasText = text && text.trim().length > 0;

  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [metering, setMetering] = useState<number[]>(new Array(20).fill(-160));

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Crucial refs to sync native mic instances with JS async loops
  const recordingRef = useRef<Audio.Recording | null>(null);

  const stateRef = useRef({
    isRecording: false,
    isLocked: false,
    isCancelled: false,
    isStarting: false,
  });

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseAnim.setValue(1);
    pulseAnim.stopAnimation();
  }, [pulseAnim]);

  const cleanup = useCallback(
    async (shouldSend = false) => {
      stopPulse();

      let finalUri = null;
      let finalDuration = 0;

      // Destroy native Expo AV Audio Mic Instance safely
      if (recordingRef.current) {
        try {
          const status = await recordingRef.current.getStatusAsync();
          finalDuration = Math.floor((status.durationMillis || 0) / 1000);
          await recordingRef.current.stopAndUnloadAsync();
          finalUri = recordingRef.current.getURI();
        } catch (err) {}
        recordingRef.current = null;
      }

      setIsRecording(false);
      setIsLocked(false);

      // 🔥 CRITICAL FIX: Fully reset the stateRef so locks don't permanently brick subsequent uses!
      stateRef.current = {
        isRecording: false,
        isLocked: false,
        isCancelled: false,
        isStarting: false,
      };

      // IMPORTANT: JS-driven spring for values that will later be `.setValue()`'d by PanResponder
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false }),
        Animated.spring(slideAnim, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }),
      ]).start();

      if (shouldSend && finalUri && finalDuration > 0) {
        onSendVoice(finalDuration, finalUri);
      }

      setRecordTime(0);
      setMetering(new Array(20).fill(-160));
    },
    [onSendVoice, stopPulse, scaleAnim, slideAnim],
  );

  const panResponder = useRef(
    PanResponder.create({
      // 🔥 CRITICAL FIX: If locked, physically surrender touch capture to descendants (the Send button!)
      onStartShouldSetPanResponder: () => !stateRef.current.isLocked,
      onMoveShouldSetPanResponder: () => !stateRef.current.isLocked,
      onPanResponderGrant: async () => {
        if (stateRef.current.isLocked) return;

        setIsRecording(true);
        stateRef.current = {
          isRecording: true,
          isLocked: false,
          isCancelled: false,
          isStarting: true,
        };

        startPulse();
        Animated.spring(scaleAnim, {
          toValue: 1.8,
          useNativeDriver: false,
          friction: 6,
        }).start();

        // NATIVE AUDIO INTEGRATION
        try {
          const permission = await Audio.requestPermissionsAsync();
          if (permission.status === "granted") {
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
              playThroughEarpieceAndroid: false,
              staysActiveInBackground: true,
              shouldDuckAndroid: true,
            });

            // Setup highly optimized recording profile: Opus (WEBM on Android) / low bitrate AAC on iOS
            const customOpusOptions: Audio.RecordingOptions = {
              ...Audio.RecordingOptionsPresets.LOW_QUALITY,
              android: {
                extension: ".webm",
                outputFormat: 9, // WEBM
                audioEncoder: 7, // OPUS
                sampleRate: 16000,
                numberOfChannels: 1,
                bitRate: 24000,
              },
              ios: {
                ...Audio.RecordingOptionsPresets.LOW_QUALITY.ios,
                audioQuality: Audio.IOSAudioQuality.LOW,
                sampleRate: 16000,
                numberOfChannels: 1,
                bitRate: 24000,
              },
            };

            const { recording } = await Audio.Recording.createAsync(
              customOpusOptions,
              (status) => {
                if (status.isRecording) {
                  setRecordTime(Math.floor(status.durationMillis / 1000));
                  if (status.metering !== undefined) {
                    setMetering((prev) => {
                      const next = [...prev, status.metering!];
                      if (next.length > 20) return next.slice(next.length - 20);
                      return next;
                    });
                  }
                }
              },
              150, // smooth 150ms animated intervals
            );

            // If user already quickly swiped left to cancel before the mic booted up, destroy it!
            if (!stateRef.current.isRecording || stateRef.current.isCancelled) {
              await recording.stopAndUnloadAsync();
              return;
            }

            recordingRef.current = recording;
          }
        } catch (err) {
          console.warn("Audio failure:", err);
          cleanup(false);
        } finally {
          stateRef.current.isStarting = false;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (stateRef.current.isLocked || stateRef.current.isCancelled) return;

        // Swipe Left to Cancel
        if (gestureState.dx < -100) {
          if (!stateRef.current.isCancelled) {
            stateRef.current.isCancelled = true;
            Vibration.vibrate([0, 50, 100, 50]);
            cleanup(false);
          }
          return;
        }

        // Swipe Up to Lock
        if (gestureState.dy < -70) {
          setIsLocked(true);
          stateRef.current.isLocked = true;
          Animated.spring(slideAnim, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
          return;
        }

        // Only allow boundaries
        let newX = gestureState.dx > 0 ? 0 : gestureState.dx;
        let newY = gestureState.dy > 0 ? 0 : gestureState.dy;
        slideAnim.setValue({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        if (stateRef.current.isCancelled || stateRef.current.isLocked) return;

        // Wait gracefully for mic init before shutting down
        if (stateRef.current.isStarting) {
          setTimeout(() => cleanup(true), 300);
        } else {
          cleanup(true);
        }
      },
      onPanResponderTerminate: () => {
        // Guarantee it doesn't get bricked if a ScrollView forcefully steals the gesture!
        cleanup(false);
      },
    }),
  ).current;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (hasText) {
    return (
      <TouchableOpacity
        onPress={onSendText}
        activeOpacity={0.7}
        style={styles.sendButtonWrapper}
      >
        <LinearGradient
          colors={isDark ? ["#1E3A8A", "#0F172A"] : ["#0F172A", "#1E3A8A"]}
          style={styles.sendButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SendIcon size={18} color="#FFFFFF" style={{ marginLeft: -2 }} />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.sendButtonWrapper}>
      {/* WHATSAPP FULL OVERLAY WHEN RECORDING */}
      {isRecording && (
        <Animated.View
          style={{
            position: "absolute",
            right: -8, // Anchor perfectly past the inner edge padding
            top: -8, // Anchor centrally to engulf the wrapper height
            width: SCREEN_WIDTH - 32, // Expansively cover exact InputToolbar space (margin 16x2)
            height: 56, // Precisely match minHeight of the pill
            backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 64, // keeps clear of active thumb space
            paddingLeft: 20,
            borderRadius: 36, // PERFECTLY matches the 36px border radius of the Input pill!
            zIndex: 100,
          }}
        >
          <View className="flex-row items-center flex-1">
            {/* Pulse Dot */}
            {!isLocked && (
              <Animated.View style={{ opacity: pulseAnim, marginRight: 8 }}>
                <View className="w-2.5 h-2.5 rounded-full bg-legal-crimson" />
              </Animated.View>
            )}

            {/* Live Time */}
            <ThemedText
              style={{
                color: isDark ? "#FFFFFF" : "#000000",
                fontSize: 16,
                fontWeight: "500",
                marginRight: 12,
              }}
            >
              {formatTime(recordTime)}
            </ThemedText>

            {/* The Live Audio Sound Waves Visualizer! */}
            <View className="flex-row items-end h-[24px] gap-0.5 flex-1 overflow-hidden justify-center max-w-[140px]">
              {metering.map((m, i) => {
                const dbMax = 50;
                const normalized = Math.max(0, m + 60);
                const barHeight = Math.max(2, (normalized / dbMax) * 20);
                return (
                  <View
                    key={i}
                    style={{
                      width: 3,
                      height: barHeight,
                      backgroundColor: isLocked ? "#3B82F6" : "#E11D48", // legal-crimson
                      borderRadius: 2,
                    }}
                  />
                );
              })}
            </View>
          </View>

          {isLocked ? (
            <TouchableOpacity
              onPress={() => {
                Vibration.vibrate(50);
                stateRef.current.isCancelled = true;
                cleanup(false);
              }}
              className="px-3 py-2 flex-row items-center mr-2"
            >
              <Trash2 size={18} color="#E11D48" />
            </TouchableOpacity>
          ) : (
            <ThemedText
              style={{
                color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                fontSize: 13,
                marginRight: 20,
              }}
            >
              {"< Slide to cancel"}
            </ThemedText>
          )}
        </Animated.View>
      )}

      {/* LOCK ICON POPUP */}
      {isRecording && !isLocked && (
        <Animated.View
          style={{
            position: "absolute",
            top: -70,
            alignSelf: "center",
            alignItems: "center",
            zIndex: 90,
          }}
        >
          <View className="bg-legal-slate/10 p-2 rounded-full mb-1">
            <Lock
              size={16}
              color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}
            />
          </View>
          <ThemedText
            style={{
              fontSize: 10,
              color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              fontWeight: "600",
            }}
          >
            ^ Lock
          </ThemedText>
        </Animated.View>
      )}

      {/* THE BUTTON */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.sendButton,
          {
            backgroundColor: isRecording
              ? isLocked
                ? isDark
                  ? "#1E3A8A"
                  : "#0F172A"
                : "#E11D48"
              : isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.04)",
            transform: [
              { scale: scaleAnim },
              { translateX: slideAnim.x },
              { translateY: slideAnim.y },
            ],
            zIndex: 110,
          },
        ]}
      >
        {isLocked ? (
          <TouchableOpacity
            onPress={() => cleanup(true)}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SendIcon size={18} color="#FFFFFF" style={{ marginLeft: -2 }} />
          </TouchableOpacity>
        ) : (
          <Mic
            size={18}
            color={
              isRecording
                ? "#FFFFFF"
                : isDark
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(0,0,0,0.6)"
            }
          />
        )}
      </Animated.View>
    </View>
  );
};

const AudioPlayerBubble = ({
  uri,
  isDark,
  timeStr,
  isSentByMe,
  isSameUserPrev,
  isSameUserNext,
}: {
  uri: string;
  isDark: boolean;
  timeStr?: string;
  isSentByMe?: boolean;
  isSameUserPrev?: boolean;
  isSameUserNext?: boolean;
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);

  // Robust cleanup ensures absolutely no memory leaks on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 0);
        setIsPlaying(status.isPlaying);
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(0);
          sound?.setPositionAsync(0);
        }
      }
    },
    [sound],
  );

  const loadSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 50 }, // High frequency for smooth progress
        onPlaybackStatusUpdate,
      );
      setSound(newSound);
    } catch (e) {
      console.warn("AdvoIn Audio Engine: Failed to load sound", e);
    }
  };

  const togglePlayPause = useCallback(async () => {
    if (!sound) {
      await loadSound();
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  }, [sound, isPlaying, uri]);

  const handleSeek = useCallback(
    async (e: any) => {
      if (!sound || duration === 0 || trackWidth === 0) return;

      const { locationX } = e.nativeEvent;
      // Calculate precise scrub point
      const percent = Math.max(0, Math.min(1, locationX / trackWidth));
      const targetPos = Math.floor(percent * duration);

      // Update local state instantly for hyper-responsive UI, then sync engine
      setPosition(targetPos);
      await sound.setPositionAsync(targetPos);
    },
    [sound, duration, trackWidth],
  );

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  // New High-End Premium Theme Variables for Audio Card
  const cardBg = isSentByMe
    ? isDark
      ? "#1E3A8A"
      : "#0F172A" // Deep navy for sent (matching text bubbles)
    : isDark
      ? "#1E293B"
      : "#FFFFFF"; // Clean contrast for received

  const playBtnBg = isSentByMe
    ? "rgba(255,255,255,0.15)"
    : isDark
      ? "rgba(255,255,255,0.1)"
      : "rgba(0,0,0,0.06)";

  const playBtnIcon = isSentByMe ? "#FFFFFF" : isDark ? "#FAFAFA" : "#0F172A";
  const trackBg = isSentByMe ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.12)";
  const trackFill = isSentByMe ? "#FFFFFF" : "#0F172A";
  const primaryText = isSentByMe ? "#FFFFFF" : isDark ? "#FFFFFF" : "#0F172A";
  const secondaryText = isSentByMe
    ? "rgba(255,255,255,0.7)"
    : isDark
      ? "rgba(255,255,255,0.5)"
      : "rgba(0,0,0,0.5)";

  return (
    <View
      className="flex-row items-center relative"
      style={{
        backgroundColor: cardBg,
        minWidth: 230,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginVertical: 0,
        borderTopLeftRadius: isSentByMe ? 20 : isSameUserPrev ? 6 : 20,
        borderTopRightRadius: isSentByMe ? (isSameUserPrev ? 6 : 20) : 20,
        borderBottomLeftRadius: isSentByMe ? 20 : isSameUserNext ? 6 : 4,
        borderBottomRightRadius: isSentByMe ? (isSameUserNext ? 6 : 4) : 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 2,
        elevation: 1,
        // Match border styling logic from standard bubbles
        borderWidth: isSentByMe ? 0 : 1,
        borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      }}
    >
      <TouchableOpacity
        onPress={togglePlayPause}
        activeOpacity={0.8}
        className="w-12 h-12 rounded-full items-center justify-center shadow-sm"
        style={{
          backgroundColor: playBtnBg,
          marginRight: 14,
        }}
      >
        {isPlaying ? (
          <Pause size={20} color={playBtnIcon} fill={playBtnIcon} />
        ) : (
          <Play
            size={20}
            color={playBtnIcon}
            fill={playBtnIcon}
            style={{ marginLeft: 3 }}
          />
        )}
      </TouchableOpacity>

      <View className="flex-1 justify-center">
        {/* Animated Custom Linear Progress Wave */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleSeek}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          style={{ paddingVertical: 8, marginTop: 2, marginBottom: 2 }}
        >
          <View
            className="h-1.5 rounded-full w-full relative overflow-hidden"
            style={{ backgroundColor: trackBg }}
          >
            <View
              className="absolute left-0 top-0 bottom-0 rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: trackFill,
              }}
            />
          </View>
        </TouchableOpacity>

        {/* Crisp Data Row */}
        <View className="flex-row justify-between items-center mt-1">
          <ThemedText
            style={{
              fontSize: 12,
              color: primaryText,
              fontWeight: "700",
              fontVariant: ["tabular-nums"],
              letterSpacing: 0.3,
            }}
          >
            {formatTime(position)}
          </ThemedText>

          <View className="flex-row items-center">
            {timeStr && (
              <ThemedText
                style={{
                  fontSize: 11,
                  color: secondaryText,
                  fontWeight: "600",
                  marginRight: isSentByMe ? 4 : 0,
                  letterSpacing: 0.3,
                }}
              >
                {timeStr}
              </ThemedText>
            )}
            {isSentByMe && (
              <Ionicons name="checkmark-done" size={15} color={secondaryText} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const advocateId = Array.isArray(id) ? id[0] : id;
  const advocate = useAdvocateStore((state) =>
    state.getAdvocateById(advocateId),
  );
  const router = useRouter();
  const { colors, isDark } = useLegalTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [messages, setMessages] = useState<IMessage[]>([]);

  // Robust keyboard state management
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardAnimationRef = useRef<Animated.Value>(
    new Animated.Value(0),
  ).current;

  // Distinct Premium Colors High Contrast
  // - Header & Input Pill: Identical floating elements (White in Light, Deep Gray in Dark)
  // - Chat Body Background: Contrasting canvas (Soft Gray in Light, True OLED Black in Dark)
  const headerBgColor = isDark ? "#1C1C1E" : "#FFFFFF"; // subtle dark gray or white
  const chatBgColor = isDark ? "#000000" : "#F0F4F8"; // black or legal-ice

  // Sticky Date Logic
  const [currentVisibleDate, setCurrentVisibleDate] = useState<Date | null>(
    null,
  );
  const [showStickyDate, setShowStickyDate] = useState(false);
  const hideDateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastShownDateString = useRef<string | null>(null);

  // High-Performance Native Image Viewer State
  const [previewMessage, setPreviewMessage] = useState<IMessage | null>(null);
  const [previewControlsVisible, setPreviewControlsVisible] = useState(true);

  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const attachmentAnim = useRef(new Animated.Value(0)).current;

  const toggleAttachmentMenu = useCallback(() => {
    Keyboard.dismiss();
    setIsAttachmentMenuOpen((prev) => {
      const willOpen = !prev;
      Animated.spring(attachmentAnim, {
        toValue: willOpen ? 1 : 0,
        friction: 8,
        tension: 60,
        useNativeDriver: false,
      }).start();
      return willOpen;
    });
  }, [attachmentAnim]);

  const closeAttachmentMenu = useCallback(() => {
    setIsAttachmentMenuOpen((prev) => {
      if (prev) {
        Animated.spring(attachmentAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: false,
        }).start();
      }
      return false;
    });
  }, [attachmentAnim]);

  const mediaMessages = useMemo(() => {
    return messages.filter((m: IMessage) => !!m.image).reverse();
  }, [messages]);

  // Pure Native Matrix Physics Interceptors
  const previewPan = useRef(new Animated.ValueXY()).current;
  const previewPinchScale = useRef(new Animated.Value(1)).current;
  const currentPinchScale = useRef(1);
  const isPinching = useRef(false);
  const touchStartDist = useRef<number | null>(null);

  useEffect(() => {
    const scaleId = previewPinchScale.addListener(({ value }) => {
      currentPinchScale.current = value;
    });
    return () => previewPinchScale.removeListener(scaleId);
  }, [previewPinchScale]);

  const previewBgOpacity = previewPan.y.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.2, 1, 0.2],
    extrapolate: "clamp",
  });
  const previewScalePan = previewPan.y.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.85, 1, 0.85],
    extrapolate: "clamp",
  });

  const previewPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (e, gestureState) => {
        const touches = e.nativeEvent.touches;
        if (touches && touches.length >= 2) return true;
        // Only claim vertical drags to dismiss if we are not pinching
        if (
          touches &&
          touches.length === 1 &&
          Math.abs(gestureState.dy) > 15 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          currentPinchScale.current <= 1.05
        ) {
          return true;
        }
        return false;
      },
      onPanResponderGrant: (e) => {
        const touches = e.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          isPinching.current = true;
          const t1 = touches[0];
          const t2 = touches[1];
          touchStartDist.current = Math.sqrt(
            Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2),
          );
        }
      },
      onPanResponderMove: (e, gestureState) => {
        const touches = e.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          isPinching.current = true;
          const t1 = touches[0];
          const t2 = touches[1];
          const dist = Math.sqrt(
            Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2),
          );
          if (!touchStartDist.current) {
            touchStartDist.current = dist;
          }
          const scaleRatio = Math.max(0.8, dist / touchStartDist.current);
          previewPinchScale.setValue(scaleRatio);
          previewPan.setValue({ x: gestureState.dx, y: gestureState.dy });
        } else if (
          touches &&
          touches.length === 1 &&
          currentPinchScale.current <= 1.05
        ) {
          previewPan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        const wasPinching = isPinching.current;
        isPinching.current = false;
        touchStartDist.current = null;

        if (wasPinching) {
          // Instagram-style elastic rebound
          Animated.spring(previewPinchScale, {
            toValue: 1,
            friction: 7,
            useNativeDriver: true,
          }).start();
          Animated.spring(previewPan, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            useNativeDriver: true,
          }).start();
          return;
        }

        if (
          Math.abs(gestureState.dy) > 100 ||
          (Math.abs(gestureState.dy) > 20 && Math.abs(gestureState.vy) > 0.5)
        ) {
          Animated.timing(previewPan, {
            toValue: {
              x: gestureState.dx || 0,
              y: gestureState.dy > 0 ? SCREEN_WIDTH * 2 : -SCREEN_WIDTH * 2,
            },
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setPreviewMessage(null);
            setPreviewControlsVisible(true);
            previewPan.setValue({ x: 0, y: 0 });
            previewPinchScale.setValue(1);
          });
        } else {
          Animated.spring(previewPan, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        isPinching.current = false;
        touchStartDist.current = null;
        Animated.spring(previewPinchScale, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }).start();
        Animated.spring(previewPan, {
          toValue: { x: 0, y: 0 },
          friction: 7,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const formatStickyDate = useCallback((date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      for (let i = viewableItems.length - 1; i >= 0; i--) {
        const item = viewableItems[i]?.item;
        if (item && item.createdAt) {
          const topDate = new Date(item.createdAt);
          const newDateStr = formatStickyDate(topDate);
          setCurrentVisibleDate(topDate);

          if (lastShownDateString.current !== newDateStr) {
            lastShownDateString.current = newDateStr;
          }
          break;
        }
      }
    }
  }).current;

  // Reactivate dynamic scroll pill
  const handleScroll = useCallback(() => {
    setShowStickyDate(true);
    if (hideDateTimeout.current) clearTimeout(hideDateTimeout.current);
    hideDateTimeout.current = setTimeout(() => {
      setShowStickyDate(false);
    }, 1500);
  }, []);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: `Hello! This is Adv. ${advocate?.name?.split(" ")?.[1] || "Advocate"}. How can I assist you today?`,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: advocate?.name || "Advocate",
          avatar: advocate?.imageUrl,
        },
      },
    ]);
  }, [advocate]);

  // Correct initialized starting point. iOS remains static since GiftedChat natively moves it.
  // Android sits at 0 until manual keyboard event moves it.
  useEffect(() => {
    if (!isKeyboardVisible) {
      keyboardAnimationRef.setValue(0);
    }
  }, []);

  // Robust keyboard handling with animation
  useEffect(() => {
    const baseOffset = Platform.OS === "ios" ? insets.bottom || 0 : 0;

    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        const height = e.endCoordinates.height;
        setKeyboardHeight(height);
        setIsKeyboardVisible(true);

        Animated.timing(keyboardAnimationRef, {
          // Native GiftedChat/OS handles the physical screen shrink safely on BOTH OS platforms.
          // We only animate to `-16` to elegantly counter the floating `marginBottom: 32` pill
          // to make it sit exactly 16px hovering over the keyboard!
          toValue: -16,
          duration: Platform.OS === "ios" ? e.duration || 250 : 200,
          useNativeDriver: false,
        }).start();
      },
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);

        Animated.timing(keyboardAnimationRef, {
          toValue: 0,
          duration: Platform.OS === "ios" ? e?.duration || 250 : 200,
          useNativeDriver: false,
        }).start();
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardAnimationRef, insets.bottom]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages),
    );
  }, []);

  if (!advocate) {
    return (
      <SafeAreaView className="flex-1 bg-legal-ice dark:bg-black items-center justify-center">
        <ThemedText
          variant="h3"
          className="text-legal-navy dark:text-legal-ice mb-4"
        >
          Advocate not found
        </ThemedText>
        <Button label="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const renderInputToolbar = (props: any) => {
    return (
      <Animated.View
        style={{
          position: "absolute",
          bottom: keyboardAnimationRef,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <Animated.View
          style={{
            marginHorizontal: 16,
            paddingTop: 16, // Pixel perfect symmetry vertically (16 top, 16 visible bottom)
            paddingBottom: attachmentAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 32],
            }),
            height: attachmentAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 150],
            }),
            opacity: attachmentAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            }),
            marginBottom: -22,
            backgroundColor: isDark ? "#2C2C2E" : "#F4F4F5", // Matching reference image container bg
            borderTopLeftRadius: 38, // 22 (inner) + 16 (gap) = 38 (perfect concentric math)
            borderTopRightRadius: 38,
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 16, // Perfect match with top margin
            shadowColor: isDark ? "#000" : "#1E293B",
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: isDark ? 0.4 : 0.05,
            shadowRadius: 16,
            elevation: 4,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.04)"
              : "rgba(0, 0, 0, 0.04)",
            borderBottomWidth: 0,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  translateY: attachmentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              onPress={handleCameraPick}
              activeOpacity={0.7}
              style={{
                width: 96,
                height: 96,
                borderRadius: 22,
                backgroundColor: isDark ? "#3A3A3C" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: isDark ? "#000" : "#1E293B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.2 : 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Camera
                size={28}
                color={isDark ? "#FFFFFF" : "#1E293B"}
                strokeWidth={1.5}
                style={{ marginBottom: 6 }}
              />
              <ThemedText
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: isDark ? "#FFFFFF" : "#1E293B",
                }}
              >
                Camera
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              transform: [
                {
                  translateY: attachmentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              onPress={handleMediaPick}
              activeOpacity={0.7}
              style={{
                width: 96,
                height: 96,
                borderRadius: 22,
                backgroundColor: isDark ? "#3A3A3C" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: isDark ? "#000" : "#1E293B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.2 : 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <ImageIcon
                size={28}
                color={isDark ? "#FFFFFF" : "#1E293B"}
                strokeWidth={1.5}
                style={{ marginBottom: 6 }}
              />
              <ThemedText
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: isDark ? "#FFFFFF" : "#1E293B",
                }}
              >
                Photos
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              transform: [
                {
                  translateY: attachmentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              onPress={handleDocumentPick}
              activeOpacity={0.7}
              style={{
                width: 96,
                height: 96,
                borderRadius: 22,
                backgroundColor: isDark ? "#3A3A3C" : "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: isDark ? "#000" : "#1E293B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.2 : 0.08,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Paperclip
                size={26} // Paperclip is naturally taller, so 26 physically balances next to a 28 square Image/Camera
                color={isDark ? "#FFFFFF" : "#1E293B"}
                strokeWidth={1.5}
                style={{ marginBottom: 6 }}
              />
              <ThemedText
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: isDark ? "#FFFFFF" : "#1E293B",
                }}
              >
                Files
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        <InputToolbar
          {...props}
          containerStyle={[
            styles.inputToolbar,
            {
              backgroundColor: headerBgColor,
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.06)",
              borderWidth: StyleSheet.hairlineWidth,
              marginTop: -6,
              marginBottom: 32,
              borderTopLeftRadius: isAttachmentMenuOpen ? 28 : 36, // Shape-shifts to a softer radius rather than rigid 0
              borderTopRightRadius: isAttachmentMenuOpen ? 28 : 36,
              shadowColor: isDark ? "#000" : "#1E293B",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: isDark ? 0.8 : 0.08,
              shadowRadius: 32,
              elevation: 8,
            },
          ]}
          primaryStyle={styles.inputToolbarPrimary}
        />
      </Animated.View>
    );
  };

  const handleMediaPick = async () => {
    closeAttachmentMenu();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const newMsg: IMessage = {
        _id: Math.round(Math.random() * 1000000).toString(),
        text: "",
        createdAt: new Date(),
        user: { _id: 1 },
        image: result.assets[0].uri,
      };
      onSend([newMsg]);
    }
  };

  const handleCameraPick = async () => {
    closeAttachmentMenu();
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const newMsg: IMessage = {
        _id: Math.round(Math.random() * 1000000).toString(),
        text: "",
        createdAt: new Date(),
        user: { _id: 1 },
        image: result.assets[0].uri,
      };
      onSend([newMsg]);
    }
  };

  const handleDocumentPick = async () => {
    closeAttachmentMenu();
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const doc = result.assets[0];
      let thumbnailUri = undefined;

      try {
        // Attempt dynamically generating a crisp HD thumb of the first PDF page.
        // REQUIRES react-native-pdf-thumbnail package to be installed natively via prebuild.
        const PdfThumbnail = require("react-native-pdf-thumbnail").default;
        const thumbResult = await PdfThumbnail.generate(doc.uri, 0, 80);
        thumbnailUri = thumbResult.uri;
      } catch (e) {
        console.log("PDF Thumbnail generation skipped/failed:", e);
      }

      const newMsg: IMessage = {
        _id: Math.round(Math.random() * 1000000).toString(),
        text: "",
        createdAt: new Date(),
        user: { _id: 1 },
        document: {
          uri: doc.uri,
          name: doc.name,
          size: doc.size || 0,
          thumbnailUri,
        },
      };
      onSend([newMsg]);
    }
  };

  const renderActions = (props: any) => (
    <View style={[styles.actionsContainer, { zIndex: 100 }]}>
      <TouchableOpacity
        onPress={toggleAttachmentMenu}
        activeOpacity={0.7}
        style={[
          styles.actionButton,
          {
            backgroundColor: isAttachmentMenuOpen
              ? isDark
                ? "#1E3A8A"
                : "#DBEAFE"
              : isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.04)",
            transform: [{ rotate: isAttachmentMenuOpen ? "45deg" : "0deg" }],
          },
        ]}
      >
        <Plus
          size={20}
          color={
            isAttachmentMenuOpen
              ? isDark
                ? "#FFFFFF"
                : "#1D4ED8"
              : isDark
                ? "rgba(255,255,255,0.8)"
                : "rgba(0,0,0,0.6)"
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderComposer = (props: any) => (
    <Composer
      {...props}
      textInputStyle={[
        styles.composer,
        {
          color: isDark ? "#FAFAFA" : "#171717",
          backgroundColor: "transparent",
        },
      ]}
      placeholder="Type a message..."
      placeholderTextColor={
        isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"
      }
      multiline
      textInputAutoFocus={false}
    />
  );

  const renderSend = (props: any) => {
    return (
      <View style={styles.sendContainer}>
        <VoiceRecordButton
          isDark={isDark}
          text={props.text}
          onSendText={() => props.onSend({ text: props.text.trim() }, true)}
          onSendVoice={(duration, uri) => {
            const audioMsg: IMessage = {
              _id: Math.round(Math.random() * 1000000).toString(),
              text: "", // Use empty text, audio player will render instead
              audio: uri,
              createdAt: new Date(),
              user: { _id: 1 },
            };
            onSend([audioMsg]);
          }}
        />
      </View>
    );
  };

  const renderMessageImage = (props: any) => {
    // Determine dynamic Family border-radii mechanics for images inside bubbles
    const isSameUserAsAbove =
      props.previousMessage?.user?._id === props.currentMessage.user._id;
    const isSameUserAsBelow =
      props.nextMessage?.user?._id === props.currentMessage.user._id;
    const isSentByMe = props.currentMessage.user._id === 1;

    const hasText = !!props.currentMessage.text;

    // Replicate exactly the bubble wrapper's logic
    const btr = isSentByMe ? (isSameUserAsAbove ? 6 : 20) : 20;
    const bbr = isSentByMe ? (isSameUserAsBelow ? 6 : 4) : 20;
    const btl = isSentByMe ? 20 : isSameUserAsAbove ? 6 : 20;
    const bbl = isSentByMe ? 20 : isSameUserAsBelow ? 6 : 4;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setPreviewMessage(props.currentMessage as IMessage)}
        style={{
          // Render a stunning micro-border by nesting it perfectly inside bubble padding
          padding: hasText ? 4 : 2,
          paddingBottom: hasText ? 8 : 2,
        }}
      >
        <Image
          source={{ uri: props.currentMessage.image }}
          style={{
            width: 240,
            aspectRatio: 0.75, // Perfect premium mobile portrait ratio constraint
            borderTopLeftRadius: Math.max(0, btl - 2),
            borderTopRightRadius: Math.max(0, btr - 2),
            borderBottomLeftRadius: Math.max(0, bbl - 2),
            borderBottomRightRadius: Math.max(0, bbr - 2),
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderBubble = (props: any) => {
    // Chronologically older (visually above this bubble)
    const isSameUserAsAbove =
      props.previousMessage?.user?._id === props.currentMessage.user._id;
    // Chronologically newer (visually below this bubble)
    const isSameUserAsBelow =
      props.nextMessage?.user?._id === props.currentMessage.user._id;

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: isDark ? "#1E3A8A" : "#0F172A",
            borderTopLeftRadius: 20,
            borderTopRightRadius: isSameUserAsAbove ? 6 : 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: isSameUserAsBelow ? 6 : 4,
            paddingVertical: 4,
            ...(props.currentMessage.audio && {
              backgroundColor: "transparent",
              borderWidth: 0,
              elevation: 0,
              paddingVertical: 0,
              paddingBottom: 0,
              paddingTop: 0,
              shadowOpacity: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              marginBottom: -4, // Counteract GiftedChat container push
            }),
            ...(!props.currentMessage.audio && {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 2,
              elevation: 1,
            }),
            ...(props.currentMessage.image &&
              !props.currentMessage.text && {
                paddingVertical: 0, // Eliminate vertical block spacing for clean image borders
              }),
          },
          left: {
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderTopLeftRadius: isSameUserAsAbove ? 6 : 20,
            borderTopRightRadius: 20,
            borderBottomLeftRadius: isSameUserAsBelow ? 6 : 4,
            borderBottomRightRadius: 20,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            ...(props.currentMessage.audio && {
              backgroundColor: "transparent",
              borderWidth: 0,
              elevation: 0,
              paddingVertical: 0,
              paddingBottom: 0,
              paddingTop: 0,
              shadowOpacity: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              marginBottom: -4, // Counteract GiftedChat container push
            }),
            ...(!props.currentMessage.audio && {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.04,
              shadowRadius: 2,
              elevation: 1,
            }),
            ...(props.currentMessage.image &&
              !props.currentMessage.text && {
                paddingVertical: 0, // Eliminate vertical block spacing for clean image borders
              }),
          },
        }}
        containerStyle={{
          left: { marginBottom: 0 },
          right: { marginBottom: 0 },
        }}
        textStyle={{
          right: {
            color: "#FFFFFF",
            fontSize: 16,
            lineHeight: 22,
            letterSpacing: 0.1,
            fontWeight: "400",
            paddingTop: 4,
            paddingHorizontal: 2,
          },
          left: {
            color: isDark ? "rgba(255,255,255,0.95)" : "#0F172A",
            fontSize: 16,
            lineHeight: 22,
            letterSpacing: 0.1,
            fontWeight: "400",
            paddingTop: 4,
            paddingHorizontal: 2,
          },
        }}
        renderTicks={(currentMessage: IMessage) => {
          if (currentMessage.user._id !== 1 || currentMessage.audio)
            return null;
          return (
            <View
              style={{
                marginLeft: 4,
                marginRight: 6,
                marginBottom: 2.5,
                justifyContent: "flex-end",
              }}
            >
              <Ionicons
                name="checkmark-done"
                size={16}
                color={"rgba(255,255,255,0.8)"}
              />
            </View>
          );
        }}
      />
    );
  };

  const renderMessage = (props: any) => {
    // Determine dynamic gap spacing based on chronological flow
    const isSameUserAsBelow =
      props.nextMessage?.user?._id === props.currentMessage.user._id;

    // Overkill precision gap modeling: 2px for grouped messages, 12px natively separated
    const bottomGap = isSameUserAsBelow ? 2 : 12;

    return (
      <Message
        {...props}
        containerStyle={{
          left: { marginBottom: bottomGap },
          right: { marginBottom: bottomGap },
        }}
      />
    );
  };

  const renderTime = (props: any) => {
    if (props.currentMessage.audio) return null;
    return (
      <Time
        {...props}
        timeTextStyle={{
          right: {
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 10.5,
            fontWeight: "500",
            marginBottom: 3,
          },
          left: {
            color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
            fontSize: 10.5,
            fontWeight: "500",
            marginBottom: 3,
          },
        }}
        containerStyle={{
          right: {
            justifyContent: "flex-end",
            paddingRight: 0,
          },
          left: {
            justifyContent: "flex-end",
            paddingRight: 0,
          },
        }}
      />
    );
  };

  const renderDay = (props: any) => (
    <Day
      {...props}
      textStyle={{
        color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
        fontSize: 11,
        letterSpacing: 0.5,
        fontWeight: "600",
        textTransform: "uppercase",
        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
        paddingVertical: 5,
        paddingHorizontal: 16,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 16,
        marginBottom: 16,
      }}
    />
  );

  const renderDocument = (props: any) => {
    const document = props.currentMessage?.document;
    if (!document) return null;

    const isSentByMe = props.currentMessage?.user?._id === 1;

    // High fidelity glassmorphic overlay matching the reference image.
    // If sent by me (Navy Blue bubble context), it uses a crisp translucent white layer.
    // Otherwise adjusts dynamically to Light/Dark opposing bubbles.
    const overlayBg = isSentByMe
      ? "rgba(255, 255, 255, 0.08)"
      : isDark
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.03)";

    const borderColor = isSentByMe
      ? "rgba(255, 255, 255, 0.18)"
      : isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.06)";

    const textColor = isSentByMe ? "#FFFFFF" : isDark ? "#FAFAFA" : "#0F172A";
    const subTextColor = isSentByMe
      ? "rgba(255,255,255,0.7)"
      : isDark
        ? "rgba(255,255,255,0.5)"
        : "rgba(0,0,0,0.5)";

    const mbText = document?.size
      ? (document.size / (1024 * 1024)).toFixed(1)
      : "0.0";
    const hasText = !!props.currentMessage?.text;

    // Bubble Corner Calculation perfectly matching renderMessageImage for physical symmetry
    const isSameUserAsAbove =
      props.previousMessage?.user?._id === props.currentMessage.user._id;
    const isSameUserAsBelow =
      props.nextMessage?.user?._id === props.currentMessage.user._id;
    const btr = isSentByMe ? (isSameUserAsAbove ? 6 : 20) : 20;
    const bbr = isSentByMe ? (isSameUserAsBelow ? 6 : 4) : 20;
    const btl = isSentByMe ? 20 : isSameUserAsAbove ? 6 : 20;
    const bbl = isSentByMe ? 20 : isSameUserAsBelow ? 6 : 4;

    const handleOpenDocument = async () => {
      try {
        let localUri = document?.uri || "";
        if (!localUri) throw new Error("Document URI missing");

        if (localUri.startsWith("http")) {
          const fileExt = localUri.split(".").pop() || "pdf";
          const fileUri =
            (FileSystem as any).cacheDirectory +
            `shared_advotalk_document.${fileExt}`;
          const downloadRes = await FileSystem.downloadAsync(localUri, fileUri);
          localUri = downloadRes.uri;
        }
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localUri, { dialogTitle: "Open Document" });
        } else {
          Alert.alert(
            "Error",
            "Sharing is not natively supported on this device.",
          );
        }
      } catch (e) {
        console.log("AdvoIn Document Share Err:", e);
        Alert.alert("Notice", "Unable to open document.");
      }
    };

    if (document.thumbnailUri) {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenDocument}
          style={{
            padding: hasText ? 4 : 2,
            paddingBottom: hasText ? 8 : 2,
          }}
        >
          <View
            style={{
              width: 240,
              aspectRatio: 0.75, // Standard paper-ratio
              borderTopLeftRadius: Math.max(0, btl - 2),
              borderTopRightRadius: Math.max(0, btr - 2),
              borderBottomLeftRadius: Math.max(0, bbl - 2),
              borderBottomRightRadius: Math.max(0, bbr - 2),
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            {/* Real PDF Crisp Image Thumbnail */}
            <Image
              source={{ uri: document.thumbnailUri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />

            {/* Exquisite bottom glassmorphic bar exactly matching iMessage */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.85)"]}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: 12,
                paddingTop: 32,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View className="w-10 h-10 bg-white/10 rounded-[10px] items-center justify-center mr-3 border border-white/20">
                <FileText color="#FFFFFF" size={20} strokeWidth={2} />
              </View>
              <View className="flex-1 justify-center relative top-[-1px]">
                <ThemedText
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "600",
                    fontSize: 14,
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {document.name}
                </ThemedText>
                <ThemedText
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 12,
                    fontWeight: "400",
                  }}
                >
                  {mbText} MB • PDF
                </ThemedText>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      );
    }

    // Fallback: Glassmorphic Floating Button (If thumbnail generation fails or no thumbnail generated)
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpenDocument}
        className="flex-row rounded-[14px] p-[10px]"
        style={{
          backgroundColor: overlayBg,
          borderColor: borderColor,
          borderWidth: StyleSheet.hairlineWidth,
          width: 260,
          marginHorizontal: 8,
          marginBottom: 8,
          marginTop: hasText ? 6 : 8,
        }}
      >
        <View
          className="items-center justify-center bg-white rounded-xl w-[52px] h-[52px] mr-3.5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          {/* Custom PDF Stack Icon replicating the pure red WhatsApp/iOS styling */}
          <View className="items-center justify-center relative">
            <View className="absolute opacity-20 top-[-2px] left-[-2px]">
              <FileText color="#E11D48" size={26} strokeWidth={2.5} />
            </View>
            <FileText color="#E11D48" size={26} strokeWidth={2} />

            {/* The sharp red solid PDF badge */}
            <View
              className="absolute bg-[#E11D48] px-1 rounded-[4px] py-[1px]"
              style={{
                bottom: -4,
                borderWidth: 1.5,
                borderColor: "#FFFFFF",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 7.5,
                  color: "#FFFFFF",
                  fontWeight: "900",
                  letterSpacing: 0.4,
                }}
              >
                PDF
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="flex-1 justify-center relative top-[-1px]">
          <ThemedText
            style={{
              color: textColor,
              fontWeight: "600",
              fontSize: 15,
              marginBottom: 3,
            }}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {document.name}
          </ThemedText>
          <ThemedText
            style={{
              color: subTextColor,
              fontSize: 13,
              fontWeight: "400",
            }}
          >
            {mbText} MB • PDF Document
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: chatBgColor }, // True root background matching the chat canvas
      ]}
    >
      <Stack.Screen
        options={{
          headerShown: false, // Disabling Native Header for perfect transition control
        }}
      />

      {/* ABSOLUTE CONCAVE BACKDROP: Projects the header color safely behind the curved chat radii */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? insets.top + 136 : 156,
          backgroundColor: headerBgColor,
          zIndex: 0,
        }}
      />

      {/* PERFECTLY GLUED CUSTOM HEADER */}
      <View
        style={{
          paddingTop: insets.top + 12, // Pushed downwards slightly for ergonomics
          paddingBottom: 16, // Extra breathable padding
          backgroundColor: headerBgColor,
          zIndex: 10,
        }}
        className="flex-row items-center justify-between px-2 min-h-[60px]"
      >
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 mr-1 rounded-full active:bg-legal-slate/5"
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center flex-1"
            activeOpacity={0.7}
          >
            <View className="relative mr-3">
              <View className="p-[1.5px] rounded-full bg-legal-blue/10 dark:bg-white/10">
                <Image
                  source={{ uri: advocate?.imageUrl }}
                  className="w-10 h-10 rounded-full border border-legal-surface dark:border-black"
                />
              </View>
              {advocate?.isOnline && (
                <View className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-legal-emerald border-[2.5px] border-[#FFFFFF] dark:border-black" />
              )}
            </View>
            <View className="justify-center flex-1">
              <ThemedText
                variant="h3"
                weight="bold"
                className="text-legal-charcoal dark:text-legal-ice text-base leading-5"
                numberOfLines={1}
              >
                {advocate?.name}
              </ThemedText>
              <ThemedText
                variant="caption"
                className="text-legal-slate dark:text-gray-400 text-[11.5px]"
                numberOfLines={1}
              >
                {advocate?.isOnline ? "Online" : "Last seen recently"}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-2 pr-2">
          <TouchableOpacity className="p-2 rounded-full active:bg-legal-slate/5">
            <Phone size={22} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 rounded-full active:bg-legal-slate/5">
            <Video size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.keyboardView,
          {
            backgroundColor: chatBgColor,
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            overflow: "hidden",
          },
        ]}
      >
        {currentVisibleDate && showStickyDate && (
          <View style={styles.floatingDateContainer}>
            <ThemedText style={styles.floatingDateText}>
              {formatStickyDate(currentVisibleDate)}
            </ThemedText>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: 1 }}
            renderMessage={renderMessage}
            renderBubble={renderBubble}
            renderInputToolbar={renderInputToolbar}
            renderComposer={renderComposer}
            renderSend={renderSend}
            renderActions={renderActions}
            renderDay={renderDay}
            renderTime={renderTime}
            alwaysShowSend
            showUserAvatar
            renderAvatar={(avatarProps: any) => (
              <Image
                source={{ uri: avatarProps.currentMessage.user.avatar }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginRight: 6,
                  marginBottom: 2,
                  alignSelf: "flex-end",
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.1)",
                }}
              />
            )}
            scrollToBottom
            scrollToBottomComponent={() => null}
            renderMessageImage={renderMessageImage}
            renderMessageAudio={(props: any) => {
              if (props.currentMessage?.audio) {
                const date = new Date(props.currentMessage.createdAt as any);
                const hrs = date.getHours();
                const mins = date.getMinutes();
                const ampm = hrs >= 12 ? "PM" : "AM";
                const fHrs = hrs % 12 || 12;
                const fMins = mins < 10 ? `0${mins}` : mins;
                const timeStr = `${fHrs}:${fMins} ${ampm}`;

                const isSameUserPrev =
                  props.previousMessage?.user?._id ===
                  props.currentMessage.user._id;
                const isSameUserNext =
                  props.nextMessage?.user?._id ===
                  props.currentMessage.user._id;

                return (
                  <AudioPlayerBubble
                    uri={props.currentMessage.audio}
                    isDark={isDark}
                    timeStr={timeStr}
                    isSentByMe={props.currentMessage.user._id === 1}
                    isSameUserPrev={isSameUserPrev}
                    isSameUserNext={isSameUserNext}
                  />
                );
              }
              return null;
            }}
            renderMessageText={(props: any) => {
              if (props.currentMessage?.audio) return null;
              if (props.currentMessage?.document) {
                return (
                  <View>
                    {!!props.currentMessage.text && <MessageText {...props} />}
                    {renderDocument(props)}
                  </View>
                );
              }
              return <MessageText {...props} />;
            }}
            renderChatFooter={() => (
              <View
                style={{
                  height: Platform.OS === "android" ? 90 : insets.bottom || 90,
                }}
              />
            )}
            minComposerHeight={44}
            maxComposerHeight={92}
            minInputToolbarHeight={60}
            bottomOffset={0}
            keyboardShouldPersistTaps="handled"
            listViewProps={{
              style: styles.listView,
              contentContainerStyle: styles.listContentContainer,
              showsVerticalScrollIndicator: false,
              keyboardShouldPersistTaps: "handled",
              keyboardDismissMode: "interactive",
              onScroll: handleScroll,
              scrollEventThrottle: 16,
              onViewableItemsChanged: onViewableItemsChanged,
              viewabilityConfig: { itemVisiblePercentThreshold: 10 },
              stickyHeaderIndices: [],
            }}
            textInputProps={{
              returnKeyType: "default",
              blurOnSubmit: false,
              multiline: true,
              style: {
                paddingTop: Platform.OS === "ios" ? 10 : 8,
                paddingBottom: Platform.OS === "ios" ? 10 : 8,
              },
            }}
          />
        </View>
      </View>

      {/* Feature-Rich Premium WhatsApp-Style Native Image Viewer */}
      <Modal
        visible={!!previewMessage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setPreviewMessage(null);
          previewPan.setValue({ x: 0, y: 0 });
        }}
        supportedOrientations={["portrait", "landscape"]}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: previewBgOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.95)"],
            }),
            justifyContent: "center",
          }}
        >
          {/* Top Header Overlay */}
          {previewControlsVisible && (
            <View
              className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-4 pb-4"
              style={{
                paddingTop: Platform.OS === "ios" ? insets.top + 10 : 30,
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => {
                    setPreviewMessage(null);
                    setPreviewControlsVisible(true);
                    previewPan.setValue({ x: 0, y: 0 });
                    previewPinchScale.setValue(1);
                  }}
                  activeOpacity={0.7}
                  className="w-10 h-10 items-center justify-center mr-2 rounded-full"
                >
                  <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
                <View>
                  <ThemedText
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {previewMessage?.user?._id === 1 ? "You" : advocate?.name}
                  </ThemedText>
                  {previewMessage?.createdAt && (
                    <ThemedText
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 13,
                        marginTop: 1,
                      }}
                    >
                      {(() => {
                        const date = new Date(previewMessage.createdAt);
                        return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
                      })()}
                    </ThemedText>
                  )}
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.7} className="p-2">
                <MoreVertical size={24} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}

          {/* Draggable/Swipable Image Content with Horizontal FlatList Paging */}
          <Animated.View
            style={{
              flex: 1,
              transform: [
                { translateX: previewPan.x },
                { translateY: previewPan.y },
                { scale: previewScalePan },
                { scale: previewPinchScale },
              ],
            }}
            {...previewPanResponder.panHandlers}
          >
            <Animated.FlatList
              data={mediaMessages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id.toString()}
              // Automatically jump to the deeply tapped image initially
              initialScrollIndex={Math.max(
                0,
                mediaMessages.findIndex(
                  (m: IMessage) => m._id === previewMessage?._id,
                ),
              )}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                );
                if (mediaMessages[newIndex]) {
                  setPreviewMessage(mediaMessages[newIndex]);
                }
              }}
              renderItem={({ item }) => (
                <TouchableWithoutFeedback
                  onPress={() =>
                    setPreviewControlsVisible(!previewControlsVisible)
                  }
                >
                  <View
                    style={{
                      width: SCREEN_WIDTH,
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      source={{ uri: item.image || "" }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableWithoutFeedback>
              )}
            />
          </Animated.View>

          {/* Bottom Actions Overlay */}
          {previewControlsVisible && (
            <View
              className="absolute bottom-0 left-0 right-0 z-20 flex-col px-4 pt-4"
              style={{
                paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 30,
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              {previewMessage?.text ? (
                <ThemedText
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    marginBottom: 16,
                    lineHeight: 22,
                  }}
                >
                  {previewMessage.text}
                </ThemedText>
              ) : null}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                  onPress={async () => {
                    try {
                      let localUri = previewMessage?.image || "";

                      // Hardware cache download for Remote URIs natively bindings
                      if (localUri.startsWith("http")) {
                        const fileExt = localUri.split(".").pop() || "jpg";
                        const fileUri =
                          (FileSystem as any).cacheDirectory +
                          `shared_advotalk_image.${fileExt}`;
                        const downloadRes = await FileSystem.downloadAsync(
                          localUri,
                          fileUri,
                        );
                        localUri = downloadRes.uri;
                      }

                      if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(localUri, {
                          dialogTitle: "Share Secure Legal Image",
                        });
                      } else {
                        Alert.alert(
                          "Error",
                          "Sharing is not natively supported on this device footprint.",
                        );
                      }
                    } catch (e) {
                      console.log("AdvoIn Share Err:", e);
                      Alert.alert(
                        "Notice",
                        "Unable to pull image payload cache.",
                      );
                    }
                  }}
                >
                  <Share2 size={20} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                  onPress={() => {
                    Alert.alert(
                      "Secure Vault",
                      "The native HD image downloader is being finalized. Stay tuned!",
                    );
                  }}
                >
                  <Download size={20} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingDateContainer: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  floatingDateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  listView: {
    flex: 1,
  },
  listContentContainer: {
    paddingTop: 36, // Inverted list, this is space between messages and input
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  inputToolbar: {
    borderTopWidth: 0,
    borderRadius: 36,
    marginHorizontal: 16,
    paddingHorizontal: 6,
    paddingVertical: 6,
    minHeight: 56,
  },
  inputToolbarPrimary: {
    alignItems: "center",
  },
  actionsContainer: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 0,
    marginRight: 4,
    marginBottom: 0,
    alignSelf: "center", // ensure vertical centering in the input pill
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  }, // Fixed comment
  composer: {
    borderWidth: 0,
    paddingHorizontal: 8,
    marginLeft: 0,
    marginRight: 0,
    fontSize: 16.5,
    lineHeight: 22,
    minHeight: 44,
    paddingTop: Platform.OS === "ios" ? 12 : 10,
    paddingBottom: Platform.OS === "ios" ? 12 : 10,
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 2,
  },
  sendButtonWrapper: {
    height: 40,
    width: 40,
    borderRadius: 20,
    zIndex: 100, // Important so overlay shoots out over to the left
  },
  sendButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ticksContainer: {
    marginLeft: 4,
    marginTop: 4,
    marginRight: 2,
  },
});

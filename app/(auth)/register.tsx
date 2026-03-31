import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, ArrowRight, Lock, Mail, User } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>(); 
  
  const [activeSegment, setActiveSegment] = useState<"client" | "advocate">(
    role === "advocate" ? "advocate" : "client"
  );

  const { login } = useAuthStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Custom pill animation setup
  const [pillWidth, setPillWidth] = useState(0);
  const slideAnim = useSharedValue(activeSegment === "client" ? 0 : 1);

  const handleSegmentSelect = (newRole: "client" | "advocate") => {
    setActiveSegment(newRole);
    // 0 = client, 1 = advocate
    slideAnim.value = withSpring(newRole === "client" ? 0 : 1, {
      damping: 18,
      stiffness: 150,
      mass: 0.8,
    });
  };

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideAnim.value * pillWidth }],
    };
  });

  // Custom Toast State
  const [errorMsg, setErrorMsg] = useState("");
  const errorAnim = useSharedValue(0);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    errorAnim.value = withSpring(1, { damping: 16, stiffness: 120 });
    
    // Auto-dismiss
    setTimeout(() => {
      errorAnim.value = withSpring(0, { damping: 16, stiffness: 120 });
      setTimeout(() => setErrorMsg(""), 300); // Clear after fade out
    }, 3500);
  };

  const errorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: errorAnim.value,
      transform: [
        { translateY: -20 * (1 - errorAnim.value) },
        { scale: 0.95 + 0.05 * errorAnim.value }
      ]
    };
  });

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!name || !email || !password) {
      showError("Please fill out all fields.");
      return;
    }
    
    // Minimal validation
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return; 
    }

    setIsLoading(true);

    // Dummy backend delay
    setTimeout(() => {
      setIsLoading(false);
      login(activeSegment);
      router.replace(
        `/${activeSegment === "client" ? "(client)" : "(advocate)"}` as any
      );
    }, 1500);
  };

  // Dynamic Theme Colors
  const bgColor = isDark ? "#09090B" : "#FFFFFF"; // zinc-950 base
  const textColor = isDark ? "#FAFAFA" : "#09090B";
  const textMuted = isDark ? "#A1A1AA" : "#71717A";
  
  const iconBase = isDark ? "#71717A" : "#A1A1AA";
  const iconFocus = isDark ? "#FAFAFA" : "#09090B";
  const placeholderColor = isDark ? "#71717A" : "#A1A1AA";

  // Box styles (Zinc Hierarchy)
  const switchContainerBg = isDark ? "#18181B" : "#F4F4F5"; // zinc-900 track
  const switchContainerBorder = isDark ? "#27272A" : "#E4E4E7"; // zinc-800 border
  const switchBtnActiveBg = isDark ? "#3F3F46" : "#FFFFFF"; // zinc-700 pill

  const inputBg = isDark ? "#18181B" : "#FAFAFA"; // zinc-900 input
  const inputBgFocus = isDark ? "#27272A" : "#FFFFFF"; // zinc-800 on focus
  
  const inputBorder = isDark ? "#27272A" : "#E4E4E7"; // zinc-800 border
  const inputBorderFocus = isDark ? "#A1A1AA" : "#A1A1AA"; // zinc-400 focus ring

  const btnBg = isDark ? "#FAFAFA" : "#09090B";
  const btnText = isDark ? "#09090B" : "#FAFAFA";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      
      {/* Custom Elegant Floating Error Toast */}
      {errorMsg !== "" && (
        <Animated.View style={[styles.errorToast, { backgroundColor: btnBg }, errorAnimatedStyle]}>
          <AlertCircle size={18} color="#E11D48" strokeWidth={2.5} style={{ marginRight: 10 }} />
          <Text style={[styles.errorText, { color: btnText }]}>
            {errorMsg}
          </Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
            
            {/* Top Bar with Circular Back Button */}
            <Animated.View entering={FadeInDown.delay(50).duration(800).springify()}>
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.8}
                style={[styles.backButton, { backgroundColor: inputBg, borderColor: inputBorder }]}
              >
                <ArrowLeft size={20} color={textColor} strokeWidth={2} />
              </TouchableOpacity>
            </Animated.View>

            {/* Minimal Header */}
            <Animated.View entering={FadeInDown.delay(100).duration(800).springify()}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>
                  {activeSegment === "client" ? "Client" : "Advocate"}
                  <Text style={{ color: textMuted }}>.</Text>
                </Text>
                <Text style={[styles.subtitle, { color: textMuted }]}>
                  {activeSegment === "client" ? "Create your premium account." : "Partner with the best."}
                </Text>
              </View>
            </Animated.View>

            {/* Content Area */}
            <Animated.View entering={FadeInUp.delay(200).duration(800).springify()}>
              
              {/* Ultra-Minimal Animated Role Switch */}
              <View style={[styles.switchContainer, { backgroundColor: switchContainerBg, borderColor: switchContainerBorder }]}>
                <View 
                  style={styles.switchInner}
                  onLayout={(e) => setPillWidth(e.nativeEvent.layout.width / 2)}
                >
                  {/* Fluid Sliding Pill Background */}
                  <Animated.View 
                    style={[
                      styles.slidingPill, 
                      { backgroundColor: switchBtnActiveBg }, 
                      pillAnimatedStyle
                    ]} 
                  />

                  {/* Client Button Wrapper */}
                  <TouchableOpacity
                    onPress={() => handleSegmentSelect("client")}
                    activeOpacity={1}
                    style={styles.switchBtn}
                  >
                    <Text style={[
                        styles.switchText, 
                        { 
                          color: activeSegment === "client" ? textColor : textMuted,
                          fontWeight: activeSegment === "client" ? "600" : "500" 
                        }
                      ]}
                    >
                      Client Sign Up
                    </Text>
                  </TouchableOpacity>

                  {/* Advocate Button Wrapper */}
                  <TouchableOpacity
                    onPress={() => handleSegmentSelect("advocate")}
                    activeOpacity={1}
                    style={styles.switchBtn}
                  >
                    <Text style={[
                        styles.switchText, 
                        { 
                          color: activeSegment === "advocate" ? textColor : textMuted,
                          fontWeight: activeSegment === "advocate" ? "600" : "500" 
                        }
                      ]}
                    >
                      Advocate Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formSpace}>
                
                {/* Name Field */}
                <View>
                  <Text style={[styles.label, { color: textMuted }]}>
                    Full Name
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: nameFocused ? inputBgFocus : inputBg,
                        borderColor: nameFocused ? inputBorderFocus : inputBorder
                      }
                    ]}
                  >
                    <User size={20} color={nameFocused ? iconFocus : iconBase} strokeWidth={nameFocused ? 2 : 1.5} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="Jane Doe"
                      placeholderTextColor={placeholderColor}
                      autoCapitalize="words"
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      selectionColor={textColor}
                    />
                  </View>
                </View>

                {/* Email Field */}
                <View>
                  <Text style={[styles.label, { color: textMuted }]}>
                    Email Address
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: emailFocused ? inputBgFocus : inputBg,
                        borderColor: emailFocused ? inputBorderFocus : inputBorder
                      }
                    ]}
                  >
                    <Mail size={20} color={emailFocused ? iconFocus : iconBase} strokeWidth={emailFocused ? 2 : 1.5} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="jane@example.com"
                      placeholderTextColor={placeholderColor}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      selectionColor={textColor}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: textMuted, marginBottom: 8, marginLeft: 0 }]}>
                    Password
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: passwordFocused ? inputBgFocus : inputBg,
                        borderColor: passwordFocused ? inputBorderFocus : inputBorder
                      }
                    ]}
                  >
                    <Lock size={20} color={passwordFocused ? iconFocus : iconBase} strokeWidth={passwordFocused ? 2 : 1.5} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="At least 6 characters"
                      placeholderTextColor={placeholderColor}
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      selectionColor={textColor}
                    />
                  </View>
                </View>

                {/* Action Block */}
                <View style={styles.actionGroup}>
                  {/* Minimalist Primary Button */}
                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    style={[
                      styles.mainButton,
                      { backgroundColor: btnBg, opacity: isLoading ? 0.7 : 1 }
                    ]}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={btnText} size="small" />
                    ) : (
                      <>
                        <Text style={[styles.mainButtonText, { color: btnText }]}>
                          Create Account
                        </Text>
                        <ArrowRight size={20} color={btnText} strokeWidth={2.5} />
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Elegant Divider */}
                  <View style={styles.dividerRow}>
                    <View style={[styles.dividerLine, { backgroundColor: inputBorder }]} />
                    <Text style={[styles.dividerText, { color: textMuted }]}>or</Text>
                    <View style={[styles.dividerLine, { backgroundColor: inputBorder }]} />
                  </View>

                  {/* Google SSO Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.googleButton, { backgroundColor: bgColor, borderColor: inputBorder }]}
                  >
                    <View style={[styles.gIconBox, { backgroundColor: textColor }]}>
                      <Text style={[styles.gIconText, { color: bgColor }]}>G</Text>
                    </View>
                    <Text style={[styles.googleButtonText, { color: textColor }]}>
                      Continue with Google
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* Login Return Link */}
            <Animated.View entering={FadeInUp.delay(300).duration(800).springify()}>
              <View style={styles.registerRow}>
                <Text style={[styles.registerTextMuted, { color: textMuted }]}>
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity activeOpacity={0.6} onPress={() => router.back()}>
                  <Text style={[styles.registerTextBold, { color: textColor, borderBottomColor: textColor }]}>
                    Sign in
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  errorToast: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 999,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 52,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0,
    opacity: 0.8,
  },
  switchContainer: {
    marginBottom: 32,
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  switchInner: {
    flexDirection: "row",
    position: "relative",
    height: 48,
  },
  slidingPill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "50%",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  switchText: {
    fontSize: 14,
  },
  formSpace: {
    gap: 16,
  },
  formGroup: {
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 0,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 64,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  actionGroup: {
    marginTop: 16,
    gap: 16,
  },
  mainButton: {
    height: 64,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginRight: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
  },
  googleButton: {
    height: 64,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  gIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  gIconText: {
    fontSize: 14,
    fontWeight: "900",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  registerTextMuted: {
    fontSize: 14,
    fontWeight: "500",
  },
  registerTextBold: {
    fontSize: 14,
    fontWeight: "bold",
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
});

import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    CreditCard,
    LogOut,
    Settings,
    Shield,
    Star,
    User,
} from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../../src/store/authStore";

export default function ProfileScreen() {
  const { isDark } = useLegalTheme();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#F8FAFC" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User Card ── */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 32,
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: 112,
              height: 112,
              borderRadius: 40,
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              borderWidth: 3,
              borderColor: isDark ? "#1A1A1A" : "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0 : 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 36,
                backgroundColor: isDark ? "#262626" : "#F1F5F9",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <User
                size={48}
                color={isDark ? "#525252" : "#94A3B8"}
                strokeWidth={1.5}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                position: "absolute",
                bottom: -8,
                right: -8,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? "#FFFFFF" : "#0F172A",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 4,
                borderColor: isDark ? "#000" : "#F8FAFC",
              }}
            >
              <Settings size={18} color={isDark ? "#0F172A" : "#FFFFFF"} />
            </TouchableOpacity>
          </View>

          <ThemedText
            variant="h1"
            weight="bold"
            style={{
              color: isDark ? "#FFF" : "#0F172A",
              marginBottom: 4,
              letterSpacing: -0.5,
            }}
          >
            John Doe
          </ThemedText>

          <ThemedText
            style={{
              color: isDark ? "#A3A3A3" : "#64748B",
              fontWeight: "500",
              marginBottom: 12,
              fontSize: 15,
            }}
          >
            john.doe@example.com
          </ThemedText>
        </View>

        {/* ── CLIENT SECTION ── */}
        <View style={{ display: "flex" }}>
          {/* Stats Row */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 24,
              gap: 8,
              marginBottom: 32,
            }}
          >
            {[
              { value: "3", label: "Active Cases" },
              { value: "12", label: "Consults" },
              { value: "5", label: "Saved" },
            ].map((item) => (
              <View
                key={item.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
                  borderRadius: 24,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                <ThemedText
                  variant="h2"
                  weight="bold"
                  style={{ color: isDark ? "#FFF" : "#0F172A" }}
                >
                  {item.value}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 11,
                    color: isDark ? "#737373" : "#9CA3AF",
                    marginTop: 6,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Premium Banner */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              marginHorizontal: 24,
              backgroundColor: isDark ? "#FFFFFF" : "#0F172A",
              borderRadius: 24,
              padding: 24,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 32,
              shadowColor: isDark ? "#FFF" : "#0F172A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.05 : 0.15,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.08)"
                  : "rgba(255,255,255,0.2)",
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Star
                size={26}
                color={isDark ? "#0F172A" : "#FFFFFF"}
                fill={isDark ? "#0F172A" : "#FFFFFF"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                weight="bold"
                style={{
                  color: isDark ? "#0F172A" : "#FFFFFF",
                  fontSize: 18,
                  marginBottom: 4,
                }}
              >
                Premium Member
              </ThemedText>
              <ThemedText
                style={{
                  color: isDark ? "#737373" : "rgba(255,255,255,0.7)",
                  fontSize: 12,
                  lineHeight: 18,
                }}
              >
                Priority consultations and 10% off on all bookings.
              </ThemedText>
            </View>
          </TouchableOpacity>

          {/* Client Menu */}
          <View
            style={{
              marginHorizontal: 24,
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderRadius: 24,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)",
              marginBottom: 24,
            }}
          >
            {[
              { icon: User, label: "Personal Information" },
              { icon: Bell, label: "Notifications" },
              { icon: Shield, label: "Security & Privacy" },
              { icon: CreditCard, label: "Payments" },
              { icon: Settings, label: "App Settings" },
            ].map((item, index, arr) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  paddingVertical: 20,
                  borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                  borderBottomColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "#F5F5F5",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    backgroundColor: isDark ? "#262626" : "#F8FAFC",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <item.icon
                    size={22}
                    color={isDark ? "#FAFAFA" : "#0F172A"}
                    strokeWidth={1.5}
                  />
                </View>
                <ThemedText
                  weight="medium"
                  style={{
                    flex: 1,
                    color: isDark ? "#E5E5E5" : "#1F2937",
                    fontSize: 16,
                  }}
                >
                  {item.label}
                </ThemedText>
                <ChevronRight
                  size={20}
                  color={isDark ? "#525252" : "#9CA3AF"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Universal Footer ── */}
        <View style={{ paddingHorizontal: 24, marginTop: 8, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 18,
              borderRadius: 24,
              backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#FEF2F2",
              borderWidth: 1,
              borderColor: isDark ? "rgba(239,68,68,0.2)" : "#FECACA",
            }}
          >
            <LogOut size={20} color="#EF4444" style={{ marginRight: 10 }} />
            <ThemedText
              weight="bold"
              style={{ color: "#EF4444", fontSize: 16 }}
            >
              Secure Sign Out
            </ThemedText>
          </TouchableOpacity>

          <ThemedText
            style={{
              textAlign: "center",
              color: isDark ? "#525252" : "#D4D4D4",
              fontSize: 11,
              marginTop: 32,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            AdvoIn v1.0.0
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

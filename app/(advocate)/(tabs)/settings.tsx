import { ThemedText } from "@/components/ui/ThemedText";
import { useLegalTheme } from "@/hooks/useLegalTheme";
import { useRouter } from "expo-router";
import {
  Briefcase,
  ChevronRight,
  LogOut,
  Moon,
  PieChart,
  Settings,
  Shield,
  User,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../../src/store/authStore";

// Custom toggle built from pure RN primitives
function CustomToggle({
  value,
  onValueChange,
  isDark,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={{
        width: 52,
        height: 32,
        borderRadius: 16,
        backgroundColor: value ? "#10B981" : isDark ? "#333" : "#E5E5E5",
        justifyContent: "center",
        paddingHorizontal: 3,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: "#FFFFFF",
          alignSelf: value ? "flex-end" : "flex-start",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </Pressable>
  );
}

export default function AdvocateSettingsScreen() {
  const { isDark } = useLegalTheme();
  const [isAvailable, setIsAvailable] = useState(true);
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleToggleAvailability = useCallback(
    (v: boolean) => setIsAvailable(v),
    [],
  );

  const handleLogout = () => {
    logout();
    router.replace("/(auth)" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#F8FAFC" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 100 }}
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
            Adv. Tushar Jaguri
          </ThemedText>

          <ThemedText
            style={{
              color: isDark ? "#A3A3A3" : "#64748B",
              fontWeight: "500",
              marginBottom: 12,
              fontSize: 15,
            }}
          >
            Senior Corporate Lawyer
          </ThemedText>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "rgba(59,130,246,0.1)" : "#EFF6FF",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              marginTop: 4,
              borderWidth: 1,
              borderColor: isDark ? "rgba(59,130,246,0.2)" : "#BFDBFE",
            }}
          >
            <Shield
              size={16}
              color="#3B82F6"
              strokeWidth={2.5}
              style={{ marginRight: 8 }}
            />
            <ThemedText
              style={{
                color: isDark ? "#60A5FA" : "#2563EB",
                fontSize: 11,
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Verified Authority
            </ThemedText>
          </View>
        </View>

        {/* ── ADVOCATE SECTION ── */}
        <View style={{ display: "flex" }}>
          {/* Availability Toggle */}
          <View
            style={{
              marginHorizontal: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderRadius: 24,
              padding: 20,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  marginRight: 16,
                  backgroundColor: isAvailable ? "#10B981" : "#A3A3A3",
                }}
              />
              <View>
                <ThemedText
                  weight="bold"
                  style={{
                    color: isDark ? "#FFF" : "#0F172A",
                    fontSize: 16,
                  }}
                >
                  {isAvailable ? "Available for Consults" : "Currently Offline"}
                </ThemedText>
                <ThemedText
                  style={{
                    color: isDark ? "#737373" : "#9CA3AF",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {isAvailable
                    ? "Clients can reach you directly"
                    : "You won't receive incoming requests"}
                </ThemedText>
              </View>
            </View>
            <CustomToggle
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              isDark={isDark}
            />
          </View>

          {/* Advocate Menu */}
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
              { icon: Briefcase, label: "Professional Profile" },
              { icon: Moon, label: "Availability Settings" },
              { icon: PieChart, label: "Earnings & Analytics" },
              { icon: Wallet, label: "Payout Methods" },
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

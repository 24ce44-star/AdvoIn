import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const STATS = [
  {
    id: "1",
    label: "Active Cases",
    value: "12",
    icon: "briefcase",
    color: "#3B82F6",
  },
  {
    id: "2",
    label: "Pending Requests",
    value: "5",
    icon: "time",
    color: "#F59E0B",
  },
  {
    id: "3",
    label: "Total Earnings",
    value: "₹45k",
    icon: "wallet",
    color: "#10B981",
  },
  { id: "4", label: "Rating", value: "4.8", icon: "star", color: "#8B5CF6" },
];

const UPCOMING_MEETINGS = [
  {
    id: "1",
    client: "Rahul Sharma",
    time: "10:00 AM",
    type: "Video Call",
    case: "Property Dispute",
  },
  {
    id: "2",
    client: "Priya Patel",
    time: "02:30 PM",
    type: "In-person",
    case: "Corporate Consultation",
  },
];

export function AdvocateDashboard() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, isDark && styles.textDark]}>
              Good Morning,
            </Text>
            <Text style={[styles.name, isDark && styles.textDark]}>
              Adv. Tushar Jaguri
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, isDark && styles.profileButtonDark]}
          >
            <View style={styles.notificationDot} />
            <Ionicons
              name="notifications-outline"
              size={24}
              color={isDark ? "#F9FAFB" : "#111827"}
            />
          </TouchableOpacity>
        </View>

        {/* Action Quick Links */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: isDark ? "#1E3A8A" : "#E0E7FF" },
            ]}
          >
            <Ionicons
              name="add-circle"
              size={20}
              color={isDark ? "#93C5FD" : "#2563EB"}
            />
            <Text
              style={[
                styles.actionText,
                { color: isDark ? "#93C5FD" : "#2563EB" },
              ]}
            >
              New Case
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: isDark ? "#064E3B" : "#D1FAE5" },
            ]}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={isDark ? "#6EE7B7" : "#059669"}
            />
            <Text
              style={[
                styles.actionText,
                { color: isDark ? "#6EE7B7" : "#059669" },
              ]}
            >
              Schedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: isDark ? "#4C1D95" : "#EDE9FE" },
            ]}
          >
            <Ionicons
              name="document-text"
              size={20}
              color={isDark ? "#C4B5FD" : "#7C3AED"}
            />
            <Text
              style={[
                styles.actionText,
                { color: isDark ? "#C4B5FD" : "#7C3AED" },
              ]}
            >
              Drafts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View
              key={stat.id}
              style={[styles.statCard, isDark && styles.cardDark]}
            >
              <View
                style={[styles.iconBox, { backgroundColor: `${stat.color}15` }]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={24}
                  color={stat.color}
                />
              </View>
              <Text style={[styles.statValue, isDark && styles.textDark]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textMutedDark]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Incoming Client Pipeline */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Client Pipeline
          </Text>
        </View>
        <View style={styles.pipelineContainer}>
          {/* Direct Requests */}
          <View style={[styles.pipelineCard, isDark && styles.cardDark]}>
            <View style={styles.pipelineHeader}>
              <View
                style={[
                  styles.pipelineIcon,
                  { backgroundColor: isDark ? "#1E3A8A" : "#EFF6FF" },
                ]}
              >
                <Ionicons name="flash" size={18} color="#3B82F6" />
              </View>
              <View style={styles.pipelineBadge}>
                <Text style={styles.pipelineBadgeText}>3 New</Text>
              </View>
            </View>
            <Text style={[styles.pipelineTitle, isDark && styles.textDark]}>
              Direct Requests
            </Text>
            <Text style={[styles.pipelineSub, isDark && styles.textMutedDark]}>
              Clients who selected you specifically
            </Text>
          </View>

          {/* Daily Pool */}
          <View style={[styles.pipelineCard, isDark && styles.cardDark]}>
            <View style={styles.pipelineHeader}>
              <View
                style={[
                  styles.pipelineIcon,
                  { backgroundColor: isDark ? "#4C1D95" : "#F5F3FF" },
                ]}
              >
                <Ionicons name="people" size={18} color="#8B5CF6" />
              </View>
              <Text style={[styles.poolCount, isDark && styles.textDark]}>
                5 <Text style={{ color: "#6B7280", fontSize: 13 }}>/ 8</Text>
              </Text>
            </View>
            <Text style={[styles.pipelineTitle, isDark && styles.textDark]}>
              Daily Pool
            </Text>
            <Text style={[styles.pipelineSub, isDark && styles.textMutedDark]}>
              Available auto-matched slots today
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "62.5%" }]} />
            </View>
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Today's Schedule
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scheduleList}>
          {UPCOMING_MEETINGS.map((meeting) => (
            <TouchableOpacity
              key={meeting.id}
              style={[styles.meetingCard, isDark && styles.cardDark]}
            >
              <View style={styles.timeColumn}>
                <Text style={[styles.timeText, isDark && styles.textDark]}>
                  {meeting.time}
                </Text>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        meeting.type === "Video Call"
                          ? isDark
                            ? "#3730A3"
                            : "#EEF2FF"
                          : isDark
                            ? "#065F46"
                            : "#ECFDF5",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          meeting.type === "Video Call"
                            ? isDark
                              ? "#A5B4FC"
                              : "#4F46E5"
                            : isDark
                              ? "#6EE7B7"
                              : "#059669",
                      },
                    ]}
                  >
                    {meeting.type}
                  </Text>
                </View>
              </View>

              <View style={styles.meetingDetails}>
                <Text style={[styles.clientName, isDark && styles.textDark]}>
                  {meeting.client}
                </Text>
                <Text style={[styles.caseType, isDark && styles.textMutedDark]}>
                  {meeting.case}
                </Text>
              </View>

              <TouchableOpacity style={styles.joinBtn}>
                <Ionicons name="videocam" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Recent Activity
          </Text>
        </View>
        <View style={[styles.activityCard, isDark && styles.cardDark]}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: "#F0FDF4" }]}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, isDark && styles.textDark]}>
                Payment Received
              </Text>
              <Text
                style={[styles.activityTime, isDark && styles.textMutedDark]}
              >
                ₹5,000 from Rohan K.
              </Text>
            </View>
            <Text style={styles.activityStamp}>2h ago</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#0A0A0A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  profileButtonDark: {
    backgroundColor: "#171717",
    borderColor: "#262626",
  },
  notificationDot: {
    position: "absolute",
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionText: {
    fontWeight: "600",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 40 - 16) / 2, // Half width minus padding and gap
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardDark: {
    backgroundColor: "#171717",
    borderColor: "#262626",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  pipelineContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  pipelineCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  pipelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pipelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pipelineBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  pipelineBadgeText: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "700",
  },
  poolCount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  pipelineTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  pipelineSub: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  scheduleList: {
    gap: 12,
    marginBottom: 32,
  },
  meetingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  timeColumn: {
    alignItems: "center",
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: "#F3F4F6",
    width: 85,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  meetingDetails: {
    flex: 1,
    paddingLeft: 16,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  caseType: {
    fontSize: 13,
    color: "#6B7280",
  },
  joinBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: "#6B7280",
  },
  activityStamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  textDark: {
    color: "#FFFFFF",
  },
  textMutedDark: {
    color: "#9CA3AF",
  },
});

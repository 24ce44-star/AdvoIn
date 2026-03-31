export const CASE_CATEGORIES = [
  {
    id: "property",
    label: "Property Dispute",
    value: "property-dispute",
    description: "Land, real estate, boundary disputes",
    icon: "🏠",
  },
  {
    id: "employment",
    label: "Employment Issue",
    value: "employment-issue",
    description: "Workplace disputes, termination, harassment",
    icon: "💼",
  },
  {
    id: "family",
    label: "Family Matter",
    value: "family-matter",
    description: "Divorce, custody, maintenance",
    icon: "👨‍👩‍👧‍👦",
  },
  {
    id: "contract",
    label: "Contract Dispute",
    value: "contract-dispute",
    description: "Breach of contract, agreements",
    icon: "📄",
  },
  {
    id: "injury",
    label: "Personal Injury",
    value: "personal-injury",
    description: "Accidents, medical negligence",
    icon: "🏥",
  },
  {
    id: "criminal",
    label: "Criminal Matter",
    value: "criminal-matter",
    description: "Criminal charges, defense",
    icon: "⚖️",
  },
  {
    id: "consumer",
    label: "Consumer Rights",
    value: "consumer-rights",
    description: "Product defects, service issues",
    icon: "🛒",
  },
  {
    id: "intellectual",
    label: "Intellectual Property",
    value: "intellectual-property",
    description: "Copyright, trademark, patents",
    icon: "💡",
  },
  {
    id: "business",
    label: "Business Dispute",
    value: "business-dispute",
    description: "Partnership, corporate matters",
    icon: "🏢",
  },
  {
    id: "other",
    label: "Other",
    value: "other",
    description: "Other legal matters",
    icon: "📋",
  },
];

export const URGENCY_LEVELS = [
  {
    id: "low",
    label: "Low",
    value: "low",
    description: "No immediate deadline",
    color: "#10B981",
  },
  {
    id: "medium",
    label: "Medium",
    value: "medium",
    description: "Within a few weeks",
    color: "#F59E0B",
  },
  {
    id: "high",
    label: "High",
    value: "high",
    description: "Within a week",
    color: "#EF4444",
  },
  {
    id: "critical",
    label: "Critical",
    value: "critical",
    description: "Immediate attention needed",
    color: "#DC2626",
  },
];

export const EVIDENCE_TYPES = [
  { id: "document", label: "Documents", icon: "📄" },
  { id: "photo", label: "Photos", icon: "📷" },
  { id: "video", label: "Videos", icon: "🎥" },
  { id: "audio", label: "Audio Recordings", icon: "🎤" },
  { id: "witness", label: "Witness Statements", icon: "👤" },
  { id: "other", label: "Other", icon: "📎" },
];

export const DESIRED_OUTCOMES = [
  "Monetary Compensation",
  "Contract Enforcement",
  "Injunction/Restraining Order",
  "Property Recovery",
  "Custody Rights",
  "Divorce Settlement",
  "Criminal Defense",
  "Acquittal",
  "Reduced Sentence",
  "Settlement Agreement",
  "Apology/Retraction",
  "Policy Change",
  "Other",
];

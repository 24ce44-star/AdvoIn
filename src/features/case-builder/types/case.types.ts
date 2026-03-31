export interface CaseData {
  id: string;
  title: string;
  category: string;
  description: string;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  timeline: TimelineEvent[];
  evidence: Evidence[];
  witnesses: Witness[];
  legalIssues: string[];
  desiredOutcome: string;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedValue?: string;
  jurisdiction?: string;
  status: "draft" | "in-progress" | "completed";
  completeness: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  userId?: string;
  conversationId: string;
  aiSummary?: string;
  messages?: ConversationMessage[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  description: string;
  importance: "low" | "medium" | "high";
}

export interface Evidence {
  id: string;
  type: "document" | "photo" | "video" | "audio" | "other";
  name: string;
  description: string;
  uri?: string;
}

export interface Witness {
  id: string;
  name: string;
  relation: string;
  contact?: string;
  testimony: string;
}

export interface ConversationMessage {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  options?: QuestionOption[];
  field?: keyof CaseData | string;
  isEditable?: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export type BuilderStage =
  | "welcome"
  | "category"
  | "basic-info"
  | "parties"
  | "incident"
  | "timeline"
  | "evidence"
  | "witnesses"
  | "legal-issues"
  | "outcome"
  | "review"
  | "finalize";

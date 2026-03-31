import { CaseData } from "../types/case.types";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number; // 0-100
}

export function validateCase(caseData: Partial<CaseData>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let completedFields = 0;
  const totalFields = 10;

  // Required fields
  if (!caseData.category) {
    errors.push("Case category is required");
  } else {
    completedFields++;
  }

  if (!caseData.description || caseData.description.length < 20) {
    errors.push("Case description must be at least 20 characters");
  } else {
    completedFields++;
  }

  if (!caseData.parties?.plaintiff) {
    errors.push("Plaintiff information is required");
  } else {
    completedFields++;
  }

  if (!caseData.parties?.defendant) {
    errors.push("Defendant information is required");
  } else {
    completedFields++;
  }

  // Optional but recommended fields
  if (!caseData.timeline || caseData.timeline.length === 0) {
    warnings.push("Adding timeline events will strengthen your case");
  } else {
    completedFields++;
  }

  if (!caseData.evidence || caseData.evidence.length === 0) {
    warnings.push("Consider adding evidence to support your case");
  } else {
    completedFields++;
  }

  if (!caseData.witnesses || caseData.witnesses.length === 0) {
    warnings.push("Witness information can be valuable");
  } else {
    completedFields++;
  }

  if (!caseData.legalIssues || caseData.legalIssues.length === 0) {
    warnings.push(
      "Identifying legal issues helps advocates understand your case",
    );
  } else {
    completedFields++;
  }

  if (!caseData.desiredOutcome) {
    warnings.push("Specify your desired outcome for better case strategy");
  } else {
    completedFields++;
  }

  if (!caseData.urgency) {
    warnings.push("Set case urgency to help prioritize");
  } else {
    completedFields++;
  }

  const completeness = Math.round((completedFields / totalFields) * 100);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness,
  };
}

export function getCaseStrength(caseData: Partial<CaseData>): {
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];

  if (caseData.evidence && caseData.evidence.length > 0) {
    score += 25;
    factors.push(`${caseData.evidence.length} pieces of evidence`);
  }

  if (caseData.witnesses && caseData.witnesses.length > 0) {
    score += 20;
    factors.push(`${caseData.witnesses.length} witnesses`);
  }

  if (caseData.timeline && caseData.timeline.length >= 3) {
    score += 20;
    factors.push("Detailed timeline");
  }

  if (caseData.description && caseData.description.length > 100) {
    score += 15;
    factors.push("Comprehensive description");
  }

  if (caseData.legalIssues && caseData.legalIssues.length > 0) {
    score += 20;
    factors.push("Legal issues identified");
  }

  return { score, factors };
}

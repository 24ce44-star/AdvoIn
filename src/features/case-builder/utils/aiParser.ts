import { CaseData } from "../types/case.types";

export interface ParsedAIResponse {
  cleanMessage: string;
  extractedData?: Partial<CaseData>;
  options?: string[];
}

export function parseAIResponse(rawResponse: string): ParsedAIResponse {
  let cleanMessage = rawResponse;
  let extractedData: Partial<CaseData> | undefined;
  let options: string[] | undefined;

  // 1. Parse [EXTRACTED: {...}] — strip from display regardless of parse success
  try {
    const extractedMatch = cleanMessage.match(
      /\[EXTRACTED:\s*(?:```(?:json)?\s*)?(\{[\s\S]*?\})(?:\s*```)?\s*\]/,
    );
    if (extractedMatch) {
      try {
        extractedData = JSON.parse(extractedMatch[1]);
      } catch (e) {
        console.warn("Failed to parse EXTRACTED data:", e);
      }
      // Always strip the block even if JSON parse failed
      cleanMessage = cleanMessage.replace(extractedMatch[0], "");
    }
  } catch (e) {
    console.warn("Failed to match EXTRACTED block:", e);
  }

  // 2. Parse [OPTIONS: [...]] — strip from display regardless of parse success
  //    Only expose options if the array is non-empty with valid strings.
  try {
    const optionsMatch = cleanMessage.match(
      /\[OPTIONS:\s*(?:```(?:json)?\s*)?(\[[\s\S]*?\])(?:\s*```)?\s*\]/,
    );
    if (optionsMatch) {
      try {
        const parsed: string[] = JSON.parse(optionsMatch[1]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(
            (o) => typeof o === "string" && o.trim() !== "",
          );
          if (filtered.length > 0) options = filtered;
        }
      } catch (e) {
        console.warn("Failed to parse OPTIONS data:", e);
      }
      // Always strip the block even if JSON parse failed
      cleanMessage = cleanMessage.replace(optionsMatch[0], "");
    }
  } catch (e) {
    console.warn("Failed to match OPTIONS block:", e);
  }

  // 3. Safety net — strip any malformed/leftover trigger blocks that slipped through
  cleanMessage = cleanMessage
    .replace(/\[OPTIONS:[^\]]*\]/g, "")
    .replace(/\[EXTRACTED:[^\]]*\]/g, "")
    .replace(/\[DRAFT_DOCUMENT:[^\]]*\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { cleanMessage, extractedData, options };
}

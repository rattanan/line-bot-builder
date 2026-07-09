import type { KnowledgeCandidate } from "./bot-knowledge-wizard";

export function normalizeQuestion(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function mergeCandidatesByNormalizedQuestion(candidates: KnowledgeCandidate[]): KnowledgeCandidate[] {
  const merged = new Map<string, KnowledgeCandidate>();
  for (const candidate of candidates) {
    const key = normalizeQuestion(candidate.question);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, candidate);
      continue;
    }
    if ((Number(candidate.confidence_score) || 0) >= (Number(existing.confidence_score) || 0)) {
      merged.set(key, candidate);
    }
  }
  return Array.from(merged.values()).sort((a, b) => Number(b.confidence_score) - Number(a.confidence_score));
}

export function scoreCandidateConfidence(sourceType: KnowledgeCandidate["source_type"], base = 0.6) {
  if (sourceType === "website") return Math.min(0.95, base + 0.15);
  if (sourceType === "image") return Math.min(0.9, base + 0.1);
  return Math.min(0.85, base);
}

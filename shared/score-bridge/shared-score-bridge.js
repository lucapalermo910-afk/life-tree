// ── SHARED SCORE BRIDGE ───────────────────────────────────────────────────────
// Cada módulo publica seu score aqui.
// A Árvore central lê daqui para colorir as sefirot.

const SCORE_KEY = "lifetree_scores";

// Lê todos os scores salvos
export function readAllScores() {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Módulo publica seu score (0-100)
export function publishScore(moduleId, score) {
  try {
    const scores = readAllScores();
    scores[moduleId] = {
      score: Math.min(100, Math.max(0, score)),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
  } catch (e) {
    console.error("publishScore error:", e);
  }
}

// Hook React para usar em qualquer módulo
// Uso: const { score, publish } = useModuleScore("yesod");
import { useEffect, useCallback } from "react";

export function useModuleScore(moduleId, computeScore) {
  const publish = useCallback((score) => {
    publishScore(moduleId, score);
  }, [moduleId]);

  useEffect(() => {
    if (computeScore !== undefined) {
      publish(computeScore);
    }
  }, [computeScore, publish]);

  return { publish };
}

export default { readAllScores, publishScore, useModuleScore };

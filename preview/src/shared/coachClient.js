import { Capacitor } from "@capacitor/core";

// Único ponto de chamada ao Coach a partir do client — App.jsx e os módulos
// chamam isso em vez de fazer fetch direto pra api.anthropic.com (o que expõe
// a key no bundle e faltava headers de auth). O endpoint /api/coach guarda a
// key no servidor (Vercel serverless em produção, middleware do vite em dev).
//
// PROD_API_BASE: preenchido depois do primeiro `vercel --prod` (ver 07 Como
// Rodar / instruções de build do app Android). Fora do app nativo (navegador,
// dev, ou o próprio site em produção) o fetch continua relativo — só o app
// empacotado via Capacitor roda de uma origem diferente (capacitor://localhost)
// e precisa da URL absoluta.
const PROD_API_BASE = "https://preview-gamma-fawn.vercel.app";
const API_BASE = Capacitor.isNativePlatform() ? PROD_API_BASE : "";

export async function callCoachAPI({ system, messages, maxTokens, model }) {
  const res = await fetch(`${API_BASE}/api/coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, maxTokens, model }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || "Erro na chamada ao coach");
  }
  return data;
}

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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.error || "Erro na chamada ao coach");
    err.status = res.status;
    err.tipo = data?.error?.type || null;
    throw err;
  }
  return data;
}

// Motivo curto em português pro usuário (05/11/2026). O Raio-X de 29/08 decidiu não mostrar o
// texto cru da Anthropic (inglês, técnico) — mas sem motivo nenhum, "indisponível" não dá pra
// diagnosticar pelo celular. Aqui vira uma frase curta + o código HTTP.
export function motivoErroCoach(e) {
  const msg = String(e?.message || "").toLowerCase();
  const st = e?.status;
  let motivo = "erro desconhecido";
  if (e?.vazia) motivo = "o Coach devolveu uma resposta vazia, tente de novo";
  else if (st === undefined || e instanceof TypeError) motivo = "sem conexão com o servidor";
  else if (st === 504 || msg.includes("timeout")) motivo = "o servidor demorou demais para responder, tente de novo";
  else if (msg.includes("credit balance") || msg.includes("billing")) motivo = "a conta da API está sem saldo";
  else if (st === 401 || msg.includes("x-api-key") || msg.includes("authentication")) motivo = "a chave da API é inválida ou foi revogada";
  else if (msg.includes("anthropic_api_key")) motivo = "a chave da API não está configurada no servidor";
  else if (st === 404 || msg.includes("model")) motivo = "o modelo de IA não está disponível";
  else if (st === 429) motivo = "muitas mensagens seguidas, espere alguns minutos";
  else if (st === 413) motivo = "a mensagem ficou grande demais";
  else if (st === 529 || msg.includes("overloaded")) motivo = "a Anthropic está sobrecarregada";
  return motivo + (st ? " (código " + st + ")" : "");
}

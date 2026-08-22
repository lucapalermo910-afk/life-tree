// Vercel serverless function — proxy único pra API da Anthropic.
// A ANTHROPIC_API_KEY nunca vai pro client: fica só em env var do servidor.
import { callAnthropic } from "./_lib/callAnthropic.js";
import { checkRateLimit, getClientIp, clampMaxTokens, MAX_BODY_BYTES } from "./_lib/rateLimit.js";

// CORS liberado (não restrito a uma origem) — necessário porque o app empacotado
// via Capacitor chama este endpoint a partir de uma origem diferente da Vercel
// (capacitor://localhost no Android, https://localhost em alguns setups), não dá
// pra prever essa origem antecipadamente do jeito que o `androidScheme` é
// configurado. Já é um endpoint sem autenticação de chamador por decisão aceita
// (rate limit + clamp de payload/tokens como mitigação, ver LifeTree/Life Tree
// vault → 04 Bugs Conhecidos) — CORS aberto não piora esse risco, só destrava o
// app nativo de chamar o mesmo proxy que o navegador já chama livremente.
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // stripBom: alguns caminhos de configuração de env var (incluindo, aparentemente,
  // a forma como a Vercel injeta env vars nesse runtime) podem deixar um BOM (U+FEFF,
  // code point 65279) no início do valor — inofensivo em JSON, mas quebra quando o
  // valor vira um header HTTP literal (ByteString não aceita código > 255). Checado
  // por charCodeAt (não regex) pra não depender de um caractere invisível no source.
  const stripBom = s => (s && s.charCodeAt(0) === 65279) ? s.slice(1) : s;
  const apiKey = stripBom(process.env.ANTHROPIC_API_KEY)?.trim();
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY não configurada no servidor" });
    return;
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(rl.retryAfterSec));
    res.status(429).json({ error: "Muitas requisições — tente novamente em instantes." });
    return;
  }

  const bodyBytes = Number(req.headers["content-length"] || 0);
  if (bodyBytes > MAX_BODY_BYTES) {
    res.status(413).json({ error: "Payload grande demais" });
    return;
  }

  const { system, messages, maxTokens, model } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages é obrigatório" });
    return;
  }

  try {
    const { status, data } = await callAnthropic({ apiKey, system, messages, maxTokens: clampMaxTokens(maxTokens), model });
    res.status(status).json(data);
  } catch (e) {
    res.status(502).json({ error: "Falha ao chamar a Anthropic: " + e.message });
  }
}

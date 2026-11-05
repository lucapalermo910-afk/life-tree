// Único lugar que chama a API da Anthropic com os headers corretos.
// Usado por api/coach.js (produção, Vercel) e pelo middleware de dev do vite.config.js.
// Modelo padrão (05/11/2026): claude-sonnet-4-20250514 foi aposentado pela Anthropic em
// 15/06/2026 e passou a falhar em toda chamada ("Coach indisponível"). Substituto indicado na
// página de deprecações: claude-sonnet-5-5. Ao trocar de modelo de novo, conferir essa página.
export const MODELO_PADRAO = "claude-sonnet-5-5";

export async function callAnthropic({ apiKey, system, messages, maxTokens = 1200, model = MODELO_PADRAO }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages,
    }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

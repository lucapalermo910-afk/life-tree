// Único lugar que chama a API da Anthropic com os headers corretos.
// Usado por api/coach.js (produção, Vercel) e pelo middleware de dev do vite.config.js.
export async function callAnthropic({ apiKey, system, messages, maxTokens = 1200, model = "claude-sonnet-4-20250514" }) {
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

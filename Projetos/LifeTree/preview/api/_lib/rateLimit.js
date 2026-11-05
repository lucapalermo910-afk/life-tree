// Rate limit + guardas de payload pro proxy do Coach (/api/coach), compartilhado
// entre a function de produção (api/coach.js) e o middleware de dev (vite.config.js).
//
// Limitador em memória, por IP — best-effort: numa serverless function real, cada
// invocação pode cair num container novo (sem memória compartilhada entre elas), então
// isso não é uma garantia dura contra abuso distribuído. Mas já fecha o cenário mais
// comum (alguém batendo repetidamente na mesma URL a partir do mesmo IP) sem exigir
// infra externa (Redis/Upstash) que este projeto ainda não tem.
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS = 20; // por IP, por janela
const hits = new Map(); // ip -> [timestamps]

export function checkRateLimit(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (arr.length >= MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - arr[0])) / 1000);
    return { allowed: false, retryAfterSec };
  }
  arr.push(now);
  hits.set(ip, arr);
  // limpeza esporádica pra não vazar memória indefinidamente com IPs antigos
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k);
    }
  }
  return { allowed: true };
}

// 64KB (era 32KB até 05/11/2026): só o prompt da skill Yesod já passa de 31KB com a base vazia,
// então qualquer conversa de Finanças estourava o limite (413). Continua um teto contra abuso.
export const MAX_BODY_BYTES = 64 * 1024;
// 4096 (era 1500 até 05/11/2026): plano completo + perguntas cortava no meio.
const MAX_TOKENS_CAP = 4096;

// Clamp server-side independente do que o client pedir — quem descobrir a URL não
// pode simplesmente pedir maxTokens gigante pra inflar o custo por chamada.
export function clampMaxTokens(requested) {
  const n = Number(requested);
  if (!Number.isFinite(n) || n <= 0) return 1200;
  return Math.min(n, MAX_TOKENS_CAP);
}

export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { callAnthropic } from './api/_lib/callAnthropic.js'
import { checkRateLimit, getClientIp, clampMaxTokens, MAX_BODY_BYTES } from './api/_lib/rateLimit.js'

// Middleware só de dev: replica o endpoint /api/coach (que em produção é uma
// Vercel serverless function, ver api/coach.js) pra funcionar com `npm run dev`
// sem precisar do `vercel dev`. Lê ANTHROPIC_API_KEY de preview/.env (nunca vai pro bundle).
function coachDevMiddleware(env) {
  return {
    name: 'coach-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/coach', async (req, res) => {
        // Mesmo CORS aberto do endpoint de produção (api/coach.js) — permite testar
        // o app empacotado (Capacitor) apontando pro dev server via IP da LAN.
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        const rl = checkRateLimit(getClientIp(req));
        if (!rl.allowed) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Retry-After', String(rl.retryAfterSec));
          res.end(JSON.stringify({ error: 'Muitas requisições — tente novamente em instantes.' }));
          return;
        }
        let raw = '';
        let tooLarge = false;
        req.on('data', chunk => {
          raw += chunk;
          if (raw.length > MAX_BODY_BYTES) tooLarge = true;
        });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          if (tooLarge) {
            res.statusCode = 413;
            res.end(JSON.stringify({ error: 'Payload grande demais' }));
            return;
          }
          // mesma blindagem de api/coach.js — ver comentário lá (stripBom)
          const stripBom = s => (s && s.charCodeAt(0) === 65279) ? s.slice(1) : s;
          const apiKey = stripBom(env.ANTHROPIC_API_KEY)?.trim();
          if (!apiKey) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada — crie preview/.env com ANTHROPIC_API_KEY=sk-ant-...' }));
            return;
          }
          let body;
          try { body = JSON.parse(raw || '{}'); } catch { body = {}; }
          const { system, messages, maxTokens, model } = body;
          if (!Array.isArray(messages) || messages.length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'messages é obrigatório' }));
            return;
          }
          try {
            const { status, data } = await callAnthropic({ apiKey, system, messages, maxTokens: clampMaxTokens(maxTokens), model });
            res.statusCode = status;
            res.end(JSON.stringify(data));
          } catch (e) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Falha ao chamar a Anthropic: ' + e.message }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), coachDevMiddleware(env)],
    esbuild: {
      jsx: 'automatic',
    },
  };
})
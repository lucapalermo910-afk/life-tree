// ThemeCtx + paleta + kit de UI ligado ao tema, extraídos de HodModule.jsx (22/08/2026,
// item 5 do [[11 Plano de Decomposição — Arquivos Monolíticos]]) — vive num arquivo à
// parte (em vez de dentro do shell) porque tanto o shell quanto os arquivos de aba
// (hod/*Tab.jsx) precisam importar o mesmo ThemeCtx/kit; deixar isso dentro de
// HodModule.jsx criaria import circular (shell importa aba, aba importaria de volta do shell).
import { createContext } from "react";
import { bindThemeContext } from "../shared/uiBind.jsx";

export const DARK  = { bg:"#07090f", surface:"#0c1018", card:"#0f1520", b1:"#182030", b2:"#253040", text:"#eef2ff", muted:"#dde3ee", dim:"#9fb0c7", nav:"#060b12" };
export const LIGHT = { bg:"#fff7ed", surface:"#ffffff",  card:"#fffaf3", b1:"#fed7aa", b2:"#fb923c",  text:"#241004", muted:"#8a5a2e", dim:"#452405",  nav:"#fff7ed" };
export const ThemeCtx = createContext(LIGHT);
export const ACCENT = "#f97316";

// Sheet/FI/FTA/FS/Card/ProgressBar/Btn/Badge consolidados em shared/ui.jsx (21/08/2026,
// item 2 do plano) — ligados aqui ao ThemeCtx e ao ACCENT do módulo. Shell e todos os
// arquivos de aba importam este mesmo binding.
export const { Sheet, FI, FTA, FS, Card, Bar: ProgressBar, Btn, Badge } = bindThemeContext(ThemeCtx, ACCENT);

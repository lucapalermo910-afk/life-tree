// ThemeCtx + paleta + kit de UI ligado ao tema, extraídos de GeburahModule.jsx
// (21/08/2026, item 5 do [[11 Plano de Decomposição — Arquivos Monolíticos]]) —
// vive num arquivo à parte (em vez de dentro do shell) porque tanto o shell quanto
// os arquivos de aba (geburah/*Tab.jsx) precisam importar o mesmo ThemeCtx/kit;
// deixar isso dentro de GeburahModule.jsx criaria import circular (shell importa
// aba, aba importaria de volta do shell).
import { createContext } from "react";
import { bindThemeContext } from "../shared/uiBind.jsx";

export const DARK  = { bg:"#07090f",surface:"#0c1018",card:"#0f1520",b1:"#182030",b2:"#253040",text:"#eef2ff",muted:"#dde3ee",dim:"#9fb0c7",nav:"#060b12" };
export const LIGHT = { bg:"#fff5f5",surface:"#ffffff",card:"#fff8f8",b1:"#fdd",b2:"#f9a8a8",text:"#1a0505",muted:"#8a5a5a",dim:"#4a1a1a",nav:"#fff5f5" };
// Sheet/FI/FTA/FS/Card/Bar leem o tema atual daqui — Provider é montado uma vez
// no root de GeburahModule com o C local e correto (const, não a variável global mutável
// que existia antes de 12/08/2026).
export const ThemeCtx = createContext(LIGHT);
export const ACCENT = "#ef4444";
export const ORANGE = "#f97316";
export const GREEN  = "#10b981";
export const BLUE   = "#3b82f6";
export const PURPLE = "#8b5cf6";
export const AMBER  = "#f59e0b";
export const MICRO_META = { fibra:25, sodio:2300, calcio:1000, ferro:14, vitC:90 };

// Sheet/FI/FTA/FS/Card/Bar/Btn/Badge consolidados em shared/ui.jsx (21/08/2026, item 2 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]) — ligados aqui ao ThemeCtx e ao
// ACCENT do módulo. Shell e todos os arquivos de aba importam este mesmo binding.
export const { Sheet, FI, FTA, FS, Card, Bar, Btn, Badge } = bindThemeContext(ThemeCtx, ACCENT);

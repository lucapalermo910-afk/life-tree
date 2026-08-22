// GeburahCtx — bundle de estado/setters/valores computados compartilhados entre as
// abas de GeburahModule.jsx, extraído em 21/08/2026 (item 5 do
// [[11 Plano de Decomposição — Arquivos Monolíticos]]). O shell (GeburahModule.jsx)
// monta o Provider com um objeto contendo tudo que mais de uma aba/sheet precisa
// (mapeado em detalhe antes da extração — ver seção "Shared across multiple tabs"
// do levantamento) mais os controles de sheet/toast genéricos (f/sh/openSh/close/toast_).
// Estado que era hoisted no shell só pra sobreviver a remounts de abas recriadas a cada
// render (medExpanded, fotos, treinoSv, bibGrupo, timerAtivo, nowTick etc.) NÃO entra
// aqui — agora que as abas são componentes de módulo estáveis (importados e renderizados
// como <TreinoTab/>, não mais chamados como função), esse estado local pode voltar a
// morar dentro de cada aba via useState normal.
import { createContext, useContext } from "react";

export const GeburahCtx = createContext(null);
export const useGeburah = () => useContext(GeburahCtx);

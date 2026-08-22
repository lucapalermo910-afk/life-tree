// HodCtx — bundle de estado/setters/scores compartilhados entre as abas de
// HodModule.jsx, extraído em 22/08/2026 (item 5 do [[11 Plano de Decomposição —
// Arquivos Monolíticos]]), mesmo padrão do GeburahCtx. Diferença notável em relação ao
// Geburah: nenhuma aba/página do Hod tinha estado local próprio antes do split (o
// levantamento de dependências confirmou — o "recriadas a cada render" já tinha sido
// corrigido só com hoist de função pra `X()`, sem precisar hoist de estado), então não há
// nada pra "devolver" às abas depois de virarem componentes estáveis — o Context aqui é
// puramente aditivo, não substitui um passo de "estado volta a ser local".
import { createContext, useContext } from "react";

export const HodCtx = createContext(null);
export const useHod = () => useContext(HodCtx);

import { useContext } from "react";
import { Sheet, FI, FTA, FS, Card, Bar, Btn, Badge } from "./ui.jsx";

// Separado de ui.jsx (21/08/2026) só pra não misturar export de componente com export de
// função nesse arquivo — react-refresh/only-export-components exige um ou outro por arquivo
// pra manter o fast refresh funcionando em dev.
//
// Liga o kit de ui.jsx a um ThemeCtx e a uma cor de destaque específicos de um módulo — os
// componentes retornados leem C via Context (não por prop) e caem no accent do módulo
// quando um call site não passa `color`, exatamente como cada módulo já se comportava.
// Chamar uma vez no escopo do módulo (nunca dentro do componente, recriaria a identidade
// dos componentes a cada render — mesma classe de bug já corrigida em 6 módulos, ver
// [[04 Bugs Conhecidos]]).
export function bindThemeContext(ThemeCtx, accent = "#818cf8") {
  const useC = () => useContext(ThemeCtx);
  return {
    Sheet: p => <Sheet {...p} C={useC()} />,
    FI: p => <FI {...p} C={useC()} />,
    FTA: p => <FTA {...p} C={useC()} />,
    FS: p => <FS {...p} C={useC()} />,
    Card: p => <Card {...p} C={useC()} />,
    Bar: p => <Bar {...p} C={useC()} color={p.color || accent} />,
    Btn: p => <Btn {...p} color={p.color || accent} />,
    Badge: p => <Badge {...p} color={p.color || accent} />,
  };
}

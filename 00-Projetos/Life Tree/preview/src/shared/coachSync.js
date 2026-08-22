// Receita padrão de sincronização entre uma ação do Coach (executada em App.jsx, escrevendo
// direto no localStorage — ver yesodActions.js) e o módulo correspondente, se estiver montado
// na tela. Todo módulo com actions:true deve seguir esse padrão: chamar notifyCoachDataUpdated
// depois de cada escrita, e o componente do módulo chamar useCoachDataSync uma vez, apontando
// pra função que recarrega o estado dele a partir do localStorage.
//
// Um único nome de evento serve pra todos os módulos — o "detail.module" filtra pra cada um
// só reagir à sua própria atualização, então não precisa inventar um evento novo por módulo.
import { useEffect } from "react";

const EVENT_NAME = "lifetree:coach-data-updated";

export function notifyCoachDataUpdated(moduleId) {
  try { window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { module: moduleId } })); } catch {}
}

// Uso dentro do componente do módulo: useCoachDataSync("yesod", loadFromStorage)
export function useCoachDataSync(moduleId, reloadFn) {
  useEffect(() => {
    const onUpdate = (e) => { if (e.detail?.module === moduleId) reloadFn(); };
    window.addEventListener(EVENT_NAME, onUpdate);
    return () => window.removeEventListener(EVENT_NAME, onUpdate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);
}

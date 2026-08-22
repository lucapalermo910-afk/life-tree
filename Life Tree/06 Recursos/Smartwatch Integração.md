---
tags: [lifetree, spec, smartwatch]
---

# ⌚ Integração com Smartwatch — Guia Completo

## Resposta curta: sim, dá — mas com limitações importantes

Nenhum smartwatch Android ou WearOS aceita APKs React Native diretamente. A estratégia depende de qual caminho você quer seguir.

## Opções Disponíveis (da mais fácil à mais robusta)

### Opção 1 — Notificações (mais fácil, implementável hoje)
**O que faz:** O watch exibe notificações do app e permite ações rápidas (confirmar hábito, dispensar).

**Como funciona:**
- App no celular envia notificação via `expo-notifications`
- Smartwatch espelha automaticamente (funciona em qualquer Android watch + WearOS)
- Usuário responde com botões pré-definidos na notificação

```js
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: "🔥 " + habit.title,
    body: "Hora de completar seu hábito!",
    data: { habitId: habit.id },
    categoryIdentifier: 'habit_reminder',
  },
  trigger: { hour: reminder.hour, minute: reminder.min, repeats: true },
});

await Notifications.setNotificationCategoryAsync('habit_reminder', [
  { identifier: 'done',    buttonTitle: '✅ Feito',   options: { opensAppToForeground: false } },
  { identifier: 'snooze',  buttonTitle: '⏰ Depois',  options: { opensAppToForeground: false } },
]);

Notifications.addNotificationResponseReceivedListener(response => {
  if (response.actionIdentifier === 'done') {
    const { habitId } = response.notification.request.content.data;
    completeHabit(habitId);
  }
});
```

**Limitações:** não exibe dados do app, sem interface visual no watch. Funciona automaticamente em qualquer smartwatch Android.

### Opção 2 — Tile / Complication WearOS (intermediário)
**O que faz:** Exibe um resumo do Life Tree diretamente no mostrador ou no painel de tiles do watch.

**Plataformas:** Samsung Galaxy Watch (WearOS 3+), Pixel Watch, Fossil, etc.

```
App Life Tree (telefone) → sincroniza dados → WearOS Companion App → Tile/Complication
```

Requer app WearOS separado em Kotlin (nativo) ou Jetpack Compose for Wear, comunicando via Wearable Data Layer API.

```kotlin
// WearOS app — Tile simples
class HabitTileService : TileService() {
    override fun onTileRequest(requestParams: RequestBuilders.TileRequest) =
        Futures.immediateFuture(
            Tile.Builder()
                .setResourcesVersion("1")
                .setTimeline(
                    Timeline.Builder().addTimelineEntry(
                        TimelineEntry.Builder().setLayout(
                            Layout.Builder().setRoot(
                                Column.Builder()
                                    .addContent(Text.Builder().setText(
                                        TypeBuilders.StringProp.Builder("3/5 hábitos").build()
                                    ).build())
                                    .addContent(Text.Builder().setText(
                                        TypeBuilders.StringProp.Builder("🔥 Streak: 7 dias").build()
                                    ).build())
                                    .build()
                            ).build()
                        ).build()
                    ).build()
                ).build()
        )
}
```

**Sincronização telefone → watch:**
```kotlin
val dataClient = Wearable.getDataClient(context)
val putDataRequest = PutDataMapRequest.create("/life_tree_data").run {
    dataMap.putString("habits_today", "3/5")
    dataMap.putString("streak", "7")
    dataMap.putString("xp_today", "+60")
    asPutDataRequest()
}
dataClient.putDataItem(putDataRequest)
```

**Esforço:** Alto — requer app nativo Android + app WearOS separado.

### Opção 3 — App WearOS Completo (mais robusto)
**Stack recomendada:** Jetpack Compose for Wear OS, Wearable Data Layer para sync, Room Database no watch.

**Telas sugeridas:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  HOJE           │    │  HÁBITOS        │    │  STATS          │
│                 │    │                 │    │                 │
│  3/5 ✅         │    │  ✅ Meditar     │    │  🔥 Streak: 7d  │
│  Hábitos feitos │    │  ✅ Água        │    │  ⚡ +60 XP      │
│                 │    │  ○ Exercício    │    │  🎯 Nv. 3       │
│  🔥 7d streak   │    │  ○ Leitura      │    │                 │
│                 │    │  ○ Meditação    │    │                 │
│  [Ver todos]    │    │  [✓ Completar]  │    │  [Árvore]       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Opção 4 — Apple Watch (se usar iPhone)
**Via:** watchOS app em SwiftUI + WatchConnectivity framework

```swift
import WatchConnectivity

class WatchConnectivityManager: NSObject, WCSessionDelegate {
    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        let habitsDone = message["habits_done"] as? String ?? "0/0"
        let streak = message["streak"] as? String ?? "0"
        DispatchQueue.main.async {
            self.updateComplication(habitsDone: habitsDone, streak: streak)
        }
    }
}
```

## Recomendação (contexto: Android, ainda sem computador para compilar)

**Fase 1 (agora, via Expo):** notificações com botões de ação rápida — zero código nativo.
**Fase 2 (quando tiver acesso a computador):** app WearOS simples com Tile de resumo diário.
**Fase 3 (futuro):** app WearOS completo com check-in de hábitos direto no pulso.

## Smartwatch + Coach de IA

Ver [[Coach de IA]]. No watch, o coach seria limitado a:
```
┌─────────────────────────────┐
│  🌳 Coach Life Tree         │
│                             │
│  "Faltam 2 hábitos hoje"   │
│                             │
│  [✅ Meditar]               │
│  [✅ Exercício]             │
│  [💬 Perguntar]             │
└─────────────────────────────┘
```
Para o chat completo, o watch abre o app no telefone via handoff. Respostas rápidas pré-definidas no watch, chat completo no telefone.

## Conclusão

| Feature | Complexidade | Funciona hoje |
|---|---|---|
| Notificações + ação rápida | ⭐ Baixa | ✅ Via Expo |
| Tile de resumo WearOS | ⭐⭐⭐ Alta | Precisa PC + Kotlin |
| App WearOS completo | ⭐⭐⭐⭐⭐ Muito alta | Precisa PC + 2-4 semanas |
| Apple Watch | ⭐⭐⭐⭐ Alta | Precisa Mac + Swift |
| Coach de IA no watch | ⭐⭐ Média (respostas rápidas) | Via notificações |

## Ver também
- [[Coach de IA]]
- [[05 Roadmap]] — backlog P3 (smartwatch)

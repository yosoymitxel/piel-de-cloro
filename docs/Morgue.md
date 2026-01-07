# Morgue (Registro de Purgas) ⚰️

**Resumen:**
La morgue muestra el registro de sujetos purgados durante la run (`State.purgedNPCs`). Sirve como archivo informativo y de rastreo de infectados detectados.

## Estado relevante
- `State.purgedNPCs` (Array): NPCs purgados. Cada NPC tiene un campo `death` con la forma `{ reason: 'purga', cycle, revealed: boolean }`.
- `death.revealed` se establece a `true` en `State.startNextDay()` (las purgas se hacen públicas al siguiente día).
- NPCs pueden tener `isInfected` para marcar registros infectados.

## Elementos UI
- `#screen-morgue` – pantalla de la morgue.
- `#morgue-grid` – grid que contiene tarjetas de cada purgado.
- Las tarjetas muestran avatar y nombre y aplican la clase `infected` cuando `death.revealed && npc.isInfected`.
- Reproducción de sonidos: `morgue_reveal_infected` cuando se muestra una infección.

## Lógica y comportamiento
- `UIManager.renderMorgueGrid(npcs, onDetailClick)` genera las tarjetas, aplica efectos visuales y enlaza el detalle al `modal`.
- `Game.openMorgue()` renderiza la morgue y abre la pantalla, además actualiza estadísticas (`ui.updateRunStats(State)`).
- Si un purgado fue revelado como infectado, puede activarse un efecto visual (flash) con baja probabilidad para dramatizar.

## Notas de integración / pruebas sugeridas ✅
- Comprobar que `startNextDay()` marca `death.revealed = true` y que eso se refleja en la UI al abrir la morgue.
- Validar que la tarjeta aplica la clase `infected` sólo cuando corresponde y que se dispara `morgue_reveal_infected` al render.
- Asegurar que la acción click en la tarjeta invoca `ui.openModal(npc, false, null)` y muestra los detalles esperados.

---

¿Prefieres que también agregue un documento con ejemplos de cómo testear UI (jest/dom) estas pantallas?
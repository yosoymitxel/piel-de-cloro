# Perímetro (Registro de Actividad) 📋

**Resumen:**
La pantalla de Perímetro (anteriormente Morgue) muestra el registro histórico de todos los sujetos que han abandonado el refugio, clasificados por su destino final.

## Estado relevante
- `State.purgedNPCs` (Array): NPCs purgados. Cada NPC tiene un campo `death` con la forma `{ reason: 'purga', cycle, revealed: boolean }`.
- `State.escapedNPCs` (Array): NPCs que escaparon o huyeron (ej. tras diálogo hostil o intrusión fallida).
- `State.nightNPCs` (Array): NPCs que abandonaron el refugio durante la fase nocturna (ej. expulsados por sobrepoblación o eventos).
- `death.revealed` se establece a `true` en `State.startNextDay()` (las purgas se hacen públicas al siguiente día).
- NPCs pueden tener `isInfected` para marcar registros infectados.

## Elementos UI
- `#screen-morgue` – pantalla de la morgue.
- `#morgue-grid-purged` – grid superior: muertos / purgados.
- `#morgue-grid-escaped` – grid medio: fugitivos.
- `#morgue-grid-night` – grid inferior: salidas nocturnas.
- Las tarjetas muestran avatar y nombre y aplican la clase `infected` cuando `death.revealed && npc.isInfected`.
- Reproducción de sonidos: `morgue_reveal_infected` cuando se muestra una infección.

## Lógica y comportamiento
- `UIManager.renderMorgueGrid(purged, escaped, night, onDetailClick)` ahora debe aceptar tres listas y renderizar en los contenedores correspondientes.
- `Game.openMorgue()` renderiza la morgue y abre la pantalla, además actualiza estadísticas (`ui.updateRunStats(State)`).
- Si un purgado fue revelado como infectado, puede activarse un efecto visual (flash) con baja probabilidad para dramatizar.
- Los fugitivos y nocturnos pueden tener estilos visuales distintos (bordes amarillos/azules) para diferenciar la causa de salida.

## Notas de integración / pruebas sugeridas ✅
- Comprobar que `startNextDay()` marca `death.revealed = true` y que eso se refleja en la UI al abrir la morgue.
- Validar que la tarjeta aplica la clase `infected` sólo cuando corresponde y que se dispara `morgue_reveal_infected` al render.
- Asegurar que la acción click en la tarjeta invoca `ui.openModal(npc, false, null)` y muestra los detalles esperados.

---

¿Prefieres que también agregue un documento con ejemplos de cómo testear UI (jest/dom) estas pantallas?
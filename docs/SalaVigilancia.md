# Sala de Vigilancia (SALA) 🛡️

**Resumen:**
La sala de vigilancia permite revisar y asegurar elementos de seguridad que reducen la probabilidad y el canal de intrusiones (diurnas/nocturnas). Está orientada a la gestión preventiva de entradas externas.

## Estado relevante
- `State.securityItems` (Array): elementos generados al iniciar la run. Cada elemento tiene la forma `{ type: 'alarma'|'puerta'|'ventana'|'tuberias'|'generador', active?/secured? }`.
  - `alarma` → `{ type: 'alarma', active: boolean }`
  - otros (`puerta`, `ventana`, `tuberias`) → `{ type, secured: boolean }`
  - `generador` puede estar presente como un item especial (insertado vía `ensureGeneratorItem`).

## Elementos UI
- `#screen-room` – pantalla de la sala de vigilancia.
- `#security-grid` – rejilla con tarjetas de seguridad.
- `#security-count` – contador de ítems.
- Botones creados dentro de cada tarjeta que alternan `active`/`secured` y disparan sonidos/feedback.
- Botón temporal `#btn-shelter-goto-gen` aparece en el panel de day-after si el generador necesita revisión.

## Lógica y comportamiento
- `UIManager.renderSecurityRoom(items, onToggle)` renderiza las tarjetas y crea botones para activar/asegurar.
- `Game.openRoom()` recupera `State.securityItems` y llama al renderer.
- Intrusiones se procesan en `Game.processIntrusions()` y `Game.attemptDayIntrusion()`:
  - Se calcula `prob = State.config.securityIntrusionProbability * State.getIntrusionModifier()`.
  - Las intrusiones usan como vía un `channel` (un item con `type !== 'alarma'` y `!secured`) o la `alarma` si no hay channels.
  - `alarma.active` genera un mensaje y efectos sonoros cuando detecta una intrusión.
  - Durante el día, existe la posibilidad de que canales asegurados o alarma se desactiven (`dayDeactivationProbability`), lo que requiere volver a asegurar.

## Notas de integración / pruebas sugeridas ✅
- Verificar que `renderSecurityRoom` filtra correctamente items de tipo `generador` en la cuenta mostrada.
- Testear que asegurar una `puerta`/`ventana` evita que sea seleccionada como `via` para intrusión.
- Validar que `alarm.active` envía la notificación apropiada cuando ocurre una intrusión.
- Asegurar que el botón `#btn-shelter-goto-gen` aparece sólo cuando `generatorOk` es false (basado en `State.generator.power` y `isOn`).

---

¿Quieres que añada una breve guía de componentes de interfaz (HTML snippets) o ejemplos de tests unitarios para los flujos de intrusión?
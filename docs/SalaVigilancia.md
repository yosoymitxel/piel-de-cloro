# Sala de Vigilancia (SALA) 🛡️

**Resumen:**
La sala de vigilancia permite revisar y asegurar elementos de seguridad que reducen la probabilidad y el canal de intrusiones (diurnas/nocturnas). Está orientada a la gestión preventiva de entradas externas.

## Estado relevante
 - `State.securityItems` (Array): elementos generados al iniciar la run. Cada elemento tiene la forma `{ type: 'alarma'|'puerta'|'ventana'|'tuberias', active?/secured? }`.
  - `alarma` → `{ type: 'alarma', active: boolean }`.
  - otros (`puerta`, `ventana`, `tuberias`) → `{ type, secured: boolean }`.
  - **Nota:** Los estados iniciales (`active`/`secured`) se generan aleatoriamente (50% probabilidad) al inicio de la partida.

## Elementos UI
- `#screen-room` – pantalla de la sala de vigilancia con fondo inmersivo industrial.
- `#room-power-warning` – aviso visual "SIN ENERGÍA" cuando el generador está apagado.
- `#security-grid` – rejilla con tarjetas de seguridad.
- `#security-count` – contador de ítems.
- **Visual Items 3D:** Cada tarjeta incluye una representación visual (3D/Animated) del elemento (alarma, puerta, ventana, tubería).
- **Interacción:** Se puede alternar el estado haciendo clic tanto en el botón inferior como directamente en el cuadro visual animado.
- Botón temporal `#btn-shelter-goto-gen` aparece en el panel de day-after si el generador necesita revisión.

## Lógica y comportamiento
- `UIManager.renderSecurityRoom(items, onToggle)` renderiza las tarjetas con sus visuales dinámicos.
  - Los visuales reflejan el estado real (puertas abiertas/cerradas, flujo de tuberías, pulsos de alarma).
  - Si `State.generator.isOn` es `false`, la interfaz se bloquea, muestra el aviso de energía y deshabilita la interacción.
- `Game.openRoom()` recupera `State.securityItems` y llama al renderer.
- **Dependencia Energética:** Si el generador se apaga (manual o fallo), se invoca `Game.shutdownSecuritySystem()`, que fuerza todos los ítems a estado inseguro/inactivo.
- Intrusiones se procesan en `Game.processIntrusions()` y `Game.attemptDayIntrusion()`:
  - Se calcula `prob = State.config.securityIntrusionProbability * State.getIntrusionModifier()`.
  - Las intrusiones usan como vía un `channel` (un item con `type !== 'alarma'` y `!secured`) o la `alarma` si no hay canales disponibles.
  - `alarma.active` genera un mensaje y efectos sonoros cuando detecta una intrusión.
  - Durante el día, existe la posibilidad de que canales asegurados o alarma se desactiven (`dayDeactivationProbability`), lo que requiere volver a asegurar.

## Notas de integración / pruebas sugeridas ✅
- Testear que asegurar una `puerta`/`ventana` evita que sea seleccionada como `via` para intrusión.
- Validar que `alarm.active` envía la notificación apropiada cuando ocurre una intrusión.
- Asegurar que el botón `#btn-shelter-goto-gen` aparece sólo cuando `generatorOk` es false (basado en `State.generator.power` y `isOn`).
- Verificar que al apagar el generador, todos los ítems de la sala pasan a `false` y requieren reactivación manual al volver la luz.

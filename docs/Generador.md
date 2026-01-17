# Generador ⚡

**Resumen:**
La sala de generador controla el suministro energético del puesto. Afecta las herramientas de inspección, la probabilidad de intrusiones y genera eventos de fallo (apagones y sobrecargas).

## Estado (State.generator)
- `isOn` (boolean): si el generador está encendido.
- `mode` ("save" | "normal" | "overload"): modo operativo que determina consumo y riesgo.
- `power` (0-100): indicador visual de batería (reserva de energía). El color cambia según el nivel (>50% Verde, <50% Amarillo, <20% Rojo).
- `blackoutUntil` (timestamp): si > Date.now() el generador está temporalmente bloqueado (apagar/encender deshabilitado).
- `overclockCooldown` (boolean): impide volver a poner `overload` tras recuperaciones inmediatas.
- `overloadRiskTurns` (int): turnos restantes con riesgo de fallo por sobrecarga.
- `maxModeCapacityReached` (int): el máximo de cargas consumibles permitido por el modo (1,2,3).
- `emergencyEnergyGranted` (boolean): evita restaurar energía de emergencia más de una vez por NPC.
- `restartLock` (boolean): indica si el generador acaba de ser reiniciado, impidiendo subir la potencia en el mismo turno.

## Configuración (State.config.generator)
- `consumption`: modificador de consumo por modo (save:0, normal:10, overload:30).
- `failureChance`: probabilidad de fallo por modo.
- `breakdownChance`: prob. extra de rotura (uso interno/placeholder).

## Elementos UI relevantes
- `#screen-generator` – pantalla del generador con disposición optimizada horizontalmente.
- `#generator-panel` – panel central (Flex horizontal para aprovechar el espacio).
- `#generator-power-bar` – barra visual de potencia (20 bloques).
- `#generator-mode-label` – muestra el modo actual.
- `#btn-gen-toggle` – botón ENCENDER/APAGAR.
- `#btn-gen-save`, `#btn-gen-normal`, `#btn-gen-over` – selectores de modo.
- `#generator-warning-panel` – advertencia al usuario.
- `#generator-manual`, `#btn-gen-manual-toggle` – manual / ayuda.
- `#generator-room-log` – Bitácora de Operaciones (Logs) ubicada dentro del Manual Técnico.

## Lógica y comportamiento (Resumen técnico)
- `GeneratorManager.renderGeneratorRoom(state)` renderiza todos los controles y estado.
- Cambiar modo valida si ya hubo interacción con el NPC (no se permite subir capacidad después de usar herramientas o empezar diálogo).
- El cambio de modo **NO** afecta visualmente al nivel de batería de inmediato (sin saltos), pero incrementa el consumo en `calculateTotalLoad`.
- La batería (`power`) está limitada estrictamente a 100%.
- `overload` puede causar un apagón inmediato con ~35% de probabilidad: setea `blackoutUntil` y se llama `ui.applyBlackout(ms)`.
- **Apagado:** Cuando el generador se apaga (`isOn = false`), ya sea manual o por fallo:
  - Las acciones de inspección se bloquean.
  - Se llama a `Game.shutdownSecuritySystem()`, desactivando toda la Sala de Vigilancia.
- `Game.updateGenerator()` aplica riesgos por sobrecarga (activa `overloadRiskTurns`) y puede llamar a `triggerGeneratorFailure()`.
- `Game.triggerGeneratorFailure()` apaga el generador, bloquea scans y reproduce efectos sonoros y visuales.
- **Encendido / Reinicio:** Al encender el generador:
  - Se fuerza el modo **AHORRO** (1 carga).
  - Se activa `restartLock` y `overclockCooldown`, impidiendo subir a Normal o Sobrecarga hasta el siguiente turno.
  - Puede restaurar 1 carga de emergencia si no hubo actividad previa con el NPC actual.
  - Se restauran los estados de los subsistemas (`systems`) para asegurar el cálculo correcto de carga.

## Notas de integración / pruebas sugeridas ✅
- Verificar que los botones `#btn-gen-*` respetan la lógica de `maxModeCapacityReached` cuando `npc.scanCount > 0` o `npc.dialogueStarted`.
- Probar que `overload` adecúa `blackoutUntil` y que `#btn-gen-toggle` aparece bloqueado durante el blackout.
- Testear la restauración de energía de emergencia al encender tras fallo o si no hubo actividad (flag `emergencyEnergyGranted`).
- Comprobar que `DialogueEngine` reemplaza `{generatorStatus}` por "apagado" / "inestable" / "estable" según `isOn` y `power`.
- Verificar que los logs del guardia asignado aparecen en la sección de Manual Técnico.


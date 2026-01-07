# Generador ⚡

**Resumen:**
La sala de generador controla el suministro energético del puesto. Afecta las herramientas de inspección, la probabilidad de intrusiones y genera eventos de fallo (apagones y sobrecargas).

## Estado (State.generator)
- `isOn` (boolean): si el generador está encendido.
- `mode` ("save" | "normal" | "overload"): modo operativo que determina consumo y riesgo.
- `power` (0-100): indicador visual de potencia. <20 = "inestable" (usado en diálogos).
- `blackoutUntil` (timestamp): si > Date.now() el generador está temporalmente bloqueado (apagar/encender deshabilitado).
- `overclockCooldown` (boolean): impide volver a poner `overload` tras recuperaciones inmediatas.
- `overloadRiskTurns` (int): turnos restantes con riesgo de fallo por sobrecarga.
- `maxModeCapacityReached` (int): el máximo de cargas consumibles permitido por el modo (1,2,3).
- `emergencyEnergyGranted` (boolean): evita restaurar energía de emergencia más de una vez por NPC.

## Configuración (State.config.generator)
- `consumption`: cargas por modo (save:1, normal:2, overload:3).
- `failureChance`: probabilidad de fallo por modo.
- `breakdownChance`: prob. extra de rotura (uso interno/placeholder).

## Elementos UI relevantes
- `#screen-generator` – pantalla del generador.
- `#generator-panel` – panel central.
- `#generator-power-bar` – barra visual de potencia (20 bloques).
- `#generator-mode-label` – muestra el modo actual.
- `#btn-gen-toggle` – botón ENCENDER/APAGAR.
- `#btn-gen-save`, `#btn-gen-normal`, `#btn-gen-over` – selectores de modo.
- `#generator-warning-panel` – advertencia al usuario.
- `#generator-manual`, `#btn-gen-manual-toggle` – manual / ayuda.

## Lógica y comportamiento (Resumen técnico)
- `GeneratorManager.renderGeneratorRoom(state)` renderiza todos los controles y estado.
- Cambiar modo valida si ya hubo interacción con el NPC (no se permite subir capacidad después de usar herramientas o empezar diálogo).
- `overload` puede causar un apagón inmediato con ~35% de probabilidad: setea `blackoutUntil` y se llama `ui.applyBlackout(ms)`.
- Cuando el generador está `isOn === false`, las acciones de inspección quedan bloqueadas (scanCount se ajusta a 99 por seguridad en el flujo del juego).
- `Game.updateGenerator()` aplica riesgos por sobrecarga (activa `overloadRiskTurns`) y puede llamar a `triggerGeneratorFailure()`.
- `Game.triggerGeneratorFailure()` apaga el generador, bloquea scans y reproduce efectos sonoros y visuales.
- Encender el generador puede restaurar 1 carga de emergencia en ciertas condiciones (si no hubo actividad o tras fallo) y marcar `emergencyEnergyGranted` para evitar abuso.

## Notas de integración / pruebas sugeridas ✅
- Verificar que los botones `#btn-gen-*` respetan la lógica de `maxModeCapacityReached` cuando `npc.scanCount > 0` o `dialogueStarted`.
- Probar que `overload` adecúa `blackoutUntil` y que `#btn-gen-toggle` aparece bloqueado durante el blackout.
- Testear la restauración de energía de emergencia al encender tras fallo o si no hubo actividad (flag `emergencyEnergyGranted`).
- Comprobar que `DialogueEngine` reemplaza `{generatorStatus}` por "apagado" / "inestable" / "estable" según `isOn` y `power`.

---

Si quieres, puedo añadir diagramas de estado (transiciones entre modos) o ejemplos de pruebas unitarias/automatizadas para estos comportamientos.
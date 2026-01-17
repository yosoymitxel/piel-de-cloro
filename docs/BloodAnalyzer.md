# Análisis de Hemoglobina (Test Definitivo)

Este sistema introduce una herramienta de diagnóstico infalible pero con un costo estratégico masivo.

## ⚙️ Mecánicas de Funcionamiento

### 1. Requisitos de Energía
- El analizador es un equipo pesado que requiere estabilidad en la red.
- **Solo disponible** cuando el generador está en modo `NORMAL` o `OVERLOAD`.
- Al activarse, **consume el 100% de la carga actual del generador**. Independientemente de si tenías 10 o 100 de energía, esta se agotará.

### 2. El Factor Tiempo (Countdown)
- El proceso de centrifugado y secuenciación tarda **2 turnos** completos.
- Durante estos turnos, el NPC debe permanecer en el refugio (no puede ser purgado ni ignorado sin perder el test).
- El resultado se revela automáticamente en la bitácora tras pasar 2 "Siguientes Sujetos".

### 3. Impacto en Paranoia
- Extraer sangre en un ambiente de desconfianza extrema genera estrés.
- +15 puntos de Paranoia inmediata al iniciar el test.

---

## 🛠️ Implementación Técnica

- **`GameActionHandler.startBloodTest(npc)`**: Inicia el contador y drena la energía.
- **`GameMechanicsManager.updateTurnEndSystems()`**: Decrementa el `bloodTestId` y revela el estado `isInfected` al llegar a cero.

## 🧪 Verificación
Consultar `__tests__/blood_analyzer.test.js` para asegurar que las restricciones de energía y los tiempos de espera funcionen correctamente.

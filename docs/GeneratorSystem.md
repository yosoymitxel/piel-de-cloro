# Sistema del Generador

El generador es el núcleo de la gestión de recursos en *Ruta 01*. Determina cuántas acciones de inspección puede realizar el jugador por turno y controla la estabilidad del sistema de seguridad.

## Modos de Funcionamiento

El jugador puede alternar entre tres modos en la pantalla del Generador (`#screen-generator`).

| Modo | Energía (Tests/Turno) | Consumo | Riesgo de Fallo | Descripción |
| :--- | :---: | :--- | :--- | :--- |
| **AHORRO** | **1** | Bajo | 0% | Modo seguro. Garantiza estabilidad pero limita severamente la capacidad de deducción. |
| **NORMAL** | **2** | Medio | 8% | Balance estándar. Es el modo por defecto al iniciar el día. |
| **SOBRECARGA** | **3** | Alto | 20% + Riesgo Crítico | Permite análisis exhaustivo. Si se mantiene, aumenta el riesgo de explosión o apagón forzoso. |

## Mecánicas de Fallo

### Apagón (Blackout)
Si el generador falla (por RNG en cada turno o evento de sobrecarga):
1.  **Pérdida de Energía**: El contador de tests del NPC actual baja a 0 inmediatamente.
2.  **Seguridad Comprometida**: Todos los sistemas de la Sala de Vigilancia (puertas, ventanas, alarmas) se desactivan (`secured: false`).
3.  **Reinicio**: El jugador debe ir manualmente a la sala del generador para reiniciarlo.
    - El reinicio fuerza el modo **AHORRO**.
    - Aplica un bloqueo temporal (`restartLock`) que impide subir la potencia inmediatamente.

### Sobrecarga y Riesgo Crítico
El modo Sobrecarga tiene un contador interno de riesgo (`overloadRiskTurns`). Si se abusa de este modo:
- Puede provocar un apagón inmediato.
- Si hay pocos civiles en el refugio para realizar mantenimiento, existe una probabilidad de **Game Over** por explosión del reactor (`final_overload_death`).

## Interfaz
- **Barra de Potencia**: Visualización dinámica de la carga. Parpadea y cambia de color según el modo.
- **Botón de Encendido**: Permite apagar/encender manualmente. Apagarlo ahorra combustible (conceptual) pero deja el puesto indefenso ante intrusiones.
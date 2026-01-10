# Sistema Nocturno y Gestión de Refugio

La fase nocturna es el momento de resolución de las decisiones tomadas durante el día. Ocurre cuando se han procesado todos los sujetos del día (`State.dayTime > State.config.dayLength`).

## 📂 Archivos Relacionados
- **`js/Game.js`**: Métodos `startNightPhase()`, `sleep()`, `processIntrusions()`.
- **`js/State.js`**: Flags `isNight`, `dayClosed`, `lastNight`, `nightPurgePerformed`.
- **`js/UIManager.js`**: Renderizado de la pantalla nocturna (`renderNightScreen`).

## ⚙️ Implementación Técnica

## Fases de la Noche

### 1. Gestión del Refugio (`Shelter`)
Antes de dormir, el jugador puede revisar a los NPCs admitidos.
- **Validación (Day After)**: Los sujetos admitidos el día anterior pueden ser sometidos a tests avanzados si se dispone de reactivos (limitados).
- **Purga**: Si el jugador sospecha de un sujeto admitido, puede eliminarlo ("Purgar").
  - **Consecuencia**:
    - Si era **Infectado**: La paranoia baja (-5%). El refugio está a salvo.
    - Si era **Humano**: La paranoia sube drásticamente (+20%). Has matado a un inocente.

### 2. Intrusiones Nocturnas
El juego calcula si algo intenta entrar en el puesto mientras el jugador gestiona el refugio o duerme.
- **Probabilidad**: Basada en la configuración y el estado del generador (si está apagado, la probabilidad aumenta).
- **Vías de entrada**: Puertas, Ventanas, Tuberías o Alarma.
- **Defensa**: Si la vía está asegurada (`secured: true`) en la Sala de Vigilancia, la intrusión falla. Si no, un nuevo NPC (generalmente hostil/infectado) se añade a la cola o entra directamente.
- **Código**: `Game.processIntrusions()` verifica `State.securityItems`.

### 3. Dormir (Resolución)
Al pulsar "Dormir", se calcula el resultado de la noche:

| Estado del Refugio | Resultado |
| :--- | :--- |
| **Con Infectado(s)** | **Muerte de Civil**: Un NPC humano muere. Paranoia +30%. <br> **Muerte del Jugador**: Si no hay civiles, el jugador muere (Game Over). |
| **Vacío (0 NPCs)** | **Riesgo de Locura**: Probabilidad alta (92%) de Game Over por soledad/paranoia (`final_death_alone`). Si sobrevive, paranoia alta. |
| **Limpio (Solo Humanos)** | **Noche Tranquila**: Paranoia baja (-10%). Se recuperan recursos para el día siguiente. |

## Variables de Estado Relevantes

- `State.isNight` (bool): Bloquea el avance del día hasta resolver la noche.
- `State.nightPurgePerformed` (bool): Impide realizar más de una purga por noche.
- `State.lastNight` (obj): Almacena el resultado (`victims`, `message`) para mostrarlo en el log al día siguiente.

## Eventos de Abandono
Durante la noche, algunos NPCs pueden decidir irse por su cuenta (`departedNPCs`), especialmente si la paranoia es alta o el refugio está superpoblado. Esto se notifica en el log al iniciar el siguiente día.
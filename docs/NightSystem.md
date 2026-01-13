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
Al pulsar "Dormir", se calcula el resultado de la noche. Antes de la resolución de eventos (ataques de infectados), el sistema procesa los suministros y los rasgos de los NPCs admitidos.

#### 3.1 Procesamiento de Recursos y Rasgos (`processNightResourcesAndTraits`)
El método `GameMechanicsManager.processNightResourcesAndTraits()` realiza las siguientes acciones:
- **Consumo**: Cada NPC consume 1 unidad de `State.supplies`. El rasgo **Enfermizo** (`sickly`) consume 2 unidades.
- **Recolección**: Los NPCs con el rasgo **Recolector** (`scavenger`) tienen una probabilidad (40%) de encontrar 1-3 unidades extra de suministros.
- **Moral**: 
    - El rasgo **Optimista** (`optimist`) aumenta la cordura (`State.sanity`) en +5%.
    - El rasgo **Paranoico** (`paranoid`) aumenta la paranoia (`State.paranoia`) en +10%.
- **Inanición**: Si los suministros llegan a 0:
    - Se reduce la cordura en -15%.
    - Existe un 10% de probabilidad de que un NPC aleatorio muera por inanición.

#### 3.2 Tabla de Resultados de la Noche
Si la noche pasa tranquila (`night_tranquil`):
- **Reducción de Paranoia**: Se reduce la paranoia base (-10%).
- **Bono de Seguridad**: Si `civiles > cloros` en el refugio, se aplica una reducción extra (-5%), totalizando -15%.

## Variables de Estado Relevantes

- `State.isNight` (bool): Bloquea el avance del día hasta resolver la noche.
- `State.nightPurgePerformed` (bool): Impide realizar más de una purga por noche.
- `State.lastNight` (obj): Almacena el resultado (`victims`, `message`) para mostrarlo en el log al día siguiente.

## Eventos de Abandono
Durante la noche, algunos NPCs pueden decidir irse por su cuenta (`departedNPCs`), especialmente si la paranoia es alta o el refugio está superpoblado. Esto se notifica en el log al iniciar el siguiente día.
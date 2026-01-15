# Persistencia y Estado Global

Este documento explica cómo *Piel de Cloro* mantiene la continuidad entre partidas y cómo se gestiona la "verdad única" durante la ejecución.

## 🧬 El Objeto `State.js`

A diferencia de otros gestores que son clases instanciables, `State` es un objeto literal exportado que actúa como un bus de datos centralizado.

### Propiedades Críticas
- **`currentNPC`**: Referencia al objeto `NPC` que está siendo procesado actualmente.
- **`admittedNPCs`**: Array de sobrevivientes actuales.
- **`dialogueFlags`**: Diccionario de decisiones tomadas (ej: `{'found_letter': true}`).
- **`gameLog`**: Historial de eventos del ciclo actual.

---

## 💾 Persistencia Local (`localStorage`)

El juego guarda datos permanentes que no se borran al reiniciar o morir (`State.reset()`).

### Datos Persistentes
1. **`unlockedEndings`**: Un array de IDs de finales alcanzados. Se utiliza para mostrar el progreso en la pantalla de estadísticas globales.
2. **`audioSettings`**: Preferencias de volumen y silencio (master, ambient, lore, sfx).

### Ciclo de Vida de los Datos
- **Carga**: Al inicio (`Game.js`), se llama a `State.loadPersistentData()`.
- **Guardado**: Cada vez que se desbloquea un final o se cambia el volumen, se llama a `State.savePersistentData()`.
- **Reset**: Al morir o empezar nueva partida, `State.reset()` limpia los datos de la run (suministros, NPCs, paranoia) pero **mantiene** los persistentes.

---

## 📡 Comunicación entre Módulos

El `State` utiliza **CustomEvents** nativos para notificar cambios a la interfaz sin crear dependencias circulares:

| Evento | Origen | Suscriptor Principal |
| :--- | :--- | :--- |
| `paranoia-updated` | `State.updateParanoia()` | `UIManager.js` |
| `sanity-updated` | `State.updateSanity()` | `UIManager.js` |
| `log-added` | `State.addLogEntry()` | `UIManager.js` (Bitácora) |
| `supplies-updated` | `State.updateSupplies()` | `UIManager.js` (HUD) |

---

## 🛠️ Notas para Desarrolladores

### Modificar Configuraciones
Las constantes de balanceo se encuentran en `State.config`. Cambiar estos valores afecta directamente a la dificultad sin necesidad de tocar la lógica de los gestores:
- `dayLength`: Cuántos sujetos pasan por día.
- `maxShelterCapacity`: Límite de sobrevivientes.
- `failureChance`: Probabilidades de fallo del generador por modo.

### Debug Mode
`State.debug = true` habilita logs extendidos en la consola del navegador, permitiendo rastrear cambios en el estado interno durante el desarrollo.

# Sistema de Rasgos y Suministros

Este sistema añade una capa de gestión estratégica al juego, obligando al jugador a considerar no solo la infección, sino también la utilidad de cada superviviente para la comunidad del refugio.

## 🛠️ Implementación Mecánica

### Rasgos (Traits)
Cada NPC tiene un rasgo asignado al ser generado. Los rasgos se definen en `NPC.pickTrait()` y tienen un impacto directo en la fase nocturna.

| ID | Nombre | Descripción | Efecto Mecánico |
| :--- | :--- | :--- | :--- |
| `scavenger` | Recolector | Encuentra suministros extra. | 40% de probabilidad de encontrar +1-5 suministros. |
| `optimist` | Optimista | Mejora el ambiente. | -10 de Paranoia cada noche (vía `State.updateParanoia`). |
| `paranoid` | Paranoico | Siembra la duda. | +5 de Paranoia cada noche. |
| `sickly` | Enfermizo | Requiere más recursos. | Consume 2 suministros en lugar de 1. |
| `tough` | Resistente | Difícil de eliminar. | Prioridad baja en el array de víctimas de `GameMechanicsManager.sleep`. |
| `none` | Ninguno | Sin rasgos especiales. | Consumo estándar (1). |

### Suministros (Supplies)
Representan la comida, agua y medicinas del refugio.
- **Inicio**: El jugador comienza con 15 unidades (definido en `State.config.initialSupplies`).
- **HUD**: Se visualiza en la parte superior derecha. Si los suministros son <= 2, el contador parpadea en rojo (`UIManager.js`).
- **Inanición**: Si los suministros llegan a 0, hay un 10% de probabilidad de muerte de un civil aleatorio por noche.

## 💻 Implementación a Nivel de Código

### 1. Generación (`js/NPC.js`)
El constructor de `NPC` llama a `pickTrait()`. Los rasgos afectan las propiedades del objeto NPC que luego son consultadas por los gestores.

### 2. Estado Global (`js/State.js`)
El estado centraliza el valor `supplies`.
- `State.updateSupplies(amount)`: Asegura que el valor nunca sea negativo y notifica a los suscriptores.

### 3. Lógica de Resolución (`js/GameMechanicsManager.js`)
El método `processNightResourcesAndTraits()` es el motor de este sistema.
- **Flujo**: Itera sobre `State.admittedNPCs` -> Calcula consumo total -> Aplica probabilidad de recolección -> Actualiza `State` -> Genera resumen para el log.

### 4. Interfaz de Usuario (`js/UIManager.js` y `js/ModalManager.js`)
- **`ModalManager.openModal`**: Muestra el rasgo del NPC en el panel de información. Utiliza los metadatos definidos en `NPC.pickTrait()`.

## 🧪 Verificación Logica
Consultar `__tests__/npc_traits_and_supplies.test.js` para ver casos de prueba sobre:
- Acumulación de consumo con múltiples NPCs `sickly`.
- Supervivencia nocturna priorizada para el rasgo `tough`.
- Feedback visual de suministros bajos.

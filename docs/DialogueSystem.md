# Sistema de Diálogos de NPCs

Este documento detalla la arquitectura de datos y la lógica de funcionamiento para los diálogos de los NPCs en *Piel de Cloro*, cruciales para la deducción y la inmersión narrativa.

## 🏛️ Arquitectura de Datos (`js/DialogueData.js`)

Se divide en dos categorías según la relevancia narrativa:

### A. Pools (Diálogos Genéricos)
Árboles reutilizables asignados a NPCs aleatorios basados en su **Personalidad** (`personality`).
- **Tags**: Se usan para emparejar el pool con los atributos del NPC (ej: `nervous`, `body_horror`).
- **Novedad**: El sistema evita repetir pools recientemente usados mediante el parámetro `freshWindow` (ajustado a 20).

### B. Lore Subjects (NPCs Únicos)
Personajes fijos como "Dr. Vargas" o "Kael". Tienen `unique: true` y diálogos inalterables que revelan la historia del cloro.

---

## ⚙️ Motor de Diálogo (`js/DialogueEngine.js`)

### Gestión de Opciones Dinámicas
El motor no solo renderiza el texto, sino que modifica las opciones del jugador en tiempo real:
- **Auto-Dismiss**: Si hay pocas opciones específicas en un nodo, se añade automáticamente el botón "Terminar Conversación". No se añade si hay 4+ opciones para no saturar la interfaz.
- **Action Buttons**: Las opciones que terminan en acciones (como Purgar o Admitir) reciben clases CSS automáticas (`horror-btn-admit`, etc.).

### Memoria y Rumores
El sistema utiliza el `State.js` para crear una sensación de mundo persistente:
1. **Flags**: Si el jugador elige una opción con la propiedad `sets: ['seen_something']`, se guarda en `State.dialogueFlags`.
2. **Memoria de Diálogo**: Cada interacción significativa se registra en `State.dialogueMemory`.
3. **Generación de Rumores**: El motor puede inyectar el placeholder `{rumor}` en los diálogos, extrayendo fragmentos de la memoria global:
   ```javascript
   // Ejemplo: "Alguien comentaba que Kael desapareció en la oscuridad."
   ```

---

## 🎨 Renderizado y Marcado (`js/markup.js`)

El texto de los diálogos soporta un marcado ligero procesado antes de mostrarse:
- `*acción*`: Se renderiza en gris/itálica para representar gestos del NPC.
- `"{nombre}"`: Inyecta el nombre dinámico del NPC.
- `"{paranoia}"`: Muestra el nivel actual de estrés del jugador.

---

## 🧩 Relación Mecánica-Código

| Acción en Juego | Implementación en Código |
| :--- | :--- |
| Seleccionar diálogo | `DialogueEngine.selectDialogueSet(params)` |
| Inyectar variables | `DialogueEngine.injectStateVariables(text)` |
| Persistencia de decisión | `State.setFlag(key, value)` |
| Evitar repetición | `State.wasDialogueUsedRecently(id, window)` |

## 🧪 Verificación
Los tests en `__tests__/advanced_dialogue.test.js` y `dialogue_uniqueness.test.js` aseguran que las flags se guarden correctamente y que los diálogos no se repitan prematuramente.

# Sistema de Diálogos de NPCs

Este documento detalla la arquitectura de datos y la lógica de funcionamiento para los diálogos de los NPCs en *Piel de Cloro*, definidos principalmente en `DialogueData.js` y procesados por `DialogueEngine.js`.

## 1. Estructura de Datos (`DialogueData.js`)

El objeto `DialogueData` es la fuente de verdad para todas las conversaciones. Se divide en dos categorías principales:

### A. Pools (Diálogos Genéricos)
Son árboles de conversación reutilizables que se asignan a NPCs aleatorios (los "entrants" diarios).

**Estructura de un Pool:**
```javascript
"gen_scratch": {
    id: 'gen_scratch',       // Identificador único del set
    tags: ['nervous', 'body_horror'], // Etiquetas para emparejar con la personalidad del NPC
    unique: false,           // false = puede asignarse a cualquier NPC genérico compatible
    root: 'gs_n1',           // ID del nodo inicial de la conversación
    nodes: { ... }           // Diccionario de todos los nodos de este árbol
}
```

### B. Lore Subjects (NPCs Únicos)
Son personajes específicos con historia fija (ej. "Kael, el fusionado con la pared").

*   Tienen `unique: true`.
*   Se seleccionan específicamente cuando el juego decide mostrar un evento de Lore o un NPC especial.

---

## 2. Estructura de los Nodos

Cada conversación es un grafo de nodos. Un nodo representa un momento específico donde el NPC habla o actúa y el jugador puede responder.

**Propiedades del Nodo:**

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | String | Identificador único del nodo (ej. `gs_n1`). |
| `text` | String | El contenido narrativo. Soporta marcado especial (ver abajo). |
| `options` | Array | Lista de opciones de respuesta para el jugador. |
| `audio` | String | (Opcional) Clave del SFX que suena al mostrar este nodo. |

**Propiedades de una Opción (`options`):**

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | String | ID de la opción. |
| `label` | String | Texto que aparece en el botón para el jugador. |
| `next` | String/Null | ID del siguiente nodo. Si es `null`, el diálogo termina. |
| `sets` | Array | (Opcional) Lista de *flags* que se activan en el `State` al elegir esto (ej. `['admitted']`). |
| `resultText`| String | (Opcional) Texto que se muestra si el diálogo termina aquí (ej. descripción de huida). |
| `cssClass` | String | (Opcional) Clases CSS para estilizar el botón (ej. `horror-btn-dismiss`). |

---

## 3. Lógica de Selección (`DialogueEngine.js`)

Cuando se crea un NPC en `NPC.js`, se llama a `selectDialogueSet` para asignarle una conversación. El proceso es:

1.  **Verificación de Lore**: Si el NPC está marcado como `isLore`, busca en `loreSubjects`.
2.  **Filtrado por Personalidad**: Si es genérico, el motor busca en `pools` aquellos que tengan `tags` coincidentes con la personalidad del NPC (ej. `nervous`, `aggressive`).
3.  **Prioridad de Novedad**: El sistema prefiere pools que no hayan sido usados recientemente (`State.isDialogueUsed`) para evitar repetición.
4.  **Fallback**: Si no hay coincidencias específicas, usa pools con el tag `generic`.

---

## 4. Sistema de Marcado y Renderizado

El `UIManager` procesa el texto de los nodos para darle formato visual:

### Formato de Texto
*   **Acciones**: El texto entre asteriscos `*se rasca el brazo*` se renderiza con estilo descriptivo (cursiva/gris).
*   **Diálogo**: El texto entre comillas `"hola"` se renderiza como habla directa del personaje.

### Templating (Variables Dinámicas)
El `DialogueEngine` puede inyectar valores del estado del juego en el texto antes de enviarlo a la UI:

*   `{npcName}`: Inserta el nombre del NPC actual.
*   `{paranoia}`: Inserta el nivel de paranoia actual con %.
*   `{generatorStatus}`: Inserta "estable", "inestable" o "apagado".
*   `{rumor}`: Inserta un rumor aleatorio de la memoria global (si existe).

---

## 5. Ejemplo de Flujo

**Definición en JSON:**
```javascript
'node_1': {
    text: "*Tiembla.* \"¿Escuchas eso?\"",
    options: [
        { label: 'Sí', next: 'node_2' },
        { label: 'No', next: 'node_3' }
    ]
}
```

**Proceso:**
1.  El jugador ve: *Tiembla.* "¿Escuchas eso?"
2.  El jugador hace clic en "Sí".
3.  `DialogueEngine` busca `node_2`.
4.  Si `node_2` existe, se actualiza la caja de texto.
5.  Si la opción tuviera `sets: ['suspicious']`, esa flag se guardaría en el estado global.

## 6. Notas de Diseño
*   **Infección**: Aunque el RNG decide si un NPC está infectado (`isInfected: true`), es el diálogo (asignado vía tags como `body_horror` o `sick`) el que da las pistas narrativas al jugador.
*   **Consistencia**: Es vital que los pools con tags de "enfermo" o "horror corporal" se asignen preferentemente a NPCs que visualmente o mecánicamente presenten anomalías, aunque actualmente el sistema permite cierta aleatoriedad para aumentar la paranoia (un NPC sano podría tener un diálogo extraño por simple locura).

# Documentación del Módulo: Morgue

## Descripción General
El módulo de **Morgue** actúa como el registro de auditoría para los NPCs eliminados ("purgados") del refugio. Su función principal es almacenar el historial de decisiones letales tomadas por el jugador, permitiendo revelar al final de la partida (o durante la fase de morgue) si las eliminaciones fueron justificadas (Infectados) o errores (Civiles).

## 1. Estructura de Interfaz (`index.html`)

### Pantalla Principal (`#screen-morgue`)
*   **Visibilidad**: Oculta por defecto (`hidden`). Se activa mediante el botón de navegación `#nav-morgue` en el sidebar.
*   **Header**: Contiene el título "REGISTRO DE PURGAS".
*   **Grid de Visualización (`#morgue-grid`)**:
    *   Contenedor dinámico donde se inyectan las "tarjetas" visuales de los NPCs purgados.
    *   **Clases CSS**: `grid`, `grid-cols-[repeat(auto-fill,minmax(120px,1fr))]`, `custom-scroll`.
    *   **Propósito**: Renderizar una vista compacta de cada sujeto eliminado.

### Disparadores de Acción (Triggers)
*   **Botón de Purga (`#btn-modal-purge`)**:
    *   **Ubicación**: Dentro del modal de detalles del NPC (`#modal-npc`).
    *   **Estilo**: `horror-btn-alert` (Rojo/Alerta).
    *   **Mecánica**: Es el único punto de entrada para enviar un NPC a la morgue. Al hacer clic, el NPC activo se transfiere del estado "Refugio" al estado "Morgue".

### Estadísticas Relacionadas (`#screen-final-stats`)
Elementos del DOM que consumen datos de la morgue al finalizar la partida:
*   `#final-stat-purged`: Conteo total de sujetos en la morgue.
*   `#final-stat-deaths`: Conteo de civiles inocentes purgados (Error).
*   `#final-stat-infected`: Conteo de infectados correctamente purgados (Acierto).

## 2. Modelo de Datos (`js/NPC.js`)

La clase `NPC` provee las propiedades fundamentales que determinan la lógica de la Morgue.

### Propiedades Críticas

| Propiedad | Tipo | Descripción | Función en Morgue |
|-----------|------|-------------|-------------------|
| `isInfected` | `Boolean` | Estado real de infección. | **Determinante de Éxito**. Si es `true`, la purga fue correcta. Si es `false`, cuenta como baja civil. |
| `visualFeatures` | `Object` | Datos visuales (piel, pelo, etc). | Permite reconstruir el avatar del NPC dentro de `#morgue-grid` post-mortem. |
| `name` | `String` | Nombre generado. | Identificación en el registro. |
| `attributes` | `Object` | Signos vitales (temp, pulso). | Pueden mostrarse en la tarjeta de la morgue como datos de autopsia. |

### Métodos Relevantes
*   **`getEpithet()`**: Genera descripciones como "Se lo ve con la piel pálida". En la morgue, esto sirve como contexto de por qué el jugador pudo haber sospechado.
*   **`getDisplayName()`**: Combina el nombre con el epíteto, útil para el listado final.

## 3. Mecánicas y Flujo de Datos

### Ciclo de Purga
1.  **Inspección**: El jugador analiza al NPC en `#screen-game` o `#screen-shelter`.
2.  **Decisión**: El jugador abre el modal (`#modal-npc`) y presiona "PURGAR DEL REFUGIO" (`#btn-modal-purge`).
3.  **Transición de Estado**:
    *   El objeto `NPC` es removido del array de habitantes.
    *   El objeto `NPC` es añadido al array de la morgue.
    *   Se actualiza el contador de ocupación (`#shelter-count`).
4.  **Renderizado**:
    *   Se crea un elemento en `#morgue-grid`.
    *   **Revelación**: A diferencia de la vista en vida, la vista de morgue suele revelar explícitamente el estado `isInfected` (ej. mediante un borde rojo o verde) para dar feedback al jugador.

### Validación de Final de Juego
Al terminar el turno (o la partida), el sistema recorre el array de la morgue:
```javascript
// Pseudocódigo de lógica implicada
let infectedKilled = morgueArray.filter(npc => npc.isInfected).length;
let civiliansKilled = morgueArray.filter(npc => !npc.isInfected).length;
```
Estos valores se inyectan en `#screen-final-stats`.

## 4. Notas de Implementación
*   **Persistencia**: Los NPCs en la morgue deben conservar sus `visualFeatures` intactas para que el avatar coincida con el que el jugador vio en vida.
*   **Irreversibilidad**: Una vez en la morgue, un NPC no puede volver al refugio.
*   **Capacidad**: Aunque el refugio tiene límite (`#shelter-count`), la morgue es teóricamente ilimitada (o limitada solo por la duración del juego), representada por el scroll en `#morgue-grid`.
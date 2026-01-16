# Reporte de Escalabilidad y Núcleo Técnico

Este documento analiza la estructura actual del juego para identificar cuellos de botella y proponer una hoja de ruta para futuras expansiones (nuevas salas, mecánicas de mudanza, etc.).

## 🔍 Análisis de la Estructura Actual

### 1. Gestión de Habitaciones (IDs y Navegación)
**Estado Actual**: La navegación está basada en un `switch` centralizado en `GameEventManager.js` (`navigateToRoomByKey`) que mapea llaves a métodos específicos.
- **Riesgo**: Añadir una 10ª habitación requiere modificar el núcleo de navegación, añadir HTML estático y crear métodos dedicados en múltiples clases.
- **Impacto**: Difícil de escalar si se planean muchas salas o variaciones de refugio.

### 2. Sectores y Asignaciones
**Estado Actual**: Los sectores (`security`, `generator`, `supplies`) están cableados en la lógica de sabotajes (`triggerSabotage`) y resoluciones nocturnas.
- **Riesgo**: La lógica de qué hace un sector está "enterrada" en el `GameMechanicsManager.js`.
- **Impacto**: No se pueden añadir sectores con comportamientos únicos sin tocar el código base de mecánicas.

### 3. El Concepto de "Refugio"
**Estado Actual**: El refugio es implícitamente el conjunto total de todas las secciones en `index.html`. No existe un objeto `Shelter` que defina qué salas están disponibles.
- **Riesgo**: Para "mudarse" a un refugio con menos salas o salas diferentes, habría que ocultar/mostrar elementos de forma manual y compleja.

---

## 🚀 Recomendaciones de Futuro

### 1. Registro Dinámico de Habitaciones
Implementar un `RoomRegistry` donde cada habitación se registre con:
- `key`: Identificador único.
- `renderFn`: Callback para dibujar/actualizar la sala.
- `requirements`: Energía mínima, personal mínimo, etc.
*Esto permitiría que la navegación sea puramente basada en datos.*

### 2. Descriptores de Refugio (Shelter Templates)
Crear estructuras de datos que definan un refugio:
```javascript
const ShelterAlpha = {
    id: 'bunker_01',
    maxCapacity: 10,
    rooms: ['generator', 'security', 'morgue', 'meditation'],
    baseConsumption: 10
};
```
*Facilitaría enormemente la mecánica de "Mudanza de Refugio" o "Upgrades de Sala".*

### 3. Sectores Basados en Comportamiento
Migrar los sabotajes y beneficios de sectores a un sistema de *Hooks*:
- `onNightResolve()`: Qué aporta este sector al final del ciclo.
- `onSabotage()`: Qué ocurre si hay un infectado asignado.
*Permitiría crear salas como "Laboratorio Químico" o "Invernadero" simplemente definiendo sus hooks.*

### 4. Componentización UI (Stats & HUD)
Continuar la migración a `BaseComponent.js` (como ya hicimos con las estadísticas espejadas). Esto evita colisiones de IDs y permite que la interfaz sea reactiva a los cambios en el `State` de forma automática.

---

## 💡 Ideas de Expansión
- **Restricción de Salas**: Algunas salas podrían requerir un "item de desbloqueo" o un nivel de energía específico del generador.
- **Transferencia de Estado**: Al pasar la noche o mudarse, el `State` debería persistir solo los NPCs y suministros, regenerando la "capas de seguridad" del nuevo entorno.

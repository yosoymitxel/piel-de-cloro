# Auditoría de Sistemas y Roadmap de Recuperación

## Resumen de Situación
Tras la implementación de la Fase 4 (Arquitectura Escalable) y los cambios recientes en el sistema de mapas y UI, se han identificado varios sistemas que han quedado obsoletos, sobreescritos o desconectados. Este documento sirve como guía para su recuperación y reintegración.

## Directorios Auditados

### 1. `docs/` (Documentación)
Archivos que describen sistemas que podrían no estar reflejados en el código actual:
- **SabotageLogic.md**: Lógica de sabotaje de NPCs. Verificar si `NPC.js` o `GameMechanicsManager.js` implementan esto.
- **PlayerPsychosis.md**: Sistema de psicosis del jugador. Verificar integración con `UIManager.js` (alucinaciones).
- **ParanoiaSanity.md**: Reglas de cálculo de paranoia/cordura.
- **InspectionSystem.md**: Sistema de inspección (herramientas).
- **GeneratorSystem.md** / **Generador.md**: Verificar si la lógica de consumo/combustible coincide con la implementación actual en `GeneratorManager.js`.

### 2. `js/` (Código Fuente)
Sistemas críticos que requieren revisión:
- **UIManager.js**:
  - `renderBlueprint`: Actualmente usa flexbox, rompiendo la verticalidad del mapa. Debe migrarse a CSS Grid.
  - `renderPinnedRooms`: Funcionalidad de pines laterales. El código existe pero los datos (`State.pinnedRooms`) podrían estar perdiéndose o no inicializándose.
- **ShelterModel.js**: Define la estructura `grid` (x,y) que no se está aprovechando visualmente.
- **State.js**: Verificar inicialización de `pinnedRooms` y `mapLayout`.

### 3. `__tests__/` (Tests Unitarios)
Tests que podrían estar fallando o ser irrelevantes tras los cambios:
- **ui_advanced_features.test.js**: Fallaba por métodos faltantes en mocks (`line.remove`).
- **game_mechanics.test.js**: Requería ajustes en traits de NPCs para pasar.

## Roadmap de Recuperación

### Prioridad Alta (Inmediato)
1. **Sistema de Mapas (Verticalidad)**
   - **Estado**: Roto (Lista horizontal).
   - **Acción**: Refactorizar `UIManager.renderBlueprint` para usar CSS Grid basado en las coordenadas `x,y` del `ShelterModel`.
   - **Meta**: Restaurar la sensación de "casa interactiva".

2. **Salas Pineadas (Navegación Rápida)**
   - **Estado**: Datos perdidos.
   - **Acción**: Restaurar configuración por defecto en `State.js`: `['generator', 'shelter', 'room']`. Asegurar persistencia.

### Prioridad Media
3. **Validación de Sistemas de Juego**
   - Verificar que la lógica de **Sabotaje** y **Psicosis** documentada esté activa en el código.
   - Reconectar herramientas de inspección si quedaron desconectadas de la UI.

### Prioridad Baja
4. **Limpieza**
   - Archivar documentación obsoleta o actualizarla a la v2.0.
   - Eliminar archivos de tests redundantes o actualizarlos a la nueva arquitectura.

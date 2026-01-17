# Arquitectura Técnica: UI & Componentización

Este documento detalla el sistema de interfaz de usuario (UI) implementado en **Piel de Cloro**, centrado en la mantenibilidad y la sincronización de estado en tiempo real.

## 1. Sistema de Mirroring (HUD Espejado)

Para permitir que estadísticas como la Paranoia o la Cordura se muestren en múltiples pantallas (ej. Puesto de Control y Sala de Meditación), hemos migrado de un sistema basado en IDs a uno basado en selectores flexibles.

### BaseComponent.js
La clase base de todos los componentes UI ahora soporta selectores CSS complejos en lugar de strings de ID simples.
```javascript
// Antes: constructor(containerId) -> $('#' + containerId)
// Ahora: constructor(selector) -> $(selector)
```

### Sincronización en Tiempo Real
Cuando el estado global (`State.js`) cambia, el `UIManager` dispara el método `update()` en todas las instancias de componentes vinculadas a esa clase CSS. Esto garantiza que si recuperas cordura en meditación, el contador en el HUD principal también se actualice instantáneamente.

---

## 2. Pinned Navigation (Sidebar)

El sistema de barra lateral permite "anclar" salas específicas.
- **Implementación**: `UIManager.renderPinnedRooms(state)` recorre una lista de IDs de salas permitidas.
- **Estilos**: Ubicados en `css/NewFeatures.css`, utilizan variables CSS para mantener la consistencia con los botones de navegación estándar.
- **Indicadores de Estado**: Los pines utilizan el `border-left-color` y animaciones de `pulse` para informar sobre alertas en salas que no están visibles actualmente.

---

## 3. Gestión de Eventos y Navegación

### GameEventManager.js
Actúa como un router centralizado.
- **Navegación Forzada**: El método `navigateToMap({ force: true })` permite que eventos automáticos (como el fin de una expedición) sobrepasen bloqueos de navegación manual (`navLocked`).
- **Render Hooks**: Cada transición de pantalla permite inyectar una `renderFn` para actualizar el DOM específico de esa sala antes de mostrarla.

---

## 4. Renderizado Dinámico de NPCs (AvatarRenderer)

Los avatares se generan mediante `AvatarRenderer.render()`.
- **Efectos de Glitch**: El sistema aplica clases de CSS basadas en el estado de Paranoia del jugador, distorsionando la imagen del NPC en tiempo real.
- **Modularidad**: El `UIManager` posee un wrapper `renderAvatar()` que simplifica la creación de avatares con diferentes tamaños (`sm`, `lg`) y modificadores (`perimeter`, `normal`).

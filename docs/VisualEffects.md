# Efectos Visuales Reactivos

La interfaz de *Piel de Cloro* es dinámica y reacciona al estado psicológico del jugador y a la estabilidad del refugio.

## 👁️ Estados de Alteración Visual

Los efectos se aplican en cascada sobre el `body` o contenedores específicos mediante `UIManager.js`.

### 1. Paranoia (Verde Cloro)
A medida que `State.paranoia` aumenta, el sistema aplica:
- **Viñeta Perimetral**: Un resplandor verde que se cierra sobre el centro de la pantalla.
- **Flicker (Parpadeo)**: Aumenta la probabilidad de que los textos y el logo de RUTA-01 parpadeen.
- **Color de Interfaz**: Los tonos verdes de Tailwind se desplazan hacia el ámbar/naranja.

### 2. Cordura / Sanity (Desviación Cromática)
Cuando `State.sanity` cae por debajo del 50%:
- **Hue Rotate**: Los colores de la pantalla comienzan a rotar lentamente, creando una sensación de náusea visual.
- **Blur Dinámico**: Se aplica un desenfoque ligero (`filter: blur`) que pulsa con el ritmo cardíaco.
- **Saturación**: La pantalla pierde color, volviéndose cinemática y grisácea cerca del 0%.

### 3. VHS / Glitch (Eventos Críticos)
Se activa durante finales, muertes o reinicios del generador:
- **VHSEffect**: Una combinación de líneas de escaneo, aberración cromática y desplazamiento de líneas.
- **Glitch Burst**: Un fogonazo de ruido visual que dura entre 500ms y 2000ms.

## 💻 Implementación en Código

### Escuchas de Eventos (`js/State.js` -> `js/UIManager.js`)
El `State` emite eventos que el `UIManager` captura para actualizar el DOM:

```javascript
// En State.js
document.dispatchEvent(new CustomEvent('paranoia-updated', { detail: { value: this.paranoia } }));

// En UIManager.js
document.addEventListener('paranoia-updated', (e) => {
    this.updateParanoiaVisuals(e.detail.value);
});
```

### Clases CSS Dinámicas
El sistema utiliza clases aplicadas al elemento raíz para activar efectos vía CSS (Vanilla CSS):
- `.is-low-sanity`: Activa animaciones de pulsación de blur.
- `.is-high-paranoia`: Intensifica la viñeta y el ruido.
- `.glitch-mode`: Fuerza el desplazamiento de capas RGB.

## 📏 Sistema de Escalado de UI
El `UIManager` también gestiona el zoom de la terminal (`Small`, `Normal`, `Large`, `Full`) modificando la variable CSS `--ui-scale`. Esto asegura que el arte ASCII y las cards de los NPCs se vean correctamente en cualquier resolución sin perder la estética retro.

---

## 🎨 Paleta de Colores Técnica
Los colores están centralizados en `State.colors` para asegurar consistencia entre el dibujo de los Avatares y el HUD:
- `chlorine`: `#2d5a27` (Color base)
- `alert`: `#ff3333` (Fallo crítico)
- `energy`: `#00FF00` (Generador estable)

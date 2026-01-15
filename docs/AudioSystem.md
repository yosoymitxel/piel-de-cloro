# Sistema de Audio y Ducking

El sistema de audio de *Ruta 01* utiliza una arquitectura de canales para gestionar la atmósfera, la narrativa y el feedback inmediato.

## 🎧 Arquitectura de Canales

El `AudioManager.js` organiza el sonido en tres canales principales, cada uno con su propio nivel de volumen y comportamiento:

| Canal | Propósito | Comportamiento |
| :--- | :--- | :--- |
| **`ambient`** | Música de fondo y ambiente. | Siempre en bucle. Soporta *ducking*. |
| **`lore`** | Pistas narrativas y finales. | Prioridad alta. Silencia o atenúa el ambiente. |
| **`sfx`** | Efectos de interfaz y acciones. | Ejecución única o bucles cortos. Usa un sistema de *pool*. |

## 🦆 Lógica de Ducking (Atenuación)

Para asegurar que los diálogos de lore y eventos narrativos sean audibles, el sistema implementa un "pato" (ducking):

1. **Activación**: Al llamar a `playLoreByKey`, el sistema activa `duckAmbient(target, ms)`.
2. **Efecto**: El volumen del canal `ambient` baja suavemente (ej. de 0.3 a 0.05) durante un periodo de transición (crossfade).
3. **Restauración**: Al cerrar la pantalla de lore, `unduckAmbient()` devuelve el ambiente a su volumen original.

## 🔒 Sistema de Prioridad y Bloqueo de SFX

Para evitar el "ruido de ametralladora" (solapamiento excesivo de sonidos), el método `playSFX` utiliza:

- **Priority**: Los sonidos con mayor prioridad (ej: Alarmas) pueden interrumpir a los de baja prioridad.
- **LockMs**: Al reproducirse un SFX, se activa un bloqueo temporal (`sfxLockUntil`). Cualquier sonido con menor prioridad que intente sonar durante ese tiempo será descartado.
- **Pool de Canales**: El sistema mantiene hasta 10 objetos `Audio` en memoria para permitir solapamientos controlados (ej: pasos + ambiente).

## 🛠️ Implementación Técnica

### Ejemplo de Reproducción de Lore
```javascript
// En LoreManager.js
this.audio.playLoreByKey('lore_track', { 
    loop: true, 
    volume: 0.25, 
    duckAmbient: true 
});
```

### Gestión de Volumen Master
El volumen maestro (`State.audioSettings.master`) se aplica como un multiplicador sobre el volumen relativo de cada canal, asegurando que el equilibrio (mix) se mantenga incluso si el usuario baja el volumen general.

## 🧪 Pruebas
El archivo `__tests__/audio_system.test.js` verifica que:
- El ducking se aplique correctamente al iniciar pistas de lore.
- Los canales silenciados (muted) no produzcan sonido.
- El pool de SFX gestione correctamente la reutilización de objetos.

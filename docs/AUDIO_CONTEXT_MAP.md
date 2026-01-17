# Mapa de Contexto de Audio y Auditoría

Este documento detalla los archivos de audio requeridos por el sistema, su contexto de uso dentro de la aplicación, y palabras clave para facilitar la búsqueda de assets adecuados.

## Estado de Auditoría
- **Total Archivos Listados**: 40
- **Estado**: Todos los archivos listados en el manifiesto tienen puntos de inyección lógica en el código (UI, Eventos, Mecánicas).

## Lista Detallada de Audios

### Ambientales (Bucles)
| Archivo | Contexto de Uso | Palabras Clave (Keywords) |
| :--- | :--- | :--- |
| `ambient_main_loop.mp3` | Fondo sonoro principal durante el día (Guard Post). | *dark ambient drone, industrial hum, ventilation, low frequency, bunker atmosphere* |
| `ambient_night_loop.mp3` | Fondo sonoro durante la fase nocturna (Night Screen). | *quiet horror, distant wind, settling metal, isolation, silence with texture* |
| `ambient_tense_loop.mp3` | Fondo para momentos de alta tensión (Sobrecarga, Intrusión). | *heartbeat, rising tension, metallic stress, high pitch drone, danger alarm* |

### Narrativa y Lore (Tracks)
| Archivo | Contexto de Uso | Palabras Clave (Keywords) |
| :--- | :--- | :--- |
| `lore_intro_track.mp3` | Pantalla de título o introducción inicial. | *cinematic intro, mystery, retro synth, dystopia, slow build* |
| `lore_interlude_radio.mp3` | Eventos de radio o transmisiones entrantes. | *static radio tuning, morse code, distorted voice, frequency shift* |
| `lore_interlude_seen.mp3` | Al descubrir un infectado visualmente. | *shock stinger, horror reveal, violin screech, sudden impact* |
| `lore_interlude_heard.mp3` | Al escuchar algo sospechoso (mecánica de escucha). | *whisper, subtle movement, cloth rustle, breath* |
| `lore_final_clean.mp3` | Música para el final "Limpio/Éxito". | *relief, ambient pad, sunrise, hopeful but melancholic* |
| `lore_final_corrupted.mp3` | Música para el final "Corrupto/Fallo". | *distorted drone, collapsing structure, tragic, dark ending* |
| `lore_night_civil_death.mp3` | Evento de muerte de un civil durante la noche. | *flatline, somber bell, deep impact, life lost* |
| `lore_night_player_death.mp3` | Muerte del jugador (Game Over). | *glitch crash, system failure, harsh noise, fade to black* |
| `lore_night_tranquil.mp3` | Noche sin incidentes. | *soft chime, safe haven, calm night, rest* |

### Interfaz de Usuario (UI SFX)
| Archivo | Contexto de Uso | Palabras Clave (Keywords) |
| :--- | :--- | :--- |
| `ui_button_click.mp3` | Interacción estándar con botones. | *mechanical switch, retro keyboard, terminal click, blip* |
| `ui_modal_open.mp3` | Apertura de ventanas modales. | *hologram open, slide whistle, futuristic swipe, pop up* |
| `ui_modal_close.mp3` | Cierre de ventanas modales. | *hologram close, reverse swipe, suction* |
| `ui_dialogue_type.mp3` | Efecto de tipeo texto a texto. | *typewriter, digital text, data stream, blip loop* |
| `stats_panel_open.mp3` | Apertura del panel de estadísticas/final. | *heavy slide, metal door, hydraulic open, data processing* |
| `validation_gate_open.mp3` | Desbloqueo de botones tras validación. | *access granted, lock release, pneumatic open* |
| `preclose_overlay_open.mp3` | Overlay de cierre de día. | *transition whoosh, dark curtain, slide* |

### Herramientas de Inspección
| Archivo | Contexto de Uso | Palabras Clave (Keywords) |
| :--- | :--- | :--- |
| `tool_thermometer_beep.mp3` | Escaneo térmico exitoso. | *medical beep, digital scan, thermometer read* |
| `tool_uv_toggle.mp3` | Encendido/Apagado de luz UV. | *light switch, neon hum, electrical zap, bulb flicker* |
| `tool_pulse_beep.mp3` | Detector de pulso/ritmo cardíaco. | *sonar ping, ecg beep, radar blip* |
| `tool_pupils_lens.mp3` | Zoom o enfoque en pupilas. | *camera shutter, lens focus, servo motor, robot eye* |

### Sistemas de Seguridad y Entorno
| Archivo | Contexto de Uso | Palabras Clave (Keywords) |
| :--- | :--- | :--- |
| `alarm_activate.mp3` | Activación de alarma en Sala de Vigilancia. | *klaxon, siren, warning beep, emergency alert* |
| `alarm_deactivate.mp3` | Desactivación de alarma. | *system power down, electronic chirp, confirm tone* |
| `intrusion_detected.mp3` | Alerta crítica de intrusión. | *red alert, breach warning, loud buzzer, siren wail* |
| `door_secure.mp3` | Bloqueo de puerta (Sala Vigilancia). | *heavy latch, metal lock, deadbolt, hydraulic lock* |
| `door_unsecure.mp3` | Desbloqueo de puerta. | *latch release, metal slide, air release* |
| `window_secure.mp3` | Bloqueo de ventana/persiana. | *shutters closing, metal rolling, clamp* |
| `window_unsecure.mp3` | Desbloqueo de ventana. | *shutters opening, metal squeak* |
| `pipes_whisper.mp3` | Sonido en tuberías (Sala Vigilancia). | *water hammer, steam hiss, metallic groan, liquid flow* |

### Eventos Críticos y FX
| Archivo | Contexto de Uso | Palabras Clave (Keywords) |
| :--- | :--- | :--- |
| `purge_confirm.mp3` | Confirmación de purga (eliminación de sujeto). | *gunshot, incinerator, heavy stamp, execution* |
| `purge_blood_flash.mp3` | Efecto visual de sangre tras purga. | *liquid splatter, gore impact, wet thud* |
| `night_transition.mp3` | Transición de día a noche. | *deep boom, time lapse, bell toll, darkening* |
| `sleep_begin.mp3` | Inicio de la secuencia de sueño. | *hypnotic spiral, fade out, slow heartbeat, dream entry* |
| `escape_attempt.mp3` | Intento de fuga de un NPC. | *running footsteps, metal banging, alarm muffled, struggle* |
| `dayafter_test_apply.mp3` | Aplicación de test en "Day After". | *stamp, paper shuffle, digital process, confirm* |
| `glitch_burst.mp3` | Efecto de error visual/glitch. | *digital distortion, static burst, datamosh, noise* |
| `vhs_flicker.mp3` | Parpadeo constante estilo VHS. | *tape hiss, magnetic noise, 50hz hum, static crackle* |
| `morgue_reveal_infected.mp3` | Revelación post-mortem de infectado. | *parasite squelch, alien screech, horror sting, mutation* |

## Recomendaciones de Implementación
1. **Prioridad de Carga**: Asegurar que `ui_button_click`, `ambient_main_loop` y `glitch_burst` se carguen primero.
2. **Variaciones**: Para sonidos repetitivos como `ui_dialogue_type`, considerar usar variaciones de pitch programáticas para evitar fatiga auditiva.
3. **Volumen**: Los loops ambientales deben estar normalizados a -15dB o -20dB respecto a los SFX de UI para no interferir.

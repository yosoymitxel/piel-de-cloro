# Documentación de Finales - Ruta 01

Este documento detalla los finales disponibles en el juego, sus condiciones de activación y su impacto narrativo.

## Sistema de Finales Centralizado

Todos los finales se gestionan a través del método `triggerEnding(endingId)` en `Game.js`, asegurando una presentación consistente que incluye efectos de sonido, música de lore y la pantalla de estadísticas finales.

---

## 1. Finales de Escape (Activos)
Se activan al pulsar el botón **"Escapar"** durante la fase nocturna.

### **Salida Limpia (`final_clean`)**
- **Condición**: Escapar con al menos 2 refugiados y **0 infectados** en el refugio.
- **Lore**: Has contenido la amenaza y salvado vidas humanas. El mundo exterior es seguro por ahora.
- **Tipo**: Calma (Verde).

### **Cura Sintetizada (`final_cure`)**
- **Condición**: Completar el análisis de laboratorio de 5 sujetos infectados distintos, conservar las 5 muestras viables y escapar con el refugio sin infectados.
- **Progreso**: Cada análisis positivo completado al avanzar el día registra una sola muestra por sujeto. El progreso persiste aunque ese sujeto sea purgado después.
- **Lore**: El laboratorio decodifica la secuencia del parásito; el final de cura tiene prioridad sobre la salida limpia cuando se cumplen los requisitos.
- **Tipo**: Salvación.

### **Salida Contaminada (`final_corrupted`)**
- **Condición**: Escapar con al menos 2 refugiados, pero al menos **uno de ellos está infectado**.
- **Lore**: La plaga llega al mundo exterior. Tu victoria es el inicio del fin para la humanidad.
- **Tipo**: Peligro (Rojo).

### **Paciente Cero (`final_player_infected_escape`)**
- **Condición**: El jugador está infectado al momento de escapar.
- **Lore**: No escapaste para salvarte, sino para expandir el cloro. Tú eres la zona cero.
- **Tipo**: Peligro (Rojo).

### **Refugio Tomado (`final_death_all_infected`)**
- **Condición**: Escapar cuando **todos** los refugiados admitidos están infectados.
- **Lore**: Al abrir la compuerta, no hay huida, solo asimilación.
- **Tipo**: Peligro (Rojo).

---

## 2. Finales de Supervivencia (Pasivos/Derrota)
Se activan automáticamente cuando se cumplen ciertas condiciones críticas.

### **Colapso Mental (`final_death_paranoia`)**
- **Condición**: La paranoia alcanza el **100%**.
- **Lore**: Tu mente se quiebra ante la incertidumbre y el horror. Moriste gritando nombres que nadie conoce.
- **Tipo**: Peligro (Rojo).

### **Oscuridad Eterna (`final_generator_off`)**
- **Condición**: Intentar escapar o pasar la noche con el **generador apagado** (sin combustible o averiado).
- **Lore**: Las puertas hidráulicas no se abren. El refugio es ahora tu sarcófago.
- **Tipo**: Peligro (Rojo).

### **Soledad Terminal (`final_death_alone`)**
- **Condición**: Intentar escapar solo o con un solo refugiado (probabilidad alta de muerte).
- **Lore**: Los túneles son demasiado peligrosos para uno solo. El silencio te consume.
- **Tipo**: Peligro (Rojo).

### **Incumplimiento de Deber (`final_abandonment`)**
- **Condición**: Ignorar a **15 o más** sujetos.
- **Lore**: El mando central te considera incompetente y bloquea el refugio. Has sido descartado.
- **Tipo**: Peligro (Rojo).

---

## 3. Finales de Guardia (Noche)

### **Última Guardia (`night_player_death`)**
- **Condición**: Un infectado entra en tu sala de guardia o duermes con un infectado en el refugio (sin civiles que lo distraigan).
- **Lore**: El cloro te encontró en la oscuridad. Tu guardia ha terminado.
- **Tipo**: Peligro (Rojo).

---

## ⚙️ Implementación Técnica (`js/GameEndingManager.js`)

El proceso de finalización de partida no es un simple cambio de pantalla; es una secuencia coreografiada:

1.  **Bloqueo de Estado**: Se activa `State.endingTriggered = true` y se bloquea el `isAnimating` en `Game.js` para evitar clics accidentales.
2.  ** VHS Burst**: Si el final es de tipo `danger`, se dispara un efecto visual de estática y una alerta sonora (`glitch_burst`).
3.  **Protocolo de Cierre**: Se ejecuta `UIManager.triggerFullscreenProtocol()`. Esta es una animación tipo terminal que muestra mensajes dinámicos ("CORRUPCIÓN DETECTADA..." o "SESIÓN FINALIZADA") mientras oculta el resto de la interfaz.
4.  **Resonancia de Lore**: 
    - Se muestra el fragmento de lore `post_final` (puente narrativo).
    - Se carga el contenido específico del final desde `LoreData.js`.
    - Se inyectan variables como el nombre del NPC de Lore responsable si aplica.
5.  **Cálculo de Estadísticas**: `UIManager.renderFinalStats()` procesa el `State` final para generar el desglose de:
    - Ciclos sobrevividos.
    - Humanos salvados vs. Infectados filtrados.
    - Suministros restantes y nivel final de cordura.

## 💾 Desbloqueo Permanente
El ID del final se añade a `State.unlockedEndings` y se persiste en `localStorage`. Esto permite que, en futuras partidas, el juego sepa qué verdades del cloro ya ha descubierto el jugador.

---

## Verificación de Probabilidades

| Final | Dificultad de obtención | Notas |
|-------|-------------------------|-------|
| Clean | Alta | Requiere escaneos precisos y gestión de recursos. |
| Corrupted | Media | Pasa si eres negligente o te arriesgas con sujetos dudosos. |
|Paranoia | Media/Alta | Sube al purgar civiles o ignorar sujetos. |
| Generator | Baja | Solo si descuidas totalmente el combustible. |
| Alone | Media | Si purgas a demasiada gente por miedo. |

---

## 4. Finales de Lore (Anomalías)

### **Asimilación (`final_lore_assimilation`)**
- **Condición**: Tener un NPC de lore (Anomalía) en el refugio durante la noche (**80% probabilidad de muerte**).
- **Lore**: El cloro no vino a convivir. [Nombre del NPC] te encontró mientras dormías. Hay cosas que no se pueden contener.
- **Tipo**: Peligro (Rojo).
- **Notas**: Extremadamente peligroso admitir NPCs con badge "⚠ ANOMALÍA".

### **Coleccionista de Abismos (`final_lore_collector`)**
- **Condición**: Admitir **2 o más NPCs de lore** y sobrevivir la noche (4% probabilidad combinada).
- **Lore**: Reuniste a las voces del cloro bajo un mismo techo. Ellos se reconocen entre sí. La resonancia comienza.
- **Tipo**: Peligro (Rojo).
- **Notas**: Ending especial muy raro, requiere múltiples encuentros de lore.

### **Conocimiento Prohibido (`final_lore_survivor`)**
- **Condición**: Sobrevivir una noche con NPC de lore (20% probabilidad) Y purgarlo al día siguiente antes de escapar.
- **Lore**: Sobreviviste a la noche con la anomalía. Viste lo que no deberías. La verdad del cloro está ahora en tu mente... permanentemente.
- **Tipo**: Ambiguo (Normal).
- **Notas**: Logro raro, requiere supervivencia + decisión consciente de purgar.

---

## 📊 Total de Finales: **12**

- **Escape**: 4 (Clean, Corrupted, Player Infected, Refugio Tomado)
- **Supervivencia/Derrota**: 4 (Paranoia, Generator, Alone, Abandonment)
- **Guardia**: 2 (Night Player Death, Overload Death)
- **Lore**: 3 (Asimilación, Coleccionista, Conocimiento Prohibido)

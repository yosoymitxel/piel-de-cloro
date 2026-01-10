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

## Verificación de Probabilidades

| Final | Dificultad de obtención | Notas |
|-------|-------------------------|-------|
| Clean | Alta | Requiere escaneos precisos y gestión de recursos. |
| Corrupted | Media | Pasa si eres negligente o te arriesgas con sujetos dudosos. |
| Paranoia | Media/Alta | Sube al purgar civiles o ignorar sujetos. |
| Generator | Baja | Solo si descuidas totalmente el combustible. |
| Alone | Media | Si purgas a demasiada gente por miedo. |

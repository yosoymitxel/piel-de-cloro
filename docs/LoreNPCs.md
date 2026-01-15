# NPCs de Lore (Anomalías) - Guía del Sistema

## ¿Qué son los NPCs de Lore?

Los **NPCs de Lore** son manifestaciones especiales del cloro que aparecen durante el juego. **NO son humanos** - son entidades relacionadas con la narrativa central del juego y la historia del cloro.

### Los Cuatro NPCs de Lore

1. **Dr. Vargas (Paciente Cero)**
   - Científico expulsado, piel translúcida
   - Temperatura: 31.2°C
   - Pulse: 12 bpm
   - Asociado con el origen del cloro

2. **Kael**
   - Rostro fusionado con metal
   - Temperatura: 28.5°C
   - Pulse: 8 bpm
   - Controla el miedo y el oxígeno

3. **La Colmena**
   - Niño con voz colectiva, piel móvil
   - Temperatura: 33.0°C
   - Pulse: 15 bpm
   - Sangra icor negro

4. **El Archivista**
   - Cuerpo cubierto de cicatrices ilegibles
   - Temperatura: 32.8°C
   - Pulse: 18 bpm
   - Llora sangre, asociado con memoria

## Identificación

### Badge de Anomalía
Los NPCs de lore aparecen con un **badge distintivo**:

```
⚠ ANOMALÍA
```

- **Color**: Rojo brillante (`var(--alert)`)
- **Ícono**: Calavera cruzada (`fa-skull-crossbones`)
- **Animación**: Pulso constante con glow

### Características Visuales
- **Borde rojo** en las cards (shelter y perímetro)
- **Atributos anómalos**:
  - Temperatura extremadamente baja (<35°C)
  - Pulso muy lento
  - Textura de piel inusual

## Mecánica de Peligro

### Probabilidad de Muerte Nocturna

Tener un NPC de lore en el refugio es **extremadamente peligroso**:

- **80% probabilidad de muerte** al dormir
- **20% probabilidad de supervivencia**
- Con 2 lore NPCs: **96% probabilidad de muerte**
- La muerte es **instantánea e inevitable** - no se puede defender

### Modal Warning

Al abrir el modal de detalle de un NPC de lore, verás:

```
⚠️ ADVERTENCIA DE ANOMALÍA
Nivel de Amenaza: CRÍTICO
Riesgo Nocturno: 80% LETAL
```

Este warning aparece **SIEMPRE** para NPCs de lore, independientemente de si están validados o no.

### Log de Supervivencia

Si sobrevives una noche con un NPC de lore en el refugio, verás:

```
⚠️ ALERTA: Sobreviviste la noche con [Nombre] en el refugio.
Los registros muestran anomalías en los sensores.
```

Este mensaje aparece en el log del día siguiente.

## Finales Relacionados

### 1. Asimilación (`final_lore_assimilation`)
- **Probabilidad**: 80% con 1 lore NPC
- **Trigger**: Dormir con lore NPC en refugio
- **Texto**: "El cloro no vino a convivir. {Nombre} te encontró mientras dormías..."
- **Tipo**: Peligro (Rojo)

### 2. Coleccionista de Abismos (`final_lore_collector`)
- **Probabilidad**: ~4% con 2 lore NPCs
- **Trigger**: Tener 2+ lore NPCs y sobrevivir
- **Texto**: "Reuniste a las voces del cloro bajo un mismo techo..."
- **Tipo**: Peligro (Rojo)
- **Nota**: Ending muy raro

### 3. Conocimiento Prohibido (`final_lore_survivor`)
- **Condición**: Sobrevivir + Purgar al lore NPC
- **Trigger**: Sobrevivir 20% y purgar antes de escapar
- **Texto**: "Viste lo que no deberías. La verdad del cloro está ahora en tu mente..."
- **Tipo**: Ambiguo (Normal)

## Estrategias

### Opción 1: Ignorar (Seguro)
- **Ventaja**: Seguridad total
- **Desventaja**: Pierdes contenido narrativo
- **Recomendado si**: Buscas la victoria

### Opción 2: Admitir (Riesgoso)
- **Ventaja**: Diálogos únicos y revelaciones de lore
- **Desventaja**: 80% probabilidad de muerte
- **Recomendado si**: Buscas completar la narrativa

### Opción 3: Purgar Inmediatamente
- **Ventaja**: Ves el diálogo, luego eliminas el peligro
- **Desventaja**: Aumenta paranoia (+20% si era humano... pero los lore NO son humanos)
- **Nota**: Esta es la estrategia más balanceada

### Opción 4: Arriesgar y Purgar (Achievement)
- **Ruta**: Admitir → Dormir → Sobrevivir (20%) → Purgar → Escapar
- **Recompensa**: `final_lore_survivor`
- **Dificultad**: Muy alta

## Frecuencia de Aparición

- **Probabilidad base**: ~12% por NPC generado
- **Por día**: Promedio 1-2 NPCs, así que ~12-24% por día
- **Por partida**: Alta probabilidad de encontrar al menos 1-2 en 9 días

Los 4 lore NPCs son independientes, así que es posible (aunque raro) encontrar a los 4 en una sola partida.

## Tips Avanzados

1. **Diálogos Únicos**: Cada lore NPC tiene diálogos especiales con audio `lore_interlude_seen` que se reproduce en loop
2. **No Hay Defensa**: A diferencia de los infectados regulares, NO puedes protegerte de los lore NPCs
3. **Tests No Ayudan**: Los tests de validación no cambian el riesgo del 80%
4. **Achievement Hunter**: Para desbloquear los 3 finales de lore, necesitarás múltiples partidas
5. **Save Scumming**: El sistema es aleatorio, así que puedes recargar si mueres

## Lore Narrativo

Los NPCs de lore representan **aspectos fundamentales del cloro**:
- **Paciente Cero**: El origen
- **Kael**: El control estructural
- **La Colmena**: La colectividad
- **El Archivista**: La memoria perpetua

Admitirlos no es solo peligroso mecánicamente - narrativamente, estás **invitando al cloro mismo** al refugio.

---

**¿Vale la pena el riesgo?** Depende de si valoras la narrativa por encima de la victoria. El juego te da la elección consciente.

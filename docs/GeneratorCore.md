# Sistema de Núcleo del Generador (V2)

El generador ha sido rediseñado para actuar como el eje central de la gestión de recursos del refugio, pasando de un sistema de modos estáticos a una arquitectura dinámica basada en **Carga y Capacidad**.

## Arquitectura

### 1. Métricas Principales
- **Capacidad**: El límite nominal de energía que el generador puede producir de forma segura (Defecto: 100u).
- **Carga (Load)**: La suma dinámica de todos los consumos activos.
- **Estabilidad**: La salud física del núcleo. Operar por encima de la capacidad drena la estabilidad.
- **Consumo Base**: El gasto mínimo pasivo del refugio (Defecto: 5u).

### 2. Sub-sistemas
El jugador puede activar o desactivar sistemas individuales para gestionar la carga:
- **Seguridad** (15u): Necesario para el funcionamiento del escáner y visores.
- **Iluminación** (10u): Mantiene la visibilidad (si se apaga, aumenta la paranoia).
- **Soporte Vital** (20u): Crítico para la supervivencia a largo plazo.
- **Laboratorio** (25u): Necesario para investigaciones avanzadas (próximamente).

## Mecánica de Sobrecarga

Cuando `Carga > Capacidad`:
1. El generador entra en estado de **Sobrecarga**.
2. La **Estabilidad** disminuye proporcionalmente al exceso de carga.
3. El `overloadTimer` aumenta.
4. Existe una probabilidad creciente de **Fallo Catastrófico** (Apagado total).

## Feedback UI
- **Medidor de Aguja**: Muestra la carga actual en porcentaje.
- **Vibración**: La aguja vibra cuando la carga supera el 90%.
- **Glitch Térmico**: La pantalla del monitor CRT flaquea si la estabilidad cae por debajo del 30%.
- **Barra HUD**: Indicador persistente en el HUD principal con carga y estabilidad.

## Integración con Analizador de Hemoglobina
El Analizador de Hemoglobina provoca un pico masivo de carga (+45u) durante 2 turnos mientras procesa la muestra, obligando al jugador a apagar otros sistemas para evitar el fallo del núcleo.

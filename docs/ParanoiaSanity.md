# Sistema de Paranoia vs. Cordura (Sanity)

Este documento detalla la diferenciación mecánica y visual entre la **Paranoia del Sistema** y la **Cordura del Operador** en Ruta-01.

## 1. Paranoia (Hardware/Sistema)
Representa la degradación del equipo de vigilancia y la tensión operativa.

- **Origen**: Se incrementa principalmente al purgar civiles o ignorar sujetos que luego resultan ser brechas de seguridad.
- **Efecto Visual**: 
    - **Viñeta Verde**: Una sombra perimetral de color cloro que se intensifica a partir del 50%.
    - **Interferencia de Datos**: Los colores de la interfaz (iconos, textos de diálogo) cambian a tonos rojizos o anaranjados.
    - **Glitches en NPCs**: Los avatares de los sujetos muestran distorsiones visuales (flicker) con mayor frecuencia.
- **Impacto Mecánico**: 
    - Mayor consumo de energía en herramientas de escaneo.
    - Probabilidad de fallo en el generador.
    - Interferencia en la veracidad de los diálogos (los sujetos parecen más sospechosos de lo que son).
- **Balanceo y Dinámica**:
    - **Aumento por Ignorar**: Ignorar sujetos aumenta la paranoia (Incertidumbre). Ahora está limitado a un factor aleatorio máximo de 7 (antes era fijo).
    - **Reducción Nocturna**: La paranoia se reduce cada noche exitosa. Si el número de civiles sanos es mayor al de cloros (infectados) admitidos, la reducción es mayor (-15% en lugar de -10%).
    - **Suministros de Emergencia**: Solicitar suministros aéreos aumenta la paranoia en un 15% debido al ruido y la logística.

## 2. Cordura (Percepción/Psique)
Representa el estado mental del operador ante el horror biológico.

- **Origen**: Disminuye al presenciar eventos traumáticos, ver infectados de cerca o durante las resoluciones nocturnas violentas.
- **Efecto Visual**:
    - **Filtros de Post-procesamiento**: Distorsión de color (hue-rotate), saturación errática y desenfoque (blur).
    - **Viñeta Roja**: Aparece cuando la cordura es inferior al 25%, simulando un estado de shock.
    - **HUD Alucinatorio**: Los valores de Paranoia, Cordura y Suministros pueden mostrar números falsos o fluctuantes acompañados de un efecto de "texto glitch".
- **Impacto Mecánico**:
    - **Dificultad de Lectura**: La interfaz se vuelve físicamente más difícil de leer.
    - **Falsos Positivos**: El operador puede "ver" síntomas de infección en sujetos sanos debido a la psicosis.

---

## Tabla Comparativa

| Característica | Paranoia (Sistema) | Cordura (Psique) |
| :--- | :--- | :--- |
| **Color Dominante** | Verde Cloro / Ámbar | Rojo / Desaturado |
| **Afecta a...** | Herramientas y Hardware | Percepción del Jugador |
| **Riesgo Crítico** | Fallo total del sistema | Alucinaciones y HUD falso |
| **Recuperación** | Mantenimiento y precisión | Descanso y éxitos |

## Implementación Técnica
Los efectos se gestionan en `UIManager.js` mediante los métodos:
- `applySanityEffects(sanity)`: Aplica filtros CSS al `body`.
- `updateStats(...)`: Gestiona las viñetas y las fluctuaciones del HUD alucinatorio.

# Arquitectura Técnica - Ruta 01

El proyecto sigue un diseño modular basado en clases de JavaScript (ES6), utilizando un patrón de **Gestores (Managers)** que interactúan a través de un **Estado Global (State)**.

## 🏗️ Estructura de Clases

### Núcleo (Core)
- **`js/Game.js`**: La orquesta principal. Inicializa todos los gestores y maneja el bucle principal de juego y la navegación entre pantallas.
- **`js/State.js`**: El único punto de verdad. Almacena el estado de la partida, configuración, NPCs admitidos, recursos y progreso. Incluye métodos reactivos para actualizar estadísticas.
- **`js/Constants.js`**: Definiciones constantes para IDs de pantallas, ítems de navegación, tiempos y configuraciones base.

### Lógica de Juego (Gameplay Logic)
- **`js/NPC.js`**: Clase para la generación procedimental de personajes. Maneja la lógica de infección, atributos fisiológicos y rasgos.
- **`js/GameMechanicsManager.js`**: Gestiona las reglas del juego: fallos del generador, consecuencias de purgas, y la resolución de la fase nocturna.
- **`js/RandomEventManager.js`**: Sistema de eventos aleatorios diarios que pueden afectar al estado del refugio.

### Sistemas Especializados
- **`js/DialogueEngine.js`**: Motor de diálogo que procesa pools de conversación, maneja tags de acción y controla el flujo de interacción con los NPCs.
- **`js/GeneratorManager.js`**: Controla el estado del generador, distribución de energía y modos de operación.
- **`js/LoreManager.js`**: Gestiona el desbloqueo y visualización de fragmentos de historia.
- **`js/AudioManager.js`**: Sistema de sonido con soporte para capas de ambiente, efectos posicionales y música dinámica.

### Interfaz y Presentación (UI/UX)
- **`js/UIManager.js`**: Encapsula todas las manipulaciones del DOM. Maneja efectos de post-procesado (glitches, distorsión por paranoia) y actualizaciones del HUD.
- **`js/ModalManager.js`**: Gestor específico para ventanas emergentes y la vista detallada de inspección de NPCs.
- **`js/AvatarRenderer.js`**: Renderizado dinámico de avatares basado en los atributos del NPC.
- **`js/ToolsRenderer.js`**: Animaciones y efectos visuales para las herramientas de inspección (Termómetro, UV, etc.).

## 🔄 Flujo de Datos

1. **Entrada**: El usuario interactúa con la UI (botones, diálogos).
2. **Acción**: `GameActionHandler` o los Managers capturan la intención.
3. **Estado**: Se actualiza `State.js` (ej: `State.updateParanoia(10)`).
4. **Reacción**: Los Managers detectan el cambio o son notificados para actualizar la UI (`UIManager.updateStats()`) o disparar efectos sonoros.

## 🛠️ Herramientas y Tecnologías
- **Vanilla JS (ES6)**: Módulos nativos para organización de código.
- **jQuery**: Utilizado exclusivamente para manipulación ágil del DOM y animaciones sencillas.
- **Tailwind CSS**: Framework para el diseño visual y layout.
- **Jest**: Framework de testing para validar la lógica de infección y mecánicas de juego.

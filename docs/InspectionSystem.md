# Sistema de Inspección y Herramientas

El núcleo del gameplay deductivo. El jugador dispone de 4 herramientas para revelar atributos ocultos de los NPCs.

## 📂 Archivos Relacionados
- **`js/Game.js`**: Contiene la lógica principal en el método `inspect(tool)`.
- **`js/UIManager.js`**: Maneja el feedback VHS, la coordinación de la interfaz y el **Manual de Operaciones**.
- **`js/ToolsRenderer.js`**: Centraliza todas las animaciones visuales de las herramientas (`renderThermometer`, `renderPulse`, `renderPupils`, `renderUV`).
- **`js/NPC.js`**: Define los atributos base (`temperature`, `pulse`, `skinTexture`, `pupils`) y el array `revealedStats`.
- **`js/State.js`**: Gestiona la energía del generador y el contador de escaneos.

## ⚙️ Implementación Técnica

### Sistema de Ayuda al Usuario
Se ha implementado un sistema de guías dinámicas:
1. **Manual de Operaciones**: Accesible mediante el icono `[?]` en el HUD. Explica detalladamente cada estadística (Paranoia, Salud Mental, Suministros) y el funcionamiento de las herramientas.
2. **Mini-Tutorial Inicial**: Una guía breve y concisa que aparece al iniciar la partida, centrada en el objetivo primario y los síntomas clave.
3. **Archivos Recuperados**: En la pantalla de inicio, los jugadores pueden consultar una base de datos de los finales que han desbloqueado para profundizar en el lore.

### Coste de Energía
Cada uso de una herramienta consume **1 punto de energía** del generador.
- El límite de energía depende del **Modo del Generador** (Normal: 2, Ahorro: 1, Sobrecarga: 3).
- Si la energía se agota, el icono de rayo en el HUD parpadeará en rojo y las herramientas se bloquearán.
- La energía se recupera automáticamente al pasar al siguiente sujeto o esperar un tiempo determinado (si el generador tiene potencia suficiente).

## Herramientas

### 1. Termómetro (`tool-thermo`)
- **Mide**: Temperatura corporal.
- **Normal**: ~36.5°C - 37.5°C.
- **Anomalía (Infectado)**: < 35.0°C (Hipotermia severa sin temblores) o > 40°C (Fiebre sin sudor).
- **Visual**: Animación de barra de mercurio.

### 2. Linterna UV (`tool-flash`)
- **Mide**: Textura de la piel (Dermis).
- **Normal**: Piel sana o sucia.
- **Anomalía (Infectado)**: "Seca" (Dry), patrones reflectantes, rastros de hongos o "grasa" invisible.
- **Visual**: Efecto de luz violeta sobre el avatar.

### 3. Escáner de Pulso (`tool-pulse`)
- **Mide**: Ritmo cardíaco (BPM).
- **Normal**: 60 - 100 BPM (puede ser más alto por nervios).
- **Anomalía (Infectado)**: < 40 BPM (Bradicardia extrema) o patrones arrítmicos imposibles.
- **Visual**: Gráfico de EKG.

### 4. Dilatador de Pupilas (`tool-pupils`)
- **Mide**: Reacción pupilar.
- **Normal**: Contracción normal ante la luz.
- **Anomalía (Infectado)**: Dilatación fija (Midriasis) o pupilas con formas irregulares.
- **Visual**: Primer plano del ojo reaccionando.

## Lógica de Estado

Cuando se ejecuta `inspect(tool)`:
1.  Se verifica `State.generator.isOn` y si `npc.scanCount < maxEnergy`.
2.  Se añade la estadística a `npc.revealedStats` para evitar cobro doble (aunque la animación se puede repetir).
3.  Se incrementa `npc.scanCount` y `State.verificationsCount`.
4.  Se llama a `UIManager` para bloquear la interfaz durante la animación (`isAnimating = true`).

## Validación "Day After"
Los sujetos admitidos no se consideran "seguros" inmediatamente. Al día siguiente, en el refugio, se pueden realizar tests más precisos (sin coste de energía del generador, pero con un límite diario de reactivos) para confirmar si la decisión fue correcta.
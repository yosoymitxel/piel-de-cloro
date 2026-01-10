# Sistema de Inspección y Herramientas

El núcleo del gameplay deductivo. El jugador dispone de 4 herramientas para revelar atributos ocultos de los NPCs.

## 📂 Archivos Relacionados
- **`js/Game.js`**: Contiene la lógica principal en el método `inspect(tool)`.
- **`js/UIManager.js`**: Maneja las animaciones visuales (`animateToolThermometer`, `animateToolPulse`, etc.) y el feedback VHS.
- **`js/NPC.js`**: Define los atributos base (`temperature`, `pulse`, `skinTexture`, `pupils`) y el array `revealedStats`.
- **`js/State.js`**: Gestiona la energía del generador y el contador de escaneos.

## ⚙️ Implementación Técnica

## Coste de Energía
Cada uso de una herramienta consume **1 punto de energía** del generador.
- Si la energía se agota, el jugador solo puede dialogar o tomar una decisión (Admitir/Rechazar) sin más pruebas.

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
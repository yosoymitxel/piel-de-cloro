# Ruta 01: Piel de Cloro

> *"El refugio no olvida. La noche revela lo que el día oculta."*

**Piel de Cloro** es un juego de terror analógico, gestión de recursos y deducción social ambientado en un búnker post-apocalíptico. Como guardia del **Puesto de Control Ruta-01**, tu deber es decidir quién entra, quién se queda fuera y quién debe ser purgado, mientras mantienes la energía del generador y tu propia cordura.

## 🌑 Sinopsis

El mundo exterior ha sido consumido por una "niebla" y una infección parasitaria conocida como **Piel de Cloro**. Los infectados imitan a los humanos, pero presentan anomalías fisiológicas sutiles: hipotermia, piel reactiva a la luz UV, pupilas dilatadas y falta de pulso.

Tú eres la última línea de defensa. Si dejas entrar a un infectado, el refugio caerá al caer la noche. Si rechazas a demasiados inocentes, el mando central te abandonará. Y si el generador falla... estarás solo en la oscuridad con *ellos*.

## 👁️ Mecánicas Principales

### 1. El Ciclo Diario (Fase de Guardia)
- **Inspección**: Utiliza herramientas limitadas (Termómetro, Linterna UV, Escáner de Pulso, Dilatador de Pupilas) para encontrar anomalías en los solicitantes.
- **Interrogatorio**: Dialoga con los sujetos. Busca contradicciones, tics nerviosos o historias incoherentes.
- **Gestión de Energía**: Cada test consume energía. El generador tiene una capacidad limitada por turno.
- **Rasgos Especiales**: Los NPCs ahora tienen rasgos (Recolector, Optimista, Paranoico, etc.) que afectan la supervivencia del refugio.
- **Decisión**: ¿Admitir o Rechazar? Admitir requiere validar al sujeto al día siguiente. Rechazar aumenta la paranoia si era humano.

### 2. El Generador
El corazón del búnker. Debes gestionar sus modos de funcionamiento:
- **Ahorro**: Bajo consumo, pero limita tus herramientas a 1 uso por turno.
- **Normal**: Balance estándar.
- **Sobrecarga**: Permite más tests, pero aumenta drásticamente el riesgo de apagón o explosión.

### 3. La Fase Nocturna y Suministros
Cuando cae la noche, el trabajo no termina:
- **Gestión de Suministros**: Cada refugiado consume 1 unidad de suministros por noche. Si se agotan, la cordura baja y aumenta el riesgo de muerte por inanición.
- **Efectos de Rasgos**: Algunos refugiados pueden encontrar suministros extra (Recolectores) o mejorar el ambiente (Optimistas), mientras que otros pueden ser un lastre (Enfermizos, Paranoicos).
- **Gestión del Refugio**: Revisa a los admitidos. Si sospechas que cometiste un error, puedes **purgar** a un sujeto (eliminarlo), pero esto tiene un coste mental alto.
- **Intrusiones**: Vigila la Sala de Seguridad. Asegura puertas, ventanas y tuberías. Si la alarma suena, algo intenta entrar.
- **Dormir**: El momento más vulnerable. Si hay un infectado dentro, alguien morirá. Si el refugio está vacío, tu mente te jugará malas pasadas.

### 4. Paranoia
Tu salud mental es un recurso.
- Sube al presenciar eventos horribles, purgar inocentes o sufrir apagones.
- Si llega al 100%, sufres un colapso mental (Game Over).
- Afecta a tu percepción: el texto se distorsiona, escuchas ruidos y ves cosas que no están ahí.

### 5. Sistema de Gestión y Mapa Estructural
El búnker ha crecido más allá del puesto de control. Ahora dispones de un **Mapa Estructural** que conecta varios sectores:
- **Puesto de Control**: Tu área de trabajo principal para la inspección de NPCs.
- **Logística y Suministros**: Gestiona expediciones externas para recuperar recursos.
- **Sala de Meditación**: Recupera cordura y reduce la paranoia de forma pasiva.
- **Laboratorio (Hemoglobina)**: Realiza tests de sangre avanzados (si el generador lo permite).

### 6. HUD Espejado y Navegación Rápida
- **HUD Global**: Tus estadísticas (Paranoia, Cordura, Energía) se sincronizan en tiempo real en todas las pantallas.
- **Pines de Navegación**: Fija tus salas más visitadas en la barra lateral para un acceso instantáneo.

## 📂 Estructura del Proyecto

El juego está construido en **JavaScript (ES6)** modular:

- `js/Game.js`: Controlador principal del bucle de juego.
- `js/UIManager.js`: Gestión centralizada de la interfaz y sub-managers.
- `js/components/`: Componentes UI reutilizables (Estadísticas, Botones, etc.).
- `js/State.js`: Estado global sincronizado.

## 🛠️ Instalación y Ejecución

Este es un proyecto web estático. No requiere compilación.

1. Clona el repositorio.
2. Abre `index.html` en tu navegador (preferiblemente Chrome o Firefox).
   - *Nota: Debido a las políticas de CORS de los navegadores con módulos ES6, se recomienda usar un servidor local (ej. Live Server en VS Code o `python -m http.server`).*

## 📖 Lore y Secretos

> "Si la sed despierta tras beber, no bebas más. El cloro odia el mar y ama las grietas."

El juego cuenta con un sistema de **Lore** fragmentado. Escucharás rumores, encontrarás notas y interceptarás transmisiones de radio que revelan la verdad sobre la infección y el destino de los otros refugios.

---
*Desarrollado para la jam... o quizás encontrado en un servidor abandonado.*

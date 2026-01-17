# Cimientos del Sistema de Sabotaje (Estructural)

Este documento describe la base técnica para que los NPCs realicen acciones dentro del refugio, permitiendo futuras expansiones de gestión.

## 🏗️ Asignación de Sectores

Los NPCs admitidos pueden ser asignados a uno de los siguientes sectores:
- **Generador**: Ayudan al mantenimiento (o sabotaje de potencia).
- **Seguridad**: Refuerzan el perímetro (o abren puertas desde dentro).
- **Suministros**: Gestión de recursos (o robo de provisiones).

## ☢️ Mecánica de Sabotaje Nocturno

Durante la transición de turno, el `GameMechanicsManager` evalúa los NPCs asignados:

1. **Check de Infección**: Solo los NPCs con `isInfected: true` pueden sabotear.
2. **Probabilidad**: Existe un factor de riesgo base que aumenta con la Paranoia global.
3. **Eventos de Sabotaje**:
    - **Sector Seguridad**: Una puerta o ventana asegurada pasa a estar `unsecured`.
    - **Sector Generador**: El generador sufre un fallo crítico inmediato (`isOn = false`).
    - **Sector Suministros**: Desaparición de 1-3 unidades de suministros.

---

## 📡 Escalabilidad
Este módulo está diseñado para que, cuando se implementen nuevas pantallas de "Administración", ya exista el soporte en el `State` para saber quién está dónde y qué riesgos conlleva.

## 🧪 Pruebas
Ver `__tests__/npc_sabotage.test.js` para la validación de la lógica de asignación y disparador de eventos.

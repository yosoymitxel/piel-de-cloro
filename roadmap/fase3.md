FASE 3: PROFUNDIDAD SISTÉMICA Y GESTIÓN
En esta fase, activamos los "sistemas dormidos" (Profesiones, Rasgos) y gamificamos el Lore para que el jugador tenga una razón de peso para interactuar con cada sujeto.

3.1. Gestión de Talento (Profesiones con Impacto)
Problema: El sistema de empleos (Ingeniero, Médico, etc.) existe en el código pero no afecta el juego.

Especificación Técnica:
Mecánica de Asignación: Al aceptar a un NPC en el refugio, el jugador debe poder asignarlo a una "Estación de Trabajo".

Bonificadores de Oficio:

Ingeniero: Asignado al Generador -> Reduce el consumo de batería un 15% por turno.

Médico: Asignado a Enfermería -> Reduce la probabilidad de que un herido muera por la noche en un 30%.

Cocinero: Asignado a Cocina -> Cada unidad de comida rinde un 20% más (o genera "Raciones Extra").

Soldado: Asignado a Seguridad -> Reduce la pérdida de suministros por robos nocturnos.

Interfaz: En la lista de refugiados, añadir un icono representativo de su labor y su ubicación actual.

3.2. Gamificación Narrativa (Lore Útil)
Problema: Leer los diálogos no da ninguna ventaja, por lo que el jugador los salta.

Especificación Técnica:
Diálogos con Recompensa: Algunos diálogos clave ahora deben activar funciones:

giveItem(itemId): El NPC te entrega un bidón de combustible o medicina tras una charla exitosa.

reduceParanoia(amount): Hablar con ciertos NPCs "calmados" baja el nivel de paranoia del jugador.

Objetos de Lore (Items con Data): Implementar notas o grabaciones. Al "usarlas" desde el inventario, se desbloquea una entrada en el Log que ayuda a identificar si el siguiente sujeto es peligroso.

NPCs con Barreras: Introducir personajes mudos o que hablan en códigos. El jugador debe usar "Papel y Lápiz" (ítem) o traducir sus gestos para obtener información crítica.

3.3. Consecuencias de Desabastecimiento (Survival Horror)
Problema: Quedarse sin suministros no penaliza al jugador.

Especificación Técnica:
El "Evento de Hambre": Si al final del día food == 0:

Se dispara un evento aleatorio: "Disturbios", "Deserción" o "Canibalismo".

Canibalismo: Aumenta los suministros pero reduce la Cordura (Sanity) a la mitad y genera un Glitch visual permanente ese día.

Penalización de Salud Mental: La falta de recursos aumenta la Paranoia un 10% diario. Si la Paranoia llega a 100 por falta de comida, el jugador pierde el control y se genera un final alterno ("Colapso").

3.4. Log Jerárquico y Sistema de Rumores
Problema: El registro de eventos es confuso y visualmente monótono.

Especificación Técnica:
Jerarquía por Colores e Iconos:

[CRÍTICO] (Rojo + Icono Calavera): Muertes, fallos totales del generador.

[ALERTA] (Amarillo + Exclamación): Falta de comida, intrusiones frustradas.

[INFO] (Cian/Verde): Cambios de ciclo, recargas exitosas.

Pestaña de Rumores: Un apartado en el Log donde se guardan frases específicas dichas por los NPCs que contienen pistas sobre la trama o sobre el estado del exterior.

📝 Checkpoint de Lógica (Ejemplo de función de impacto)
Así debería verse la lógica de asignación para que sea escalable:

JavaScript

// StaffManager.js
const JobEffects = {
    ENGINEER: { target: 'generator', effect: 'consumption', value: -0.15 },
    DOCTOR:   { target: 'health',    effect: 'deathRate',   value: -0.30 },
    COOK:     { target: 'supplies',  effect: 'efficiency',  value: 0.20 }
};

function applyStaffBonuses() {
    State.refugees.forEach(npc => {
        if (npc.assignedRoom && JobEffects[npc.job]) {
            const bonus = JobEffects[npc.job];
            // Aplicar lógica según el target
        }
    });
}
PLAN DE IMPLEMENTACIÓN: VERSIÓN 2.0 (Sistemas Críticos)
1. Módulo de Victoria: El "Pity System" del Laboratorio
El objetivo es que la cura sea alcanzable pero dependa de la habilidad del jugador.

Modificación: En la lógica de análisis, si el jugador identifica correctamente a un NPC clave de Lore, la probabilidad de obtener cureFragment sube al 100%.

Condición de Victoria: Implementar un observador que al llegar a state.cureFragments === 3, bloquee el ciclo de juego y dispare el modal de Final de Victoria.

Guardado: Vincular este evento al EndingsManager para persistir el logro en el navegador.

2. Refactor de Modales: La "Capa de Contexto"
Para solucionar que los botones de "Asignar" aparezcan en la Morgue.

Lógica de Renderizado:

JavaScript
// Dentro de la función que abre el modal de detalles del NPC:
if (this.currentScreen === 'MORGUE') {
    btnAsignar.style.display = 'none';
    btnAutopsia.style.display = 'block';
} else {
    btnAsignar.style.display = 'block';
    btnAutopsia.style.display = 'none';
}
Fix de Navegación: Identificar el ID del botón "Volver" en el Análisis Psicológico y re-vincular el evento click para que cierre la capa superior del modal.

3. Notificaciones de Laboratorio "Inteligentes"
Pasar de mensajes genéricos a información visual directa.

Cambio en NotificationManager:

Al terminar un análisis, el mensaje debe incluir: [Nombre del NPC] + [Resultado].

Estilo Visual: Si el resultado es positivo (malo), aplicar clase CSS .text-danger-green. Si es negativo (sano), clase .text-neutral-white.

4. Sincronización Global de Alertas (El Semáforo)
Evitar que el Mapa diga una cosa y los Pines otra.

Centralización: Crear un método getSecurityLevel() que evalúe la integridad de los sistemas.

Actualización: Una única función debe recorrer todos los elementos con la clase .status-pin (tanto en el mapa como en la central) y aplicar el color basado en el mismo valor de state.securityIntegrity.

5. Navegación Rápida (Botón de Retorno)
Añadir salida directa al Mapa en pantallas de "tránsito".

Pantallas objetivo: Meditación, Suministros, Combustible.

Implementación: Añadir un elemento div o button con el ID #btn-back-to-map que simplemente llame a la función showMap(), evitando que el jugador tenga que completar una acción para salir de la pantalla.
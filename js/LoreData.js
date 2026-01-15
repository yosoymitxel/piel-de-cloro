export const LoreData = {
    initial: {
        title: 'Manual del Guardián',
        content: `
            <div class="flex flex-col gap-4 text-sm font-mono">
                <!-- Sección 1: El Objetivo -->
                <div class="p-3 border-l-4 border-chlorine bg-chlorine/5">
                    <h3 class="text-chlorine font-bold mb-1 uppercase text-xs">Objetivo Primario</h3>
                    <p class="text-gray-300 text-[11px] leading-relaxed">
                        Identificar y <span class="text-white">purgar</span> a los portadores de "Piel de Cloro" antes de que infecten el refugio.
                    </p>
                </div>

                <!-- Sección 2: Herramientas y Síntomas -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="p-2 border border-blue-900/30 bg-black/40">
                        <h4 class="text-blue-400 font-bold text-sm mb-1 uppercase">Inspección</h4>
                        <ul class="text-[9px] text-gray-400 space-y-1">
                            <li><i class="fa-solid fa-temperature-half mr-1"></i> <span class="text-white">Frío:</span> < 35°C</li>
                            <li><i class="fa-solid fa-lightbulb mr-1"></i> <span class="text-white">UV:</span> Manchas/Sequedad</li>
                            <li><i class="fa-solid fa-heart-pulse mr-1"></i> <span class="text-white">Pulso:</span> Lento/Bradicardia</li>
                            <li><i class="fa-solid fa-eye mr-1"></i> <span class="text-white">Ojos:</span> Sin reflejo</li>
                        </ul>
                    </div>
                    <div class="p-2 border border-warning/30 bg-black/40">
                        <h4 class="text-warning font-bold text-sm mb-1 uppercase">Recursos</h4>
                        <p class="text-[9px] text-gray-400 leading-tight">
                            El <span class="text-white">Generador</span> alimenta el HUD y la luz UV. Sin <span class="text-white">Suministros</span>, los refugiados mueren de hambre cada noche.
                        </p>
                    </div>
                </div>

                <!-- Sección 3: Acciones -->
                <div class="p-2 border border-gray-800 bg-black/20">
                    <div class="flex justify-between items-center text-sm">
                        <div class="flex flex-col items-center gap-1 w-1/2 border-r border-gray-800">
                            <i class="fa-solid fa-check text-chlorine"></i>
                            <span class="text-white font-bold">ADMITIR</span>
                            <span class="text-gray-500 text-center px-1 italic">Vigila su estado al día siguiente.</span>
                        </div>
                        <div class="flex flex-col items-center gap-1 w-1/2">
                            <i class="fa-solid fa-xmark text-alert"></i>
                            <span class="text-white font-bold">PURGAR</span>
                            <span class="text-gray-500 text-center px-1 italic">Elimina la amenaza de inmediato.</span>
                        </div>
                    </div>
                </div>

                <!-- Sección 4: Nota Técnica -->
                <div class="text-center">
                    <p class="text-sm text-alert opacity-70 animate-pulse">
                        <i class="fa-solid fa-triangle-exclamation mr-1"></i> ERROR: INTRUSIONES DETECTADAS EN SALA DE CONTROL
                    </p>
                    <p class="text-[9px] text-gray-500 mt-2 italic">Pulsa en el icono de ayuda [?] del panel para más detalles.</p>
                </div>
            </div>
        `,
        audio: 'lore_intro_track'
    },
    intermediate: {
        title: 'Interludio',
        variants: [
            { kind: 'radio', text: '“Realmente no son personas, purgarlos debería ser corr...”. La señal se corta. Luego silencio.' },
            { kind: 'oido', text: 'Golpes: dos cortos y uno largo. Afuera puede ser peligroso.' },
            { kind: 'vista', text: 'Una sombra cruzó el pasillo. Por un instante, se nos fue el aliento, debemos revisar si todo está asegurado.' },
            { kind: 'registro', text: 'Anotación: la piel reseca aparece con luz UV y olor metálico es percibido de forma sutil.' },
            { kind: 'radio', text: 'Se rumorea que se alimentan de humedad, moho y agua estancada, no se descarta que también de carne podrida.' },
            { kind: 'oido', text: 'Se escuchan gritos a través de las tuberías, quizá hay alguien ahí.' },
            { kind: 'vista', text: 'Los espejos del pasillo empañan cuando alguien piel de cloro pasa delante.' },
            { kind: 'radio', text: 'Transmisión interceptada: “El cloro recuerda quién abrió la puerta, normalmente lo deja vivir”.' },
            { kind: 'oido', text: 'Se ven restos de piel en el pasillo ¿De quién será?' },
            { kind: 'registro', text: 'Nota olvidada: “Si la sed despierta tras beber, no bebas más”.' },
            { kind: 'vista', text: 'Parece que alguien ha estado quieto en el pasillo.' },
            { kind: 'radio', text: 'Estática hace horas, quizá días, no podemos saber mucho más de lo que pasa afuera.' },
            { kind: 'oido', text: 'Pasos fuera de la sala, hay agua por todos lados, se siente peligroso.' },
            { kind: 'registro', text: 'Página de anotaciones de un refugiado: “La piel se desprende si miras de frente demasiado rato”.' },
            { kind: 'vista', text: 'Una mancha verde en el techo crece cuando nadie la observa.' },
            { kind: 'radio', text: '“El agua sabe a cloro, parece que alguien ha infectado el tanque de agua”.' },
            { kind: 'oido', text: 'Goteo que imita tu ritmo cardíaco hasta que cambias de ritmo.' },
            { kind: 'registro', text: 'Aviso: “Sellen las grietas con sal; el cloro odia el mar”.' },
            { kind: 'vista', text: 'Siluetas en la niebla tratando de entrar por puertas que no existen.' },
            { kind: 'radio', text: '“No duermas con la boca abierta, aunque la posibilidad es baja puedes convertirte en uno de ellos”.' }
        ]
    },
    pre_final: {
        title: 'Umbral',
        content: 'Antes de salir, recuerda: sin pruebas, solo queda la palabra. El refugio no olvida.'
    },
    post_final: {
        title: 'Resonancia',
        content: 'El refugio recuerda. Las decisiones dejan marcas invisibles que la noche ilumina.'
    },
    night_tranquil: {
        title: 'Noche tranquila',
        content: 'El silencio fue real. Nadie habló y nadie cayó.',
        type: 'calm'
    },
    night_civil_death: {
        title: 'Noche de sangre',
        content: 'Alguien fue encontrado sin pulso. El cloro está entre nosotros.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    night_player_death: {
        title: 'Última guardia',
        content: 'El cloro te alcanzó y esta ha sido tu última guardia en el refugio.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_clean: {
        title: 'Salida limpia',
        content: 'Lograste cruzar el umbral con supervivientes reales. Sus pieles sudan, sus pulsos son firmes. Por primera vez en semanas, el agua que bebes no sabe a metal. Has contenido la amenaza.',
        type: 'calm',
        audio: 'lore_final_clean'
    },
    final_corrupted: {
        title: 'Salida contaminada',
        content: 'Alcanzasteis la superficie, pero la victoria fue breve. Uno de los tuyos comenzó a secarse bajo el sol. Ahora, la plaga tiene un nuevo hogar: el mundo exterior.',
        type: 'danger',
        audio: 'lore_final_corrupted'
    },
    final_death_alone: {
        title: 'Soledad terminal',
        content: 'Abandonaste el puesto sin nadie a tu lado. En la inmensidad de los túneles, el silencio pesa más que el acero. Te encontraron acurrucado a pocos metros de la salida, con los ojos abiertos y vacíos.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_death_all_infected: {
        title: 'Refugio tomado',
        content: 'No había a quién salvar. Cuando abriste la compuerta final, todos te miraron con pupilas dilatadas. No fue una huida, fue una asimilación. Ahora eres uno de ellos.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_death_paranoia: {
        title: 'Colapso mental',
        content: 'Tu mente se quebró antes que tu cuerpo. Corriste hacia la oscuridad huyendo de sombras imaginarias. Moriste de agotamiento, gritando nombres que nadie conoce, con la salida a solo unos pasos.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_player_infected_escape: {
        title: 'Paciente Cero',
        content: 'Sentiste el cambio al ver la luz real. Tu piel no soportó el aire puro y se deshizo. No escapaste para salvarte, sino para expandirte. Tú eras la zona cero.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_generator_off: {
        title: 'Oscuridad eterna',
        content: 'El generador se detuvo y con él, la esperanza. Sin energía para abrir las compuertas hidráulicas, el refugio se convirtió en un sarcófago de hormigón. Moriste en la oscuridad total, escuchando cómo algo rascaba el metal desde el otro lado.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_abandonment: {
        title: 'Incumplimiento de Deber',
        content: 'Has permitido que demasiados sujetos se marchen sin procesar. El mando central ha bloqueado tu acceso y enviado una unidad de contención. Ya no eres necesario en este puesto. Tu reemplazo llegará cuando la zona sea "desinfectada".',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_overload_death: {
        title: 'Muerte por Sobrecarga',
        content: 'El sistema eléctrico colapsó violentamente. La falta de personal para estabilizar los núcleos provocó una explosión térmica. El refugio ahora es una tumba de metal fundido y estática.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_lore_assimilation: {
        title: 'Asimilación',
        content: 'El cloro no vino a convivir.\n\n{loreName} te encontró mientras dormías.\n\nHay cosas que no se pueden contener.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_lore_collector: {
        title: 'Coleccionista de Abismos',
        content: 'Reuniste a las voces del cloro bajo un mismo techo.\n\nEllos se reconocen entre sí.\n\nLa resonancia comienza.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_lore_survivor: {
        title: 'Conocimiento Prohibido',
        content: 'Sobreviviste a la noche con la anomalía.\n\nViste lo que no deberías.\n\nLa verdad del cloro está ahora en tu mente... permanentemente.',
        type: 'normal',
        sfx: 'ui_modal_open'
    }
};

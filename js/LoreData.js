export const LoreData = {
    initial: {
        title: 'Protocolo de Emergencia',
        content: `
            <div class="flex flex-col gap-3 text-sm font-mono">
                <div class="p-3 border border-chlorine bg-black/60 shadow-[0_0_10px_rgba(45,90,39,0.2)]">
                    <h3 class="text-chlorine font-bold mb-2 text-base border-b border-chlorine/30 pb-1"><i class="fa-solid fa-biohazard mr-2"></i>LA AMENAZA</h3>
                    <p class="text-chlorine-light opacity-90 leading-relaxed">
                        Los <span class="text-white font-bold">Piel de Cloro</span> son portadores.
                        <br>Síntomas: <span class="text-white">Piel seca, pupilas dilatadas, pulso bajo, hipotermia.</span>
                    </p>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="p-2 border border-warning/40 bg-black/40">
                        <h4 class="text-warning font-bold text-xs mb-1"><i class="fa-solid fa-bolt mr-1"></i>GENERADOR</h4>
                        <p class="text-[11px] text-gray-300 leading-tight">Limita el uso de herramientas. Si se apaga, pierdes capacidad de análisis.</p>
                    </div>
                    <div class="p-2 border border-alert/40 bg-black/40">
                        <h4 class="text-alert font-bold text-xs mb-1"><i class="fa-solid fa-shield-halved mr-1"></i>SEGURIDAD</h4>
                        <p class="text-[11px] text-gray-300 leading-tight">Vigila la Sala de Control. Las intrusiones ignoradas son letales.</p>
                    </div>
                </div>

                <div class="p-2 border border-gray-800 bg-black/40">
                    <ul class="list-none space-y-1 text-xs text-gray-400">
                        <li><i class="fa-solid fa-check text-chlorine mr-1"></i> <span class="text-gray-200">Admitir:</span> Requiere validación al día siguiente.</li>
                        <li><i class="fa-solid fa-xmark text-alert mr-1"></i> <span class="text-gray-200">Purgar:</span> Elimina la amenaza, pero matar civiles sube la Paranoia.</li>
                    </ul>
                </div>
                
                <p class="text-center text-xs text-chlorine-dim italic mt-1">"El refugio no olvida. La noche revela lo que el día oculta."</p>
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
    }
};

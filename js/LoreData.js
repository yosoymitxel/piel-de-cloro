export const LoreData = {
    initial: {
        title: 'Protocolo del Refugio',
        content: `
            <p>Los piel de cloro son portadores. La piel se reseca, los ojos se dilatan y el pulso baja.</p>
            <p>Herramientas: usa TERMÓMETRO, LINTERNA UV, PULSO y PUPILAS para revelar señales.</p>
            <p>Decisiones: admitir aumenta riesgo; purgar reduce amenaza pero sube la paranoia si era civil.</p>
            <p>Al caer la noche, si hay cloro dentro, alguien muere. Si no, descansas o afrontas un riesgo leve.</p>
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
        content: 'Antes de decidir, recuerda: sin pruebas, solo queda la palabra. El refugio no olvida.'
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
        content: 'Alguien fue encontrado sin pulso. El cloro respiró entre nosotros.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    night_player_death: {
        title: 'Última guardia',
        content: 'El refugio te consumió. El cloro no duerme. Tú tampoco.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_clean: {
        title: 'Salida limpia',
        content: 'Escapaste con humanidad intacta. Por ahora, el ciclo descansa.',
        type: 'calm',
        audio: 'lore_final_clean'
    },
    final_corrupted: {
        title: 'Salida contaminada',
        content: 'Escapaste, pero el agua os sigue. El ciclo no termina.',
        type: 'danger',
        audio: 'lore_final_corrupted'
    },
    final_death_alone: {
        title: 'Soledad terminal',
        content: 'Nadie sobrevivió contigo. Nadie te escuchó. Fin.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_death_all_infected: {
        title: 'Refugio tomado',
        content: 'Todos eran cloro. No hubo salida posible.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_death_paranoia: {
        title: 'La paranoia te alcanzó',
        content: 'Al intentar huir, el ruido te encontró primero.',
        type: 'danger',
        sfx: 'glitch_burst'
    },
    final_player_infected_escape: {
        title: 'Salida portadora',
        content: 'No era el refugio. Eras tú. Lo llevaste contigo.',
        type: 'danger',
        sfx: 'glitch_burst'
    }
};

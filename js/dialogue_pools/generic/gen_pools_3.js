import { act } from '../../DialogueActions.js';

export const gen_pools_3 = {
    "gen_twitch": {
        id: 'gen_twitch',
        tags: ['nervous', 'body_horror', 'generic'],
        unique: false,
        root: 'gtw_n1',
        nodes: {
            'gtw_n1': {
                id: 'gtw_n1',
                text: "*Su cabeza se sacude bruscamente hacia un lado.* \"Perdón... perdón. Es un tic. Nervios.\"",
                options: [
                    { id: 'gtw_o1', label: '¿Te duele?', next: 'gtw_n2a' },
                    { id: 'gtw_o2', label: 'Cálmate', next: 'gtw_n2b' }
                ]
            },
            'gtw_n2a': {
                id: 'gtw_n2a',
                text: "*Se frota el cuello.* \"A veces. Es como si algo tirara del músculo. Un calambre constante.\"",
                options: [
                    { id: 'gtw_o2a', label: 'Examinar cuello', next: 'gtw_n3a' },
                    { id: 'gtw_o2l', label: '¿Encontraste esto?', next: null, resultText: "*Te da un vial pequeño.* \"Se le cayó a un médico... antes de que le diera el espasmo.\"", onclick: (g) => act.giveLoreItem(g, 'item_sedative', 'Vial de Sedante') },
                    { id: 'gtw_o2b', label: 'Proceder', next: 'gtw_n3b' }
                ]
            },
            'gtw_n2b': {
                id: 'gtw_n2b',
                text: "*El tic se repite, más fuerte.* \"Lo intento. Pero cuanto más lo pienso, peor es.\"",
                options: [{ id: 'gtw_o2c', label: 'Entiendo', next: 'gtw_n3b' }]
            },
            'gtw_n3a': {
                id: 'gtw_n3a',
                text: "*Notas un bulto duro bajo la piel, cerca de la columna.* \"¡Ay! No aprietes ahí.\"",
                options: [
                    { id: 'gtw_o3a', label: 'Eso no es normal. Fuera.', next: null, resultText: "*Se aleja con movimientos bruscos.* \"No puedo controlarlo... ¡no puedo!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gtw_o3b', label: 'Analizar bulto con UV', next: null, resultText: "*Aprieta los dientes.* \"Intentaré no moverme... lo juro.\"", onclick: act.testUV, log: { text: 'Anomalía: Bultos móviles bajo la piel. Posible parásito o reconfiguración muscular.', icon: 'fa-circle-dot' } },
                    { id: 'gtw_o3e', label: 'Quieto', next: 'gtw_n4b' }
                ]
            },
            'gtw_n3b': {
                id: 'gtw_n3b',
                text: "*Respira hondo.* \"¿Puedo pasar? Necesito sentarme.\"",
                options: [
                    { id: 'gtw_o3c', label: 'No estás en condiciones. Vete.', next: null, resultText: "*Se marcha tropezando.* \"Nadie me quiere así...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gtw_o3d', label: 'Siéntate ahí, voy a verificar.', next: null, resultText: "*Se sienta en el suelo.* \"Aquí estoy más estable. Procede.\"", onclick: act.testPulse },
                    { id: 'gtw_o3f', label: 'Siéntate', next: 'gtw_n4b' }
                ]
            },
            'gtw_n4b': {
                id: 'gtw_n4b',
                text: "*Espasmos musculares. Usa LINTERNA UV para buscar movimiento subcutáneo.*",
                options: []
            }
        }
    },
    "gen_hum": {
        id: 'gen_hum',
        tags: ['fanatic', 'stoic', 'generic'],
        unique: false,
        root: 'ghu_n1',
        nodes: {
            'ghu_n1': {
                id: 'ghu_n1',
                text: "*Tararea una melodía monótona y grave.* \"Mmmm... mmmm... ayuda a no pensar. ¿Te molesta?\"",
                options: [
                    { id: 'ghu_o1', label: 'Por favor para', next: 'ghu_n2a' },
                    { id: 'ghu_o2', label: '¿Qué canción es?', next: 'ghu_n2b' }
                ]
            },
            'ghu_n2a': {
                id: 'ghu_n2a',
                text: "*Deja de tararear, pero empieza a golpear rítmicamente su pierna.* \"El silencio es peor. En el silencio se oyen cosas.\"",
                options: [
                    { id: 'ghu_o2a', label: 'Mantén la calma', next: 'ghu_n3a' }
                ]
            },
            'ghu_n2b': {
                id: 'ghu_n2b',
                text: "*Se encoge de hombros.* \"No lo sé. La oí en los túneles. Se te pega.\"",
                options: [
                    { id: 'ghu_o2r', label: '¿Dónde la oíste?', next: null, resultText: "*Cierra los ojos.* \"En los niveles inferiores. Donde las máquinas respiran.\"", onclick: (g) => act.unlockRumor(g, 'Rumor: Melodía que induce trance, escuchada en túneles profundos.') },
                    { id: 'ghu_o2b', label: 'Proceder', next: 'ghu_n3b' }
                ]
            },
            'ghu_n3a': {
                id: 'ghu_n3a',
                text: "*Mira alrededor.* \"¿Seguro que es seguro aquí? El zumbido del generador... suena igual.\"",
                options: [
                    { id: 'ghu_o3a', label: 'Si no te gusta, vete.', next: null, resultText: "*Se aleja con su melodía.* \"Mmmm... mmmm... el ruido me protege...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'ghu_o3b', label: 'Guarda silencio un momento, por favor.', next: null, resultText: "*Cierra la boca.* \"(Golpea el suelo con el pie rítmicamente)\"", onclick: act.testPulse },
                    { id: 'ghu_o3e', label: 'Silencio', next: 'ghu_n4b' }
                ]
            },
            'ghu_n3b': {
                id: 'ghu_n3b',
                text: "*Vuelve a tararear.* \"Mmmm... mmmm...\"",
                options: [
                    { id: 'ghu_o3c', label: 'Ese ruido es insoportable. Fuera.', next: null, resultText: "*Sube el volumen de su tarareo al irse.* \"¡MMMM! ¡MMMM!\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'ghu_o3d', label: 'Voy a revisarte mientras esperas.', next: null, resultText: "*Tararea muy bajito.* \"Es para calmarme... no te molestará.\"", onclick: act.testPulse, log: { text: 'Conducta: Tarareo en frecuencias bajas. Parece un intento de sincronizarse con el zumbido del generador.', icon: 'fa-music' } },
                    { id: 'ghu_o3f', label: 'Adelante', next: 'ghu_n4b' }
                ]
            },
            'ghu_n4b': {
                id: 'ghu_n4b',
                text: "*Conducta repetitiva. Verifica PULSO para detectar anomalías rítmicas.*",
                options: []
            }
        }
    },
    "gen_search": {
        id: 'gen_search',
        tags: ['obsessive', 'nervous', 'generic'],
        unique: false,
        root: 'gsr_n1',
        nodes: {
            'gsr_n1': {
                id: 'gsr_n1',
                text: "*Mira al suelo constantemente.* \"Se me cayó... se me cayó algo importante. ¿Lo has visto?\"",
                options: [
                    { id: 'gsr_o1', label: '¿Qué perdiste?', next: 'gsr_n2a' },
                    { id: 'gsr_o2', label: 'Aquí no hay nada', next: 'gsr_n2b' }
                ]
            },
            'gsr_n2a': {
                id: 'gsr_n2a',
                text: "*Se arrodilla.* \"Una llave. O una moneda. Algo brillante. Brillaba en la oscuridad.\"",
                options: [
                    { id: 'gsr_o2a', label: 'Levántate', next: 'gsr_n3a' },
                    { id: 'gsr_o2l', label: '¿Era esto?', next: null, resultText: "*Sus ojos se iluminan.* \"¡Sí! ¡Mi tesoro!\"", onclick: (g) => act.giveLoreItem(g, 'item_shiny_coin', 'Moneda Antigua (Indescifrable)') }
                ]
            },
            'gsr_n2b': {
                id: 'gsr_n2b',
                text: "*Te mira con desconfianza.* \"Seguro que te lo guardaste. Todos quieren lo que brilla.\"",
                options: [
                    { id: 'gsr_o2b', label: 'No tengo nada', next: 'gsr_n3b' }
                ]
            },
            'gsr_n3a': {
                id: 'gsr_n3a',
                text: "*Se levanta sacudiéndose el polvo.* \"Si no lo encuentro, no puedo pagar. ¿Aceptáis trabajo a cambio?\"",
                options: [
                    { id: 'gsr_o3a', label: 'No aceptamos mendigos.', next: null, resultText: "*Sigue buscando mientras se aleja.* \"Tiene que estar por aquí...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gsr_o3b', label: 'Ya buscaremos luego. Ahora el chequeo.', next: null, resultText: "*Se sacude el polvo.* \"Bien, bien. Pero si ves algo brillante, avísame.\"", onclick: act.testPupils, log: { text: 'Conducta: Búsqueda de objetos brillantes. Posible atracción por la luz o reflejos.', icon: 'fa-key' } },
                    { id: 'gsr_o3e', label: 'Levántate', next: 'gsr_n4b' }
                ]
            },
            'gsr_n3b': {
                id: 'gsr_n3b',
                text: "*Entrecierra los ojos.* \"Ya... claro. Ladrones.\"",
                options: [
                    { id: 'gsr_o3c', label: 'Cuidado con lo que dices. Fuera.', next: null, resultText: "*Se marcha enfadado.* \"Ladrones... todos sois ladrones...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gsr_o3d', label: 'Nadie te va a robar. Espera.', next: null, resultText: "*Te vigila de reojo.* \"No toques mis bolsillos durante el escaneo.\"", onclick: act.testPupils },
                    { id: 'gsr_o3f', label: 'Tranquilo', next: 'gsr_n4b' }
                ]
            },
            'gsr_n4b': {
                id: 'gsr_n4b',
                text: "*Sujeto desorientado. Verifica PUPILAS para descartar ceguera por luz.*",
                options: []
            }
        }
    },
    "gen_map": {
        id: 'gen_map',
        tags: ['confused', 'pain', 'generic'],
        unique: false,
        root: 'gmp_n1',
        nodes: {
            'gmp_n1': {
                id: 'gmp_n1',
                text: "*Tiene los brazos cubiertos de dibujos hechos con tinta.* \"Anoto el camino. Para no olvidar cómo volver.\"",
                options: [
                    { id: 'gmp_o1', label: 'Ver mapa', next: 'gmp_n2a', log: { text: 'Lore: Mapas dibujados en la piel. Indican que la \"niebla\" corta los caminos conocidos.', icon: 'fa-map' } },
                    { id: 'gmp_o2', label: '¿Volver a dónde?', next: 'gmp_n2b' }
                ]
            },
            'gmp_n2a': {
                id: 'gmp_n2a',
                text: "*Son líneas caóticas que imitan tuberías.* \"Aquí es donde estamos. Y aquí... aquí es donde se cortó la luz.\"",
                options: [
                    { id: 'gmp_o2a', label: 'Parece confuso', next: 'gmp_n3a' },
                    { id: 'gmp_o2l', label: 'Déjame copiar ese mapa', next: null, resultText: "*Extiende el brazo.* \"Cópialo rápido. La tinta se está borrando.\"", onclick: (g) => act.giveLoreItem(g, 'item_ink_map', 'Boceto de Mapa de Túneles') }
                ]
            },
            'gmp_n2b': {
                id: 'gmp_n2b',
                text: "*Señala hacia atrás.* \"Arriba. A la superficie. Algún día.\"",
                options: [
                    { id: 'gmp_o2b', label: 'Optimista', next: 'gmp_n3b' }
                ]
            },
            'gmp_n3a': {
                id: 'gmp_n3a',
                text: "*Se mira el brazo.* \"A veces la tinta se borra con el sudor. Tengo que repasarla.\"",
                options: [
                    { id: 'gmp_o3b', label: 'No quiero gente rara aquí.', next: null, resultText: "*Se aleja trazando líneas.* \"Tendré que buscar otra ruta en el mapa...\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gmp_o3a', label: 'Interesante. Déjame ver tus constantes.', next: null, resultText: "*Muestra sus brazos.* \"Lee mi piel. Todo está escrito ahí.\"", onclick: act.testUV },
                    { id: 'gmp_o3e', label: 'Veamos', next: 'gmp_n4b' }
                ]
            },
            'gmp_n3b': {
                id: 'gmp_n3b',
                text: "*Sonríe tristemente.* \"La esperanza es lo último que se pierde, ¿no?\"",
                options: [
                    { id: 'gmp_o3c', label: 'Aquí ya no hay esperanza. Vete.', next: null, resultText: "*Baja los brazos.* \"La esperanza también se pierde, supongo.\"", cssClass: 'horror-btn-dismiss', onclick: act.ignore },
                    { id: 'gmp_o3d', label: 'Mantén la esperanza. Voy a revisar.', next: null, resultText: "*Asiente.* \"Gracias. Aún queda camino por recorrer.\"", onclick: act.testUV },
                    { id: 'gmp_o3f', label: 'Adelante', next: 'gmp_n4b' }
                ]
            },
            'gmp_n4b': {
                id: 'gmp_n4b',
                text: "*Tinta en piel. Usa LINTERNA UV para ver si los mapas ocultan algo.*",
                options: []
            }
        }
    },
    "gen_wait": {
        id: 'gen_wait',
        tags: ['aggressive', 'generic'],
        unique: false,
        root: 'gwt_n1',
        nodes: {
            'gwt_n1': {
                id: 'gwt_n1',
                text: "*Golpea el marco de la puerta.* \"¡Vamos! ¡Llevo horas esperando! ¿Cuánto tarda un simple chequeo?\"",
                options: [
                    { id: 'gwt_o1', label: 'Calma', next: 'gwt_n2a' },
                    { id: 'gwt_o2', label: 'Es el protocolo', next: 'gwt_n2b' }
                ]
            },
            'gwt_n2a': {
                id: 'gwt_n2a',
                text: "\"¡No me calmo! ¡Tengo hambre y frío! ¡Abre la maldita puerta!\"",
                options: [{ id: 'gwt_o2a', label: 'Amenazar', next: 'gwt_n3a' }]
            },
            'gwt_n2b': {
                id: 'gwt_n2b',
                text: "\"Protocolo, protocolo... siempre lo mismo. Mientras tanto nosotros nos pudrimos fuera.\"",
                options: [
                    { id: 'gwt_o2r', label: '¿Qué pasa fuera?', next: null, resultText: "*Escupe al suelo.* \"Cosas que cazan en la oscuridad. Y vosotros aquí calentitos.\"", onclick: (g) => act.unlockRumor(g, 'Rumor: Aumento de actividad hostil en perímetros exteriores.') },
                    { id: 'gwt_o2b', label: 'Proceder', next: 'gwt_n3b' }
                ]
            },
            'gwt_n3a': {
                id: 'gwt_n3a',
                text: "*Retrocede un paso.* \"Vale, vale... solo haz tu trabajo.\"",
                options: [
                    { id: 'gwt_o3b', label: 'No tolero amenazas. Largo.', next: null, cssClass: 'horror-btn-dismiss', resultText: "*Golpea la puerta.* \"¡Maldita burocracia! ¡Nos matarán a todos!\"", onclick: act.ignore },
                    { id: 'gwt_o3a', label: 'Cálmate o no entras. Voy a empezar.', next: null, resultText: "*Resopla impaciente.* \"Venga, acaba con esto de una vez.\"", onclick: act.testPulse },
                    { id: 'gwt_o3e', label: 'Silencio', next: 'gwt_n4b' }
                ]
            },
            'gwt_n3b': {
                id: 'gwt_n3b',
                text: "*Cruza los brazos.* \"Rápido.\"",
                options: [
                    { id: 'gwt_o3c', label: 'Será rápido si colaboras.', next: null, resultText: "*Mira su muñeca desnuda.* \"Tic, tac. El tiempo corre.\"", onclick: act.testPulse },
                    { id: 'gwt_o3f', label: 'Empecemos', next: 'gwt_n4b' }
                ]
            },
            'gwt_n4b': {
                id: 'gwt_n4b',
                text: "*Sujeto impaciente. Verifica PULSO para descartar agitación viral.*",
                options: []
            }
        }
    }
};

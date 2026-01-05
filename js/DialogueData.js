export const DialogueData = {
    personalities: ['nervous', 'aggressive', 'stoic', 'confused'],
    
    // Structure: personality -> category -> { q: question, a_clean: [], a_infected: [] }
    // Infected have a chance to use a_infected (subtle hints) or a_clean (blending in)
    
    dialogues: {
        nervous: {
            greeting: {
                clean: [
                    "¿H-hola? ¿Puedo pasar?",
                    "No me mires así... solo quiero entrar.",
                    "Hace frío... mucho frío.",
                    "¿E-estás ahí? Solo quiero refugio.",
                    "Por favor... no me cierres la puerta.",
                    "¿Eres tú? ¿El de antes?",
                    "No te preocupes... no hago daño.",
                    "¿Puedo confiar en ti?",
                    "Solo un rato... prometo irme.",
                    "¿Es seguro aquí dentro?",
                    "No me gusta estar afuera... demasiado ruido.",
                    "¿Oyes eso? ¿O solo lo oigo yo?",
                    "¿Te importa si paso un minuto?",
                    "No soy fuerte... pero no soy una amenaza.",
                    "¿Dónde están los demás?",
                    "¿Estás solo? ¿Seguro?",
                    "¿Por qué todo está tan oscuro?",
                    "No tengo armas... mírame las manos.",
                    "¿Qué fue eso? ¿Lo escuchaste?",
                    "¿Puedo quedarme hasta que amanezca?"
                ],
                infected: [
                    "¿H-hola? ¿Puedo... entrar?",
                    "Tengo... tengo frío.",
                    "La puerta... ábrela.",
                    "¿Por qué... tanta luz? Apágala.",
                    "Siento... algo en la garganta.",
                    "¿Estás... solo? Perfecto.",
                    "No... no me mires así.",
                    "¿Puedo... tocarte? Solo un segundo.",
                    "El agua... huele a agua.",
                    "¿Tienes... algo caliente? Mi sangre... está fría.",
                    "¿Por qué tiemblan tus manos? Las mías no.",
                    "¿Oyes zumbidos? Yo también... dentro.",
                    "¿Puedo pasar? No... no pienso morder.",
                    "¿Estás seguro de que estás... tú?",
                    "¿Por qué me miras así? ¿Te asusta mi piel?",
                    "¿Te importa si... me acerco?",
                    "¿Dónde está el baño? Necesito... vomitar agua.",
                    "¿Puedo tocar tu cabello? Huele a... vida.",
                    "¿Por qué sudas? Yo no sudo... ya.",
                    "¿Puedo entrar? Prometo... no llorar sangre."
                ]
            },
            q_status: {
                q: "Estado físico",
                clean: [
                    "Tiemblo un poco... es el frío.",
                    "Estoy bien, juro que estoy bien.",
                    "Solo necesito descansar.",
                    "Me duele la espalda... de correr.",
                    "Tengo un poco de fiebre... nada grave.",
                    "¿Por qué me preguntas? ¿Parezco enfermo?",
                    "Solo cansado... muy cansado.",
                    "No me siento fuerte... pero resisto.",
                    "¿Te parezco pálido? Es la luz.",
                    "¿Escuchas mi corazón? Late rápido... por el miedo.",
                    "No tengo heridas abiertas... mira.",
                    "¿Por qué tiemblo? No lo sé... no me preguntes.",
                    "¿Te importa si me siento? Me mareo.",
                    "¿Tienes agua? Mi boca está seca... de nervios.",
                    "¿Por qué todo gira? ¿Es normal?",
                    "No me siento bien del estómago... pero no es nada.",
                    "¿Por qué me miras así? ¿Estoy pálido?",
                    "¿Puedo tomar algo? Solo un poco.",
                    "¿Te parezco diferente? No... no lo estoy.",
                    "¿Por qué me cuesta respirar? Es el miedo... solo eso."
                ],
                infected: [
                    "Mi piel... pica un poco.",
                    "Siento... movimiento dentro.",
                    "Estoy... óptimo.",
                    "¿Por qué me miras? ¿Te gusta mi piel nueva?",
                    "No tengo fiebre... mi temperatura es... perfecta.",
                    "¿Por qué tiemblo? No es miedo... es ajuste.",
                    "¿Te importa si me río? Me sale solo.",
                    "¿Oyes ese ruido? Es mi estómago... o algo más.",
                    "¿Por qué me duele la cabeza? Se está abriendo...",
                    "¿Te asusta mi sonrisa? Es solo... más ancha.",
                    "¿Por qué me cuesta hablar? Mi lengua... crece.",
                    "¿Te importa si me toco la cara? Se está... mudando.",
                    "¿Por qué sangro por la nariz? No es sangre... es agua.",
                    "¿Te gusta mi olor? Es nuevo... dulce.",
                    "¿Por qué me tiemblan las manos? No son mis manos.",
                    "¿Te importa si me acuesto? Me siento... liviano.",
                    "¿Por qué todo sabe a metal? ¿Tú también lo sabes?",
                    "¿Por qué me cuesta ver? Todo es verde... hermoso.",
                    "¿Te asusta mi voz? Está cambiando... mejorando.",
                    "¿Por qué no paro de sudar? Es solo... agua de mi piel."
                ]
            },
            q_origin: {
                q: "Procedencia",
                clean: [
                    "Vengo del norte... sector 4.",
                    "No recuerdo bien... corrí mucho.",
                    "Estaba en los túneles.",
                    "¿Por qué lo quieres saber? ¿Vas a juzgarme?",
                    "Vengo del este... o del oeste... no lo recuerdo.",
                    "Estaba escondido... en un sótano.",
                    "¿Te importa? Solo quiero entrar.",
                    "Vengo de lejos... muy lejos... caminé días.",
                    "¿Por qué tantas preguntas? ¿No ves que estoy asustado?",
                    "No sé dónde estuve... todo es confuso.",
                    "¿Te importa si no lo recuerdo? Es mejor así.",
                    "Vengo del bosque... o de la ciudad... no estoy seguro.",
                    "¿Por qué me miras así? ¿No te gusta mi respuesta?",
                    "Estaba con otros... pero los perdí.",
                    "¿Dónde estaba? ¿No lo ves en mi cara? Estaba perdido.",
                    "¿Te importa si miento? No quiero que sepas.",
                    "Vengo del pasado... del miedo... de la oscuridad.",
                    "¿Por qué me cuesta hablar? Porque no sé de dónde vengo.",
                    "¿Te importa si invento? Es más fácil.",
                    "No vengo de ningún lado... solo estoy aquí."
                ],
                infected: [
                    "Vengo de... abajo.",
                    "Del agua... digo, del río.",
                    "Sector... verde.",
                    "¿Por qué lo quieres saber? ¿Vas a unirte?",
                    "Vengo del fondo... del fondo del agua.",
                    "¿Te importa si no lo recuerdo? Es mejor... para ti.",
                    "Del lugar donde todos somos uno... digo, yo solo.",
                    "¿Por qué me miras? ¿Te gusta mi olor a lago?",
                    "Vengo de donde el agua es espesa... y habla.",
                    "¿Te importa si miento? No quiero que sepas... la verdad.",
                    "Del subsuelo... donde el aire es dulce.",
                    "¿Por qué tantas preguntas? ¿No ves que estoy... cambiando?",
                    "Vengo de la reunión... donde todos éramos... yo.",
                    "¿Dónde estaba? ¿No lo hueles? Estaba dentro... del agua.",
                    "¿Te asusta mi respuesta? Es solo... el principio.",
                    "Vengo del origen... del primer gusano.",
                    "¿Por qué me cuesta hablar? Porque no soy... solo yo.",
                    "¿Te importa si invento? Es más fácil... que explicar.",
                    "No vengo de ningún lado... siempre estuve aquí... dentro.",
                    "Del lugar donde el agua... te abraza... y nunca sueltas."
                ]
            }
        },
        aggressive: {
            greeting: {
                clean: [
                    "Abre la maldita puerta.",
                    "No tengo tiempo para esto.",
                    "Déjame entrar o te arrepentirás.",
                    "Muévete, no quiero herirte.",
                    "¿Quieres que rompa esto?",
                    "Soy tu aliado, idiota.",
                    "No me hagas repetirlo.",
                    "Tengo órdenes superiores.",
                    "¿Tienes idea de lo que hay afuera?",
                    "Abre o te arranco el brazo."
                ],
                infected: [
                    "Abre. AHORA.",
                    "Hueles a carne fresca.",
                    "No me hagas esperar.",
                    "Tu pulso... lo escucho.",
                    "La sangre... la necesito.",
                    "Abre o te desgarraré.",
                    "Te veré por dentro.",
                    "Siento tu calor.",
                    "No resistas, será rápido.",
                    "La puerta no te salvará."
                ]
            },
            q_status: {
                q: "Estado físico",
                clean: [
                    "¡Estoy mejor que tú!",
                    "No me toques con esas máquinas.",
                    "Fuerte. Sobreviví.",
                    "Tengo más músculo que miedo.",
                    "¿Quieres probar mi fuerza?",
                    "No me harás sangrar.",
                    "Mi cuerpo es mi arma.",
                    "¿Dudas de mí?",
                    "Soy un maldito tanque.",
                    "Nada me detiene."
                ],
                infected: [
                    "Me siento... poderoso.",
                    "Mi sangre hierve.",
                    "Nunca estuve mejor.",
                    "Siento el poder en mis venas.",
                    "La infección me fortalece.",
                    "Mi piel es acero.",
                    "El dolor es placer.",
                    "Soy invencible.",
                    "La carne es temporal.",
                    "El virus me abraza."
                ]
            },
            q_origin: {
                q: "Procedencia",
                clean: [
                    "¿Qué te importa? Sector 9.",
                    "Vengo de matar a esas cosas.",
                    "Del infierno. Abre.",
                    "Del frente, ¿satisfecho?",
                    "Sector 12, ¿problema?",
                    "De donde los monstruos huyen.",
                    "De la zona caliente.",
                    "¿Quieres mi historial?",
                    "Del otro lado del muro.",
                    "De tu peor pesadilla."
                ],
                infected: [
                    "De la colmena... ¡del refugio anterior!",
                    "Donde todos son uno.",
                    "Cerca... muy cerca.",
                    "Del nido principal.",
                    "Desde la reunión.",
                    "Del centro de la plaga.",
                    "Donde nació el gusano.",
                    "De la oscuridad colectiva.",
                    "Del vientre de la bestia.",
                    "Donde el agua es roja."
                ]
            }
        },
        stoic: {
            greeting: {
                clean: [
                    "Solicito acceso.",
                    "Sector 7 reportándose.",
                    "Sin novedades. Abre.",
                    "Unidad 4 solicita ingreso.",
                    "Protocolo de entrada.",
                    "Identificación válida.",
                    "Sin contacto hostil.",
                    "Misión cumplida.",
                    "Requiere refugio.",
                    "Cumplo cuarentena."
                ],
                infected: [
                    "Acceso requerido.",
                    "Unidad lista para ingresar.",
                    "Nosotros... yo solicito entrar.",
                    "Integración necesaria.",
                    "El colectivo... yo, vengo en paz.",
                    "Unidad 9... individual, lista.",
                    "Solicito unión temporal.",
                    "La puerta... abre.",
                    "Somos compatibles.",
                    "Ingreso autorizado por... mí."
                ]
            },
            q_status: {
                q: "Estado físico",
                clean: [
                    "Óptimo.",
                    "Cansado, pero funcional.",
                    "Sin mordeduras.",
                    "Signos vitales estables.",
                    "Capacidad al 87%.",
                    "Sin fiebre.",
                    "No hay sangrado.",
                    "Músculos respondiendo.",
                    "Reflejos intactos.",
                    "Sin anomalías."
                ],
                infected: [
                    "Sistemas nominales.",
                    "Temperatura adecuada para incubación... digo, vida.",
                    "Funcional.",
                    "Parámetros... aceptables.",
                    "El huésped... yo, estoy bien.",
                    "Integridad... del 92%.",
                    "Sin rechazo.",
                    "Óptimo para propagación.",
                    "Estado... simbiótico.",
                    "Operativo al 100%."
                ]
            },
            q_origin: {
                q: "Procedencia",
                clean: [
                    "Base Delta.",
                    "Patrulla exterior.",
                    "Zona de cuarentena este.",
                    "Puesto avanzado 3.",
                    "Sector de reconstrucción.",
                    "Zona de evacuación.",
                    "Base temporal norte.",
                    "Perímetro seguro.",
                    "Refugio 5.",
                    "Zona neutral."
                ],
                infected: [
                    "Origen irrelevante.",
                    "Desde el origen.",
                    "Zona cero.",
                    "Del núcleo.",
                    "Desde la fuente.",
                    "Del epicentro.",
                    "Origen primario.",
                    "Desde la raíz.",
                    "Del punto de inflexión.",
                    "Desde el origen común."
                ]
            }
        },
        confused: {
            greeting: {
                clean: ["¿Dónde estoy?", "¿Es esto... seguro?", "Vi luces...", "¿Es de día o de noche?", "¿Hay alguien más?", "¿Este es el refugio 12?"],
                infected: ["¿Es este el nido?", "¿Aquí hay... comida?", "Las voces callaron.", "Huele a... familia.", "¿El agua está cerca?", "¿Por qué todo gira?"]
            },
            q_status: {
                q: "Estado físico",
                clean: ["Me duele la cabeza.", "No siento las piernas.", "Creo que estoy bien.", "Tengo sed... mucha sed.", "Mis manos tiemblan sin parar.", "¿Por qué me zumban los oídos?"],
                infected: ["Siento... cosquillas dentro.", "Mi cabeza... zumba.", "Todo es verde.", "Mi piel... respira.", "Hay algo que se mueve.", "Escucho un canto... dulce."]
            },
            q_origin: {
                q: "Procedencia",
                clean: ["Estaba en casa...", "Perdí a mi grupo.", "Solo caminé hacia la luz.", "Vine del túnel este... ¿o del oeste?", "Me encontraron en el bosque.", "No recuerdo... fue todo muy rápido."],
                infected: ["Salí del agua.", "Seguí el olor.", "Me llamaron.", "Desde el lago... él me esperaba.", "Del subsuelo, donde el aire es espeso.", "Vengo de la reunión... todos éramos uno."]
            }
        }
    },

    // Deeper probes
    deep_probes: {
        clean: [
            "Ya te dije la verdad.",
            "¿Por qué tantas preguntas?",
            "Solo déjame entrar, por favor.",
            "No tengo nada que ocultar.",
            "¿No confías en mí?"
        ],
        infected: [
            "No... no mires tan profundo.",
            "El cloro... no me gusta el cloro.",
            "¿Escuchas el zumbido?",
            "Somos... soy inocente.",
            "¿Por qué insistes?... duele.",
            "El agua... siempre el agua.",
            "Mis pensamientos... no son solo míos.",
            "¿Sientes el olor? Dulce, metálico...",
            "No mires mis ojos, no lo hagas."
        ]
    }
};

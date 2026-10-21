# Protocolo de auditoría de diálogos — Piel de Cloro

## Alcance inicial: solo auditoría

No modificar archivos en la primera pasada. No crear ramas narrativas nuevas. No cambiar las reglas del juego.

## Archivos y datos que hay que localizar

Buscar en `js/`, `docs/`, `index.html` y los datos de NPCs:
- cadenas de interrogatorio y respuestas;
- pools de frases aleatorias;
- eventos diurnos/nocturnos;
- texto de inspección y resultados de herramientas;
- notas, registros, radio y lore;
- mensajes de paranoia, psicosis, Game Over y transiciones;
- nombres de opciones, botones y etiquetas que formen parte de la experiencia narrativa.

## Entregable de la auditoría

Para cada conjunto de diálogo: ruta y clave/ID, condición de aparición, quién habla y a quién, texto original, problema y gravedad (`bloqueante`, `alto`, `medio`, `bajo`), propuesta, motivo narrativo, riesgo de cambiar la información recibida y confirmación de que no se altera la lógica.

## Orden de trabajo

1. Diálogos de interrogatorio: afectan directamente a la deducción.
2. Respuestas de NPC y contradicciones: revisar voces y pistas justas.
3. Eventos reactivos de paranoia y noche: quitar repetición y mantener escalada.
4. Lore, notas y transmisiones: asegurar continuidad y capas de descubrimiento.
5. Textos de interfaz: claridad, concisión y tono consistente.

## Criterios de aceptación

- Cero IDs o claves eliminadas.
- Cero cambios de condiciones o resultados mecánicos.
- Ninguna identidad oculta revelada antes de tiempo.
- Cada línea conservada tiene función identificable.
- Las voces de NPCs son distinguibles sin depender de etiquetas.
- Las pistas admiten deducción razonable, no adivinación.
- Pruebas existentes pasan.
- La revisión final incluye diff de texto y lista de pruebas ejecutadas.

## Comando de inventario

```bash
rg -n -i 'dialog|dialogue|interrog|npc|suspect|response|question|radio|lore|paranoia|psychosis|sanity|infect' js docs index.html __tests__
```

Inspeccionar los módulos de datos antes de cambiar la UI. Ejecutar `npm test` antes y después de cada lote de correcciones.

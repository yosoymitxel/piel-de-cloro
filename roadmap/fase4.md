FASE 4: ARQUITECTURA ESCALABLE Y MAPAS
El objetivo no es solo dibujar un mapa, sino crear un sistema donde cada partida pueda tener un refugio con una distribución diferente, salas únicas y una lógica de navegación lógica.

4.1. El Modelo de Datos "Blueprint" (La Antesala)
Problema: Actualmente las habitaciones son una lista plana (['Lab', 'Gen']). Si quieres añadir coordenadas o estados individuales, el sistema colapsa.

Especificación Técnica:
Clase Shelter: Crear un objeto que contenga la configuración del refugio actual.

Diccionario de Salas: Cada sala deja de ser un string para ser un objeto con:

id: Identificador único.

type: (GENERATOR, KITCHEN, MEDICAL, EMPTY, STORAGE).

coords: {x, y} para el futuro mapa 2D.

isDiscovered: Para salas que requieren ser "exploradas".

integrity: Salud de la habitación (si llega a 0, sus beneficios se pierden).

4.2. Sistema de Generación Procedimental (Layouts)
Problema: Jugar siempre en el mismo refugio vuelve la experiencia monótona.

Especificación Técnica:
Generador de Layouts: Al iniciar una partida (o cambiar de refugio), el juego debe elegir un "Preset" de tamaño (ej. 3x3, 4x4) y llenar las casillas.

Reglas de Adyacencia: * El "Generador" siempre debe estar en el centro o en una esquina protegida.

Las salas de "Almacén" pueden aparecer de forma aleatoria aumentando la capacidad de carga del jugador.

Salas Especiales (Raras): Posibilidad de 5% de generar una sala de "Comunicaciones" (facilita la llegada de NPCs de Lore) o "Invernadero" (genera comida pasivamente).

4.3. Renderizado Dinámico (Plano de Arquitecto)
Problema: Las listas de texto no transmiten la sensación de estar encerrado en un búnker.

Especificación Técnica:
Visualización Blueprint: Crear una vista en el menú "Mapas" que dibuje un grid de celdas.

Estilo Visual: Usar líneas verdes neón sobre fondo negro (estilo radar o plano técnico antiguo).

Interactividad: Al hacer clic en una celda del plano, se abre el panel de control de esa habitación específica.

Niebla de Guerra: Las salas no visitadas o sin energía se ven como estática o bloques negros con el texto "SIN SEÑAL".

4.4. Instanciación y Persistencia
Problema: Manejar dos refugios a la vez o cambiar de uno a otro puede corromper el State.

Especificación Técnica:
Estructura de Instancias: El State.js ahora debe guardar currentShelterId. Todos los métodos de consumo de energía deben apuntar a Shelters[currentId].battery.

Sistema de Mudanza: Si el jugador cambia de refugio, se debe ejecutar una función de "Transferencia" que calcule qué suministros se pierden en el camino y qué NPCs deciden no seguirte (basado en su lealtad/miedo).

📝 Checkpoint de Arquitectura (Estructura Pro)
Para que esto sea escalable, la definición de tu refugio debería verse así en código:

JavaScript

// ShelterModel.js
const ROOM_TYPES = {
    GENERATOR: { name: "Núcleo de Energía", powerDraw: 0, icon: "⚡" },
    LAB:       { name: "Laboratorio Químico", powerDraw: 10, icon: "🧪" },
    STORAGE:   { name: "Depósito de Víveres", powerDraw: 2, icon: "📦" }
};

class Shelter {
    constructor(layoutType) {
        this.id = crypto.randomUUID();
        this.layoutName = layoutType; // ej: "Búnker Beta"
        this.grid = []; // Array bidimensional de objetos Room
        this.stats = {
            integrity: 100,
            noiseLevel: 0
        };
    }
}
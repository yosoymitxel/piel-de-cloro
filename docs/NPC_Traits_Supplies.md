# Sistema de Rasgos y Suministros

Este sistema añade una capa de gestión estratégica al juego, obligando al jugador a considerar no solo la infección, sino también la utilidad de cada superviviente para la comunidad del refugio.

## 🛠️ Implementación Mecánica

### Rasgos (Traits)
Cada NPC tiene un rasgo asignado al ser generado. Los rasgos se definen en `NPC.pickTrait()` y tienen un impacto directo en la fase nocturna.

| ID | Nombre | Descripción | Efecto Mecánico |
| :--- | :--- | :--- | :--- |
| `scavenger` | Recolector | Encuentra suministros extra. | 40% de probabilidad de encontrar +1-5 suministros. |
| `optimist` | Optimista | Mejora el ambiente. | -10% de Paranoia cada noche. |
| `paranoid` | Paranoico | Siembra la duda. | +5% de Paranoia cada noche. |
| `sickly` | Enfermizo | Requiere más recursos. | Consume 2 suministros en lugar de 1. |
| `tough` | Resistente | Difícil de eliminar. | Si hay un infectado, el sistema prioriza matar a otros civiles antes que a él. |
| `none` | Ninguno | Sin rasgos especiales. | Consumo estándar (1). |

### Suministros (Supplies)
Representan la comida, agua y medicinas del refugio.
- **Inicio**: El jugador comienza con 15 unidades.
- **HUD**: Se visualiza en la parte superior derecha (icono de caja). Si los suministros son <= 2, el contador parpadea en rojo.
- **Consumo**: Se procesa al inicio de la fase de resolución nocturna (`GameMechanicsManager.sleep()`).

## 💻 Implementación a Nivel de Código

### 1. Generación (`js/NPC.js`)
El constructor de `NPC` llama a `pickTrait()`.
```javascript
pickTrait() {
    const traits = [...]; // Lista de rasgos
    if (Math.random() > 0.7) return traits.find(t => t.id === 'none'); // 70% sin rasgo
    return traits[Math.floor(Math.random() * (traits.length - 1))];
}
```

### 2. Estado Global (`js/State.js`)
Se han añadido propiedades y métodos para gestionar los recursos:
- `State.supplies`: Cantidad actual.
- `State.updateSupplies(val)`: Actualiza el valor y asegura que no baje de 0.

### 3. Lógica de Resolución (`js/GameMechanicsManager.js`)
El método `processNightResourcesAndTraits()` es el motor de este sistema. Itera sobre `State.admittedNPCs` y aplica los efectos basados en `npc.trait.id`.

### 4. Interfaz de Usuario (`js/UIManager.js` y `js/ModalManager.js`)
- **`UIManager.updateStats`**: Actualiza el contador de suministros en el HUD y aplica la animación de alerta.
- **`ModalManager.openModal`**: Muestra el rasgo del NPC en el panel de información utilizando el elemento `#modal-npc-trait`.

## 🧪 Pruebas (Testing)
El archivo `__tests__/npc_traits_and_supplies.test.js` contiene tests unitarios y de integración para asegurar que:
1. Los rasgos se asignan correctamente.
2. El consumo de suministros es exacto (incluyendo el doble consumo de `sickly`).
3. La recolección de `scavenger` funciona según la probabilidad.
4. Los modificadores de cordura y paranoia se aplican.
5. La inanición se dispara correctamente cuando no hay suministros.

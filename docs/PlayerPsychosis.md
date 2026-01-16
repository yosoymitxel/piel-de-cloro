# Sistema de Psicosis y Corrupción de Datos (HUD)

A medida que el operador (jugador) sucumbe al cloro o al estrés, la interfaz deja de ser una fuente de verdad confiable.

## 👁️ Hallucinaciones del HUD

### 1. Infección del Jugador (`State.playerInfected`)
Si el jugador es el "Paciente Cero", su realidad está alterada permanentemente.
- **Efecto**: Los valores numéricos de Suministros y Paranoia oscilan en un ±15% de su valor real.
- **UX**: Los números muestran pequeños caracteres glitch (ej: `45` -> `45†`) y cambian de color (de verde terminal a un tono ámbar corrupto).

### 2. Baja Cordura (Sanity < 20)
El estrés post-traumático causa distorsión sensorial.
- **Efecto**: Flickers (parpadeos) violentos de la pantalla y la aparición de "falsos positivos" en las herramientas de inspección.
- **AudioManager**: Susurros espaciales que se intensifican al estar cerca de infectados.

---

## 💻 Lógica de Lying (Mentira)

El `UIManager.js` procesa los valores reales del `State` a través del `HallucinationEngine` antes de renderizarlos:

```javascript
// Valor Real -> Hallucinated Value -> DOM
const realValue = State.supplies;
const liedValue = ui.getHallucinatedValue(realValue);
$('#supplies-display').text(liedValue);
```

## ⚠️ Cómo identificar el fraude
El jugador puede notar que el HUD miente si observa:
- El color del texto no es el estándar.
- Pequeños saltos en los números sin que haya ocurrido una acción.
- Sonidos de estática persistentes.

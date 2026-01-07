export function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function parseDialogueMarkup(text) {
    if (!text) return '';

    // Función auxiliar para escapar solo el contenido, no las etiquetas que nosotros insertamos
    const safeEscape = (str) => str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);

    let out = text;

    // 1. Extraer Diálogos (Quotes) primero para protegerlos de la regex de rumores
    const speechPlaceholders = [];
    out = out.replace(/"([^"\n]+)"/g, (m, p1) => {
        const idx = speechPlaceholders.push(`<span class="speech">"${safeEscape(p1)}"</span>`) - 1;
        return `__SPEECH_${idx}__`;
    });

    // 2. Acciones: *texto* -> <span class="action">
    out = out.replace(/\*(.*?)\*/g, (m, p1) => `<span class="action">${safeEscape(p1)}</span>`);

    // 3. Rumores: Detectar sobre el texto restante (que ya no tiene asteriscos ni comillas crudas)
    const rumorRegex = /(Se dice que [^.]*\.|Dicen que [^.]*\.|[^.]*?susurra[^.]*\.|[^.]*?comentaba que[^.]*\.)/g;
    out = out.replace(rumorRegex, (m) => `<span class="rumor">${safeEscape(m.trim())}</span>`);

    // 4. Restaurar Diálogos
    out = out.replace(/__SPEECH_(\d+)__/g, (m, idx) => speechPlaceholders[Number(idx)]);

    // 5. Saltos de línea
    out = out.replace(/\n/g, '<br>');

    return out;
}
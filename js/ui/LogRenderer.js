/**
 * LogRenderer handles rendering the game log entries.
 */
export class LogRenderer {
    constructor(container) {
        this.container = container;
    }

    /**
     * Updates the log UI with entries from state.
     */
    update(state) {
        if (!this.container || (this.container.jquery && this.container.length === 0)) return;
        
        this.container.empty();
        const logs = [...state.gameLog].reverse(); // Most recent first
        
        logs.forEach(log => {
            const time = `${log.cycle}:${log.dayTime}`;
            const entry = $('<div>', { 
                class: `log-entry log-${log.type} mb-2 p-2 border-l-2 border-opacity-50` 
            });
            
            // Style by type
            if (log.type === 'lore') {
                entry.addClass('border-chlorine-light bg-chlorine bg-opacity-10');
            } else if (log.type === 'system') {
                entry.addClass('border-gray-500 bg-gray-800 bg-opacity-20');
            } else if (log.type === 'note') {
                entry.addClass('border-yellow-600 bg-yellow-900 bg-opacity-10');
            }
            
            entry.append($('<span>', { class: 'text-xs opacity-50 mr-2', text: `[${time}]` }));
            entry.append($('<span>', { class: 'log-text', text: log.text }));
            
            this.container.append(entry);
        });
    }
}

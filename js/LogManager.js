import { CONSTANTS } from './Constants.js';

export class LogManager {
    constructor(state) {
        this.state = state;
        this.listeners = [];
        
        // Ensure legacy gameLog exists
        if (!this.state.gameLog) this.state.gameLog = [];
        
        // Ensure new logs exist
        if (!this.state.rumorLog) this.state.rumorLog = [];
        if (!this.state.loreLog) this.state.loreLog = [];
    }

    addEntry(type, text, meta = {}) {
        const entry = {
            cycle: this.state.cycle || 1,
            dayTime: this.state.dayTime || 1,
            type, // 'lore', 'system', 'note', 'rumor', 'danger', 'warning'
            text,
            timestamp: Date.now(),
            meta,
            isNew: true
        };

        // Categorize
        if (type === 'rumor') {
            this.state.rumorLog.unshift(entry); // Newest first
        } else if (type === 'lore' || type === 'note') {
            this.state.loreLog.unshift(entry);
            // Also add to main log for visibility? Maybe not if we want separation.
            // Let's add to main log too but mark it.
            this.state.gameLog.unshift(entry);
        } else {
            this.state.gameLog.unshift(entry);
        }

        // Limit size
        if (this.state.gameLog.length > 50) this.state.gameLog.pop();
        if (this.state.rumorLog.length > 20) this.state.rumorLog.pop();
        if (this.state.loreLog.length > 20) this.state.loreLog.pop();

        this.notifyListeners(type, entry);
    }

    onLogAdded(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(type, entry) {
        this.listeners.forEach(cb => cb(type, entry));
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('log-added', { detail: { type, entry } }));
        }
    }

    getLogs(category = 'all') {
        if (category === 'rumor') return this.state.rumorLog;
        if (category === 'lore') return this.state.loreLog;
        return this.state.gameLog;
    }
}

import { LoreData } from './LoreData.js';
import { State } from './State.js';
import { CONSTANTS } from './Constants.js';

export class LoreManager {
    constructor(uiManager, audioManager) {
        this.ui = uiManager;
        this.audio = audioManager;
        this.elements = {
            title: $('#lore-screen-title'),
            content: $('#lore-screen-content'),
            panel: $('#screen-lore .lore-panel'),
            continueBtn: $('#btn-lore-continue-screen')
        };
    }

    showLore(type, onClose, options = {}) {
        const data = LoreData[type];
        if (!data && type !== 'intermediate') return;

        let titleText = '';
        let contentHtml = '';
        let audioKey = null;
        let sfxKey = null;
        let isDanger = false;
        let isCalm = false;

        this.elements.title.removeClass('text-alert glitch-effect text-blue-400');
        this.elements.panel.removeClass('animate__fadeIn lore-danger lore-calm');

        if (type === 'intermediate') {
            const variants = LoreData.intermediate.variants;
            const pick = variants[Math.floor(Math.random() * variants.length)];
            titleText = LoreData.intermediate.title;

            const icon = this.getIconForKind(pick.kind);
            const label = this.getLabelForKind(pick.kind);
            contentHtml = `<p class="mb-2"><i class="fa-solid ${icon} mr-2"></i><span class="font-bold">${label}</span></p><p>${pick.text}</p>`;

            this.playIntermediateAudio(pick.kind);
            State.addLogEntry('lore', `${label}: ${pick.text}`, { icon: icon });
            // Notificar bitácora
            this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.LOG, 2);
        } else {
            titleText = data.title;
            contentHtml = data.content;

            // Reemplazar variables dinámicas (como {loreName})
            if (options.loreName) {
                contentHtml = contentHtml.replace(/{loreName}/g, options.loreName);
            } else if (this.ui.game && this.ui.game.endings && this.ui.game.endings.loreNPCName) {
                // Fallback a endings manager
                contentHtml = contentHtml.replace(/{loreName}/g, this.ui.game.endings.loreNPCName);
            }

            // Convertir saltos de línea en <br> para renderizado HTML
            contentHtml = contentHtml.replace(/\n/g, '<br>');

            audioKey = data.audio;
            sfxKey = data.sfx;
            isDanger = data.type === 'danger';
            isCalm = data.type === 'calm';

            // Reproducir música de lore si tiene, o simplemente atenuar ambiente
            if (this.audio) {
                if (audioKey) {
                    this.audio.playLoreByKey(audioKey, { loop: true, volume: 0.25, duckAmbient: true });
                } else {
                    this.audio.duckAmbient(0.1, 800);
                }
            }
            if (sfxKey && this.audio) {
                this.audio.playSFXByKey(sfxKey, { volume: 0.5 });
            }

            // Registrar en Bitácora
            State.addLogEntry('lore', `Archivo desbloqueado: ${titleText}`);
            // Notificar bitácora
            this.ui.setNavItemStatus(CONSTANTS.NAV_ITEMS.LOG, 2);
        }

        if (isDanger) {
            this.elements.title.addClass('text-alert glitch-effect').attr('data-text', titleText);
            this.elements.panel.addClass('animate__fadeIn lore-danger');
            $('#screen-lore').addClass('bg-red-950/80').removeClass('bg-black/80');
        } else {
            this.elements.title.addClass('text-blue-400');
            $('#screen-lore').addClass('bg-black/80').removeClass('bg-red-950/80');
        }
        if (isCalm) {
            this.elements.panel.addClass('lore-calm');
        }

        this.elements.title.text(titleText);
        this.elements.content.html(contentHtml);

        this.ui.showScreen('lore');

        this.elements.continueBtn.off('click').on('click', () => {
            if (this.audio) {
                this.audio.stopLore({ fadeOut: this.ui.timings.loreFadeOut });
            }
            if (onClose) onClose();
            else this.ui.showScreen('game');
        });
    }

    getIconForKind(kind) {
        const icons = {
            radio: 'fa-tower-broadcast',
            vista: 'fa-eye',
            oido: 'fa-ear-listen',
            registro: 'fa-book-open'
        };
        return icons[kind] || 'fa-book-open';
    }

    getLabelForKind(kind) {
        const labels = {
            radio: 'RADIO',
            vista: 'VISTO',
            oido: 'ESCUCHADO',
            registro: 'REGISTRO'
        };
        return labels[kind] || 'REGISTRO';
    }

    playIntermediateAudio(kind) {
        if (!this.audio) return;
        const audioMap = {
            radio: 'lore_interlude_radio',
            vista: 'lore_interlude_seen',
            oido: 'lore_interlude_heard'
        };
        const key = audioMap[kind];
        if (key) {
            this.audio.playLoreByKey(key, { loop: true, volume: 0.22, crossfade: 1000 });
        }
    }
}

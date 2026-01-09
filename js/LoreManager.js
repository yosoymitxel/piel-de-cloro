import { LoreData } from './LoreData.js';
import { State } from './State.js';

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

    showLore(type, onClose) {
        const data = LoreData[type];
        if (!data && type !== 'intermediate') return;

        let titleText = '';
        let contentHtml = '';
        let audioKey = null;
        let sfxKey = null;
        let isDanger = false;
        let isCalm = false;

        this.elements.title.removeClass('text-alert glitch-effect');
        this.elements.panel.removeClass('animate__shakeX lore-danger lore-calm');

        if (type === 'intermediate') {
            const variants = LoreData.intermediate.variants;
            const pick = variants[Math.floor(Math.random() * variants.length)];
            titleText = LoreData.intermediate.title;

            const icon = this.getIconForKind(pick.kind);
            const label = this.getLabelForKind(pick.kind);
            contentHtml = `<p class="mb-2"><i class="fa-solid ${icon} mr-2"></i><span class="font-bold">${label}</span></p><p>${pick.text}</p>`;

            this.playIntermediateAudio(pick.kind);
            State.addLogEntry('lore', `${label}: ${pick.text}`, { icon: icon });
        } else {
            titleText = data.title;
            contentHtml = data.content;
            audioKey = data.audio;
            sfxKey = data.sfx;
            isDanger = data.type === 'danger';
            isCalm = data.type === 'calm';

            if (audioKey && this.audio) {
                this.audio.playLoreByKey(audioKey, { loop: false, volume: 0.22, crossfade: 600 });
            }
            if (sfxKey && this.audio) {
                this.audio.playSFXByKey(sfxKey, { volume: 0.5 });
            }

            // Registrar en Bitácora
            State.addLogEntry('lore', `Archivo desbloqueado: ${titleText}`);
        }

        if (isDanger) {
            this.elements.title.addClass('text-alert glitch-effect').attr('data-text', titleText);
            this.elements.panel.addClass('animate__shakeX lore-danger');
        }
        if (isCalm) {
            this.elements.panel.addClass('lore-calm');
        }

        this.elements.title.text(titleText);
        this.elements.content.html(contentHtml);

        this.ui.showScreen('lore');
        if (this.audio) this.audio.duckAmbient(0.12);

        this.elements.continueBtn.off('click').on('click', () => {
            if (this.audio) {
                this.audio.stopLore({ fadeOut: this.ui.timings.loreFadeOut });
                this.audio.unduckAmbient(300, 0.28);
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
            this.audio.playLoreByKey(key, { loop: false, volume: 0.22, crossfade: 500 });
        }
    }
}

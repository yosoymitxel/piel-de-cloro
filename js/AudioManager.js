export class AudioManager {
    constructor() {
        this.master = 1.0;
        this.channels = {
            ambient: this.createChannel({ loop: true, volume: 0.3 }),
            lore: this.createChannel({ loop: true, volume: 0.25 }),
            sfx: this.createChannel({ loop: false, volume: 0.6 })
        };
        this.unlocked = false;
        this.fadeTimers = {};
        this.logs = [];
        this.enableConsole = false; // Desactivado temporalmente
        this.desiredPlay = { ambient: false, lore: false, sfx: false };
        this.ctx = null;
        this.manifest = {};
        this.levels = { ambient: 0.3, lore: 0.25, sfx: 0.6 };
        this.sfxLockUntil = 0;
        this.sfxPriority = 0;
        this.attachDiagnostics();
    }
    createChannel({ loop = false, volume = 1.0 } = {}) {
        const audio = new Audio();
        audio.loop = loop;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';
        audio.volume = 0;
        return audio;
    }
    attachDiagnostics() {
        Object.entries(this.channels).forEach(([name, audio]) => {
            const log = (evt, extra = {}) => this.log(`[${name}] ${evt}`, extra);
            audio.addEventListener('loadstart', () => log('loadstart'));
            audio.addEventListener('canplay', () => log('canplay'));
            audio.addEventListener('canplaythrough', () => log('canplaythrough'));
            audio.addEventListener('play', () => log('play'));
            audio.addEventListener('pause', () => log('pause'));
            audio.addEventListener('ended', () => log('ended'));
            audio.addEventListener('stalled', () => log('stalled'));
            audio.addEventListener('suspend', () => log('suspend'));
            audio.addEventListener('waiting', () => log('waiting'));
            audio.addEventListener('error', () => {
                const err = audio.error;
                log('error', { code: err?.code, message: err?.message });
            });
            const resumeIfDesired = () => {
                if (this.desiredPlay[name] && audio.paused) {
                    audio.play().then(() => this.log(`[${name}] auto-resume ok`)).catch(e => this.log(`[${name}] auto-resume failed`, { error: e?.message }));
                }
            };
            audio.addEventListener('pause', resumeIfDesired);
            audio.addEventListener('suspend', resumeIfDesired);
            audio.addEventListener('waiting', resumeIfDesired);
        });
    }
    async validateManifest() {
        const keys = Object.keys(this.manifest).length ? Object.keys(this.manifest) : [];
        const list = keys.length ? keys : [
            'ambient_main_loop','ambient_night_loop','ambient_tense_loop',
            'lore_intro_track','lore_interlude_radio','lore_interlude_seen','lore_interlude_heard',
            'lore_final_clean','lore_final_corrupted','lore_night_civil_death','lore_night_player_death','lore_night_tranquil',
            'ui_button_click','ui_modal_open','ui_modal_close','ui_dialogue_type','stats_panel_open',
            'tool_thermometer_beep','tool_uv_toggle','tool_pulse_beep','tool_pupils_lens',
            'alarm_activate','alarm_deactivate','intrusion_detected',
            'door_secure','door_unsecure','window_secure','window_unsecure','pipes_whisper',
            'purge_confirm','purge_blood_flash','night_transition','sleep_begin','escape_attempt',
            'dayafter_test_apply','validation_gate_open','preclose_overlay_open',
            'glitch_burst','vhs_flicker','morgue_reveal_infected'
        ];
        const results = [];
        for (const key of list) {
            const url = this.getUrl(key);
            try {
                const res = await fetch(url, { method: 'HEAD' });
                results.push(`${key}: ${res.ok ? 'OK' : 'NO ENCONTRADO'} (${url})`);
            } catch {
                results.push(`${key}: ERROR (${url})`);
            }
        }
        return results.join('\n');
    }
    log(msg, data = null) {
        const stamp = new Date().toISOString();
        const line = data ? `${stamp} ${msg} ${JSON.stringify(data)}` : `${stamp} ${msg}`;
        this.logs.push(line);
        if (this.enableConsole) console.info('[Audio]', line);
        if (this.logs.length > 200) this.logs.splice(0, this.logs.length - 200);
    }
    getLogs() { return [...this.logs]; }
    getLogString() {
        if (this.logs.length === 0) return 'Sin eventos de audio registrados.';
        return this.logs.slice(-30).join('\n');
    }
    clearLogs() { this.logs = []; }
    async loadManifest(url = 'assets/audio/audio_manifest.json') {
        try {
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.manifest = data || {};
            this.log('manifest loaded', { entries: Object.keys(this.manifest).length });
        } catch (e) {
            this.log('manifest load failed', { error: e?.message });
            this.manifest = {};
        }
    }
    getUrl(key) {
        return this.manifest[key] || `assets/audio/${key}.mp3`;
    }
    stopChannel(name, fadeOut = 300) {
        const ch = this.channels[name];
        if (!ch) return;
        const key = name;
        const done = () => { ch.pause(); this.log(`[${name}] paused`); };
        if (!ch.paused && (ch.volume ?? 0) > 0) {
            this.fade(ch, 0, fadeOut, key, done);
        } else {
            done();
        }
        this.desiredPlay[name] = false;
    }
    stopAmbient(ms = 300) { this.stopChannel('ambient', ms); }
    stopLore(ms = 300) { this.stopChannel('lore', ms); }
    ensureAmbientPlaying() {
        const ch = this.channels.ambient;
        if (!ch) return;
        if (ch.paused && ch.src) {
            ch.play().then(() => this.log('[ambient] resume ok')).catch(e => this.log('[ambient] resume failed', { error: e?.message }));
        }
    }
    setChannelLevel(name, v) {
        if (!this.levels[name]) this.levels[name] = 0.3;
        this.levels[name] = Math.max(0, Math.min(1, v));
        if (this.channels[name]) {
            this.channels[name].volume = this.levels[name] * this.master;
        }
    }
    unlock() {
        if (this.unlocked) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
            Object.values(this.channels).forEach(a => { a.muted = false; });
            this.unlocked = true;
        } catch {
            this.unlocked = true;
        }
    }
    setMasterVolume(v) {
        this.master = Math.max(0, Math.min(1, v));
        this.channels.ambient.volume = this.levels.ambient * this.master;
        this.channels.lore.volume = this.levels.lore * this.master;
        this.channels.sfx.volume = this.levels.sfx * this.master;
    }
    playAmbient(src, { loop = true, volume = 0.3, fadeIn = 0 } = {}) {
        if (this.desiredPlay.lore) this.stopLore(Math.max(200, fadeIn));
        this.desiredPlay.ambient = true;
        const ch = this.channels.ambient;
        ch.loop = loop;
        if (ch.src !== src) ch.src = src;
        if (fadeIn > 0) {
            ch.volume = 0;
            ch.play().then(() => this.log('[ambient] play ok')).catch(e => this.log('[ambient] play failed', { error: e?.message }));
            this.fade(ch, Math.max(0, Math.min(1, volume)) * this.master, fadeIn, 'ambient');
            this.levels.ambient = Math.max(0, Math.min(1, volume));
        } else {
            ch.volume = Math.max(0, Math.min(1, volume)) * this.master;
            ch.play().then(() => this.log('[ambient] play ok')).catch(e => this.log('[ambient] play failed', { error: e?.message }));
            this.levels.ambient = Math.max(0, Math.min(1, volume));
        }
    }
    playAmbientByKey(key, opts = {}) {
        return this.playAmbient(this.getUrl(key), opts);
    }
    duckAmbient(target = 0.15, ms = 400) {
        this.fade(this.channels.ambient, Math.max(0, Math.min(1, target)) * this.master, ms, 'ambient');
    }
    unduckAmbient(ms = 400, restore = 0.3) {
        this.ensureAmbientPlaying();
        this.fade(this.channels.ambient, Math.max(0, Math.min(1, restore)) * this.master, ms, 'ambient');
    }
    playLore(src, { loop = true, volume = 0.25, crossfade = 600 } = {}) {
        this.stopAmbient(Math.max(200, crossfade));
        this.desiredPlay.lore = true;
        const ch = this.channels.lore;
        ch.loop = loop;
        if (ch.src !== src) ch.src = src;
        ch.volume = 0;
        ch.play().then(() => this.log('[lore] play ok')).catch(e => this.log('[lore] play failed', { error: e?.message }));
        this.fade(ch, Math.max(0, Math.min(1, volume)) * this.master, crossfade, 'lore');
        this.levels.lore = Math.max(0, Math.min(1, volume));
    }
    playLoreByKey(key, opts = {}) {
        return this.playLore(this.getUrl(key), opts);
    }
    stopLore({ fadeOut = 400 } = {}) {
        const ch = this.channels.lore;
        this.fade(ch, 0, fadeOut, 'lore', () => { ch.pause(); this.log('[lore] paused'); });
        this.desiredPlay.lore = false;
    }
    playSFX(src, { volume = 0.6, rate = 1.0, priority = 0, lockMs = 300 } = {}) {
        // Interrupt previous short SFX to avoid overlap on rapid clicks
        const ch = this.channels.sfx;
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (now < this.sfxLockUntil && priority < this.sfxPriority) {
            this.log('[sfx] suppressed by lock', { until: this.sfxLockUntil, priority });
            return;
        }
        if (ch && !ch.paused) { try { ch.pause(); } catch {} }
        this.sfxPriority = priority;
        this.sfxLockUntil = now + Math.max(50, lockMs);
        this.desiredPlay.sfx = true;
        ch.src = src;
        ch.playbackRate = rate;
        ch.volume = Math.max(0, Math.min(1, volume)) * this.master;
        ch.currentTime = 0;
        ch.play().then(() => this.log('[sfx] play ok')).catch(e => this.log('[sfx] play failed', { error: e?.message }));
        setTimeout(() => { this.desiredPlay.sfx = false; }, 300);
        this.levels.sfx = Math.max(0, Math.min(1, volume));
    }
    playSFXByKey(key, opts = {}) {
        return this.playSFX(this.getUrl(key), opts);
    }
    playEvent(name, opts = {}) {
        const map = {
            purge: 'purge_confirm',
            glitch: 'glitch_burst',
            vhs: 'vhs_flicker',
            intrusion: 'intrusion_detected',
            alarm_on: 'alarm_activate',
            alarm_off: 'alarm_deactivate'
        };
        const key = map[name] || name;
        return this.playSFXByKey(key, opts);
    }
    fade(audio, target, ms, key, onDone) {
        if (!audio) return;
        target = Math.max(0, Math.min(1, target));
        const start = audio.volume || 0;
        const delta = target - start;
        const token = { cancel: false, id: null };
        if (this.fadeTimers[key] && this.fadeTimers[key].id != null) {
            this.fadeTimers[key].cancel = true;
        }
        this.fadeTimers[key] = token;
        const startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const step = (now) => {
            if (token.cancel) return;
            const t = Math.max(0, Math.min(1, (now - startTime) / Math.max(1, ms)));
            audio.volume = start + delta * t;
            if (t >= 1) {
                audio.volume = target;
                this.fadeTimers[key] = null;
                if (onDone) onDone();
                return;
            }
            token.id = requestAnimationFrame(step);
        };
        token.id = requestAnimationFrame(step);
    }
}

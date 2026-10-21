import { State } from './State.js';

export class AvatarRenderer {
    static render(npc, sizeClass = 'lg', modifier = 'normal') {
        // Probabilidades dinámicas basadas en estado del jugador
        const paranoiaFactor = (State.paranoia || 0) / 400; // Hasta 0.25 a 100 paranoia
        const sanityFactor = (100 - (State.sanity || 100)) / 400; // Hasta 0.25 a 0 cordura
        // La señal depende de variables visibles del jugador, no de la infección oculta.
        const errorChance = Math.min(0.5, paranoiaFactor + sanityFactor);
        // Keep the signal stable across rerenders: the same NPC must not flicker
        // between states just because React/jQuery rebuilt the portrait.
        const identity = String(npc.id || npc.name || 'unknown');
        let identityHash = 2166136261;
        for (let i = 0; i < identity.length; i += 1) {
            identityHash = Math.imul(identityHash ^ identity.charCodeAt(i), 16777619);
        }
        const stableRoll = (identityHash >>> 0) / 4294967296;
        const statusText = stableRoll < errorChance ? 'SIGNAL_ERR' : 'SIG_STABLE';

        // claude-pxl portraits are optional build-time assets. The existing
        // procedural avatar remains the fallback when pixel mode or an asset is absent.
        const pixelArtEnabled = typeof document !== 'undefined' &&
            document.documentElement?.dataset?.art === 'pixel';
        const lorePortraits = {
            lore_archivist: 'npc_archivist',
            lore_kael: 'npc_kael',
            lore_hive: 'npc_hive',
            lore_patient_zero: 'npc_patient_zero'
        };
        // Los NPC genéricos comparten retrato neutral: el arte no debe revelar infección.
        const portraitName = lorePortraits[npc.loreId] || 'npc_human';
        const pixelPortraitHTML = pixelArtEnabled
            ? `<img class="npc-pixel-portrait" src="assets/pixel/npcs/sprites/${portraitName}.png" alt="" aria-hidden="true" onload="this.parentElement.classList.add('has-pixel-portrait')" onerror="this.parentElement.classList.remove('has-pixel-portrait'); this.remove()">`
            : '';

        let accessoryHTML = '';
        if (npc.visualFeatures.accessory !== 'none') {
            accessoryHTML = `
                <div class="avatar-accessory">
                    <div class="acc-${npc.visualFeatures.accessory}"></div>
                </div>
            `;
        }

        let facialHairHTML = '';
        if (npc.visualFeatures.facialHair && npc.visualFeatures.facialHair !== 'none') {
            facialHairHTML = `<div class="facial-hair ${npc.visualFeatures.facialHair}"></div>`;
        }

        const html = `
            <div class="npc-view-container ${sizeClass === 'sm' ? 'view-sm' : ''} ${modifier === 'perimeter' ? 'view-perimeter' : ''} ${statusText === 'SIGNAL_ERR' ? 'npc-infected-presence' : ''}">
                <!-- Industrial Frame -->
                <div class="npc-frame-corner npc-frame-tl"></div>
                <div class="npc-frame-corner npc-frame-tr"></div>
                <div class="npc-frame-corner npc-frame-bl"></div>
                <div class="npc-frame-corner npc-frame-br"></div>
                
                <!-- CRT Glass & Scanlines -->
                <div class="npc-crt-glass"></div>
                <div class="npc-scanlines"></div>
                <div class="npc-vignette"></div>
                
                <!-- Noise and Glitch Overlays -->
                <div class="npc-noise-overlay"></div>
                <div class="npc-glitch-layer"></div>

                <!-- NPC Content Area -->
                <div class="npc-content-wrapper ${pixelArtEnabled ? 'has-pixel-portrait' : ''}">
                    ${pixelPortraitHTML}
                    <div class="pixel-avatar ${sizeClass} ${npc.isInfected ? 'infected' : ''} ${npc.loreId ? 'lore-' + npc.loreId.replace('lore_', '') : ''} state-${modifier}">
                        <div class="avatar-body ${npc.visualFeatures.clothes || 'civilian'}">
                            <div class="clothes-detail"></div>
                        </div>
                        <div class="avatar-neck" style="background-color: ${npc.visualFeatures.skinColor};"></div>
                        <div class="avatar-head" style="background-color: ${npc.visualFeatures.skinColor};">
                            <div class="avatar-eyes ${npc.visualFeatures.eyeType}">
                                <div class="eye"></div>
                                <div class="eye"></div>
                            </div>
                            ${facialHairHTML}
                            <div class="avatar-mouth ${npc.visualFeatures.mouthType}"></div>
                        </div>
                        <div class="avatar-hair">
                            <div class="hair-style ${npc.visualFeatures.hair}"></div>
                        </div>
                        ${accessoryHTML}
                    </div>
                </div>

                <!-- HUD Overlays -->
                <div class="npc-hud-overlay">
                    <div class="npc-id-tag">ID_${npc.name.split(' ')[0].toUpperCase()}_${npc.gender.charAt(0).toUpperCase()}</div>
                    <div class="npc-status-bit">${statusText}</div>
                </div>
            </div>
        `;
        
        return $(html);
    }
}

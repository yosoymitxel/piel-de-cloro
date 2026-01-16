import { State } from './State.js';

export class AvatarRenderer {
    static render(npc, sizeClass = 'lg', modifier = 'normal') {
        // Probabilidades dinámicas basadas en estado del jugador
        const paranoiaFactor = (State.paranoia || 0) / 400; // Hasta 0.25 a 100 paranoia
        const sanityFactor = (100 - (State.sanity || 100)) / 400; // Hasta 0.25 a 0 cordura
        const infectedFactor = npc.isInfected ? 0.1 : 0; // 10% base si está infectado
        
        const errorChance = Math.min(0.8, infectedFactor + paranoiaFactor + sanityFactor);
        const statusText = Math.random() < errorChance ? 'SIGNAL_ERR' : 'SIG_STABLE';

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
                <div class="npc-content-wrapper">
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

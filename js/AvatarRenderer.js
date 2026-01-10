export class AvatarRenderer {
    static render(npc, sizeClass = 'lg', modifier = 'normal') {
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
            <div class="pixel-avatar ${sizeClass} ${npc.isInfected ? 'infected' : ''} state-${modifier}">
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
        `;
        
        return $(html);
    }
}

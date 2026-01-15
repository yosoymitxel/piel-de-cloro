
import { AvatarRenderer } from '../js/AvatarRenderer.js';
import { State } from '../js/State.js';
import { NPC } from '../js/NPC.js';

describe('AvatarRenderer', () => {
    beforeAll(() => {
        // Mock jQuery-like constructor for static render call
        global.$ = jest.fn((html) => ({
            html: () => html,
            addClass: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis()
        }));
    });

    beforeEach(() => {
        State.reset();
    });

    test('static render returns a jQuery-wrapped HTML string', () => {
        const npc = new NPC(0);
        const el = AvatarRenderer.render(npc, 'sm', 'normal');

        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('npc-view-container'));
        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('view-sm'));
        expect(el).toBeDefined();
    });

    test('renders accessory if present', () => {
        const npc = new NPC(0);
        npc.visualFeatures.accessory = 'glasses';
        AvatarRenderer.render(npc);

        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('avatar-accessory'));
        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('acc-glasses'));
    });

    test('renders facial hair if present', () => {
        const npc = new NPC(0);
        npc.visualFeatures.facialHair = 'beard';
        AvatarRenderer.render(npc);

        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('facial-hair beard'));
    });

    test('infected presence class added based on paranoia', () => {
        const npc = new NPC(0);
        State.paranoia = 100; // High paranoia increases error chance

        // Mock random to be high so we trigger SIGNAL_ERR
        const spy = jest.spyOn(Math, 'random').mockReturnValue(0.01);

        AvatarRenderer.render(npc);

        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('npc-infected-presence'));
        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('SIGNAL_ERR'));

        spy.mockRestore();
    });

    test('infected NPCs get infected class in pixel-avatar', () => {
        const npc = new NPC(1); // 100% infected
        npc.isInfected = true;

        AvatarRenderer.render(npc);

        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('pixel-avatar'));
        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('infected'));
    });

    test('perimeter variant applies correct CSS classes', () => {
        const npc = new NPC(0);
        AvatarRenderer.render(npc, 'lg', 'perimeter');

        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('view-perimeter'));
        expect(global.$).toHaveBeenCalledWith(expect.stringContaining('state-perimeter'));
    });
});

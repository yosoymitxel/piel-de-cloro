
import { State } from '../js/State.js';
import { UIManager } from '../js/UIManager.js';
import { jest } from '@jest/globals';

describe('Hierarchical Log and Rumors Tab (Phase 3.4)', () => {
    let ui;

    beforeEach(() => {
        // Mock jQuery
        global.$ = jest.fn((selector) => ({
            empty: jest.fn().mockReturnThis(),
            append: jest.fn().mockReturnThis(),
            addClass: jest.fn().mockReturnThis(),
            removeClass: jest.fn().mockReturnThis(),
            removeAttr: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            toggleClass: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnValue(false),
            css: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
            off: jest.fn().mockReturnThis(),
            scrollTop: jest.fn().mockReturnThis(),
            text: jest.fn().mockReturnThis(),
            html: jest.fn().mockReturnThis(),
            first: jest.fn().mockReturnThis(),
            parent: jest.fn().mockReturnThis(),
            val: jest.fn().mockReturnThis(),
            prop: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            length: 1,
            0: { scrollHeight: 100 }
        }));

        State.reset();
        ui = new UIManager();

        // Setup elements mock specifically for the rendering
        ui.elements.logContainer = { empty: jest.fn(), append: jest.fn(), scrollTop: jest.fn(), 0: { scrollHeight: 100 } };
        ui.elements.rumorsContainer = { empty: jest.fn(), append: jest.fn(), scrollTop: jest.fn(), 0: { scrollHeight: 100 } };
    });

    test('renderLog should segregate events and rumors', () => {
        State.gameLog = [
            { type: 'danger', text: 'Critical failure', cycle: 1, dayTime: 1 }
        ];
        State.rumorLog = [
            { type: 'rumor', text: 'I heard something...', cycle: 1, dayTime: 1 }
        ];
        // Ensure LogManager returns these
        State.logManager = {
            getLogs: (cat) => cat === 'rumor' ? State.rumorLog : State.gameLog
        };

        ui.renderLog(State);

        // Events should be in logContainer
        expect(ui.elements.logContainer.append).toHaveBeenCalled();
        const eventCall = ui.elements.logContainer.append.mock.calls[0][0];
        expect(eventCall).toContain('log-danger');
        expect(eventCall).toContain('Critical failure');

        // Rumors should be in rumorsContainer
        expect(ui.elements.rumorsContainer.append).toHaveBeenCalled();
        const rumorCall = ui.elements.rumorsContainer.append.mock.calls[0][0];
        expect(rumorCall).toContain('log-rumor');
        expect(rumorCall).toContain('I heard something...');
    });

    test('_createLogEntryHtml should map correct icons', () => {
        const entryDanger = { type: 'danger', text: 'Danger', cycle: 1, dayTime: 1 };
        const entryRumor = { type: 'rumor', text: 'Rumor', cycle: 1, dayTime: 1 };

        const htmlDanger = ui._createLogEntryHtml(entryDanger);
        const htmlRumor = ui._createLogEntryHtml(entryRumor);

        expect(htmlDanger).toContain('fa-skull');
        expect(htmlRumor).toContain('fa-comment-dots');
    });
});

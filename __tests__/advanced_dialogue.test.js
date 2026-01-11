import { Conversation } from '../js/DialogueEngine.js';
import { State } from '../js/State.js';

describe('Advanced Dialogue System', () => {
    let mockNPC;
    let mockDialogueSet;

    beforeEach(() => {
        State.reset();
        mockNPC = {
            name: 'Test NPC',
            isInfected: false,
            getDisplayName: () => 'Test NPC'
        };

        mockDialogueSet = {
            id: 'test_pool',
            root: 'start',
            nodes: {
                'start': {
                    id: 'start',
                    text: 'Hello {npcName}. Paranoia is {paranoia}.',
                    options: [
                        { id: 'opt1', label: 'Ask about rumors', next: 'rumor_node' },
                        { id: 'opt2', label: 'Set a flag', next: 'flag_node', sets: ['test_flag'] }
                    ]
                },
                'rumor_node': {
                    id: 'rumor_node',
                    text: 'I heard a rumor: {rumor}',
                    options: [
                        { id: 'back', label: 'Go back', next: 'start' }
                    ]
                },
                'flag_node': {
                    id: 'flag_node',
                    text: 'Flag set.',
                    options: [
                        { id: 'secret', label: 'Secret Option', next: null, requires: ['test_flag'] }
                    ]
                },
                'end': {
                    id: 'end',
                    text: 'Goodbye.',
                    options: []
                }
            }
        };
    });

    test('Template injection works correctly', () => {
        State.paranoia = 25;
        const conv = new Conversation(mockNPC, mockDialogueSet);
        const node = conv.getCurrentNode();
        
        expect(node.text).toBe('Hello Test NPC. Paranoia is 25%.');
    });

    test('Rumor injection works and logs the rumor', () => {
        State.getRandomRumor = jest.fn().mockReturnValue('The fog is coming.');
        const conv = new Conversation(mockNPC, mockDialogueSet);
        
        // Go to rumor node
        conv.getNextDialogue('opt1');
        const node = conv.getCurrentNode();
        
        expect(node.text).toContain('The fog is coming.');
        expect(State.gameLog.some(entry => entry.text.includes('The fog is coming.'))).toBe(true);
    });

    test('Flag setting and requirements work', () => {
        const conv = new Conversation(mockNPC, mockDialogueSet);
        
        // Try to access secret option without flag
        conv.currentId = 'flag_node';
        const nodeBefore = conv.getCurrentNode();
        const secretOpt = nodeBefore.options.find(o => o.id === 'secret');
        
        const result = conv.getNextDialogue('secret');
        expect(result.error).toBe('Requisitos no satisfechos');

        // Set flag via option
        conv.currentId = 'start';
        conv.getNextDialogue('opt2');
        expect(State.hasFlag('test_flag')).toBe(true);

        // Now secret option should work
        conv.currentId = 'flag_node';
        const resultAfter = conv.getNextDialogue('secret');
        expect(resultAfter.end).toBe(true);
    });

    test('Dialogue memory is recorded', () => {
        const conv = new Conversation(mockNPC, mockDialogueSet);
        conv.getNextDialogue('opt1');
        
        expect(State.dialogueMemory.length).toBe(1);
        expect(State.dialogueMemory[0]).toMatchObject({
            npc: 'Test NPC',
            node: 'start',
            choice: 'opt1'
        });
    });

    test('Glitch effect triggers at high paranoia', () => {
        State.paranoia = 90;
        const conv = new Conversation(mockNPC, mockDialogueSet);
        const node = conv.getCurrentNode();
        
        // With 90 paranoia, text should be glitched (contain characters from glitchedChars)
        // Original text: "Hello Test NPC. Paranoia is 90%."
        // We check if it contains any of the glitched characters defined in DialogueEngine
        const glitchedChars = ['$', '#', '@', '&', '%', '!', '?', '¿', '¡', '·', '=', '+', ':', ';', '0', '1'];
        const hasGlitchedChar = glitchedChars.some(char => node.text.includes(char));
        
        expect(hasGlitchedChar).toBe(true);
    });
});

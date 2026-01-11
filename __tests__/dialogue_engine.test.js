
import { Conversation, selectDialogueSet } from '../js/DialogueEngine.js';
import { State } from '../js/State.js';

describe('DialogueEngine', () => {
    let mockNPC;
    let mockDialogueSet;

    beforeEach(() => {
        State.reset();
        mockNPC = {
            name: 'Test NPC',
            getDisplayName: jest.fn().mockReturnValue('Test NPC Display')
        };
        mockDialogueSet = {
            id: 'test_set',
            root: 'start',
            nodes: {
                start: {
                    id: 'start',
                    text: 'Hello {npcName}, paranoia is {paranoia}.',
                    options: [
                        { id: 'opt1', label: 'Option 1', next: 'end' },
                        { id: 'opt2', label: 'Option 2', next: null }
                    ]
                },
                end: {
                    id: 'end',
                    text: 'Goodbye.',
                    options: []
                }
            }
        };
    });

    describe('Conversation', () => {
        test('constructor marks dialogue as used', () => {
            const spy = jest.spyOn(State, 'markDialogueUsed');
            new Conversation(mockNPC, mockDialogueSet);
            expect(spy).toHaveBeenCalledWith('test_set');
        });

        test('getCurrentNode injects templates correctly', () => {
            State.paranoia = 50;
            const conv = new Conversation(mockNPC, mockDialogueSet);
            const node = conv.getCurrentNode();
            
            expect(node.text).toContain('Test NPC Display');
            expect(node.text).toContain('50%');
        });

        test('getNextDialogue progresses to next node', () => {
            const conv = new Conversation(mockNPC, mockDialogueSet);
            const result = conv.getNextDialogue('opt1');
            
            expect(result.node.id).toBe('end');
            expect(conv.currentId).toBe('end');
            expect(conv.history).toHaveLength(1);
            expect(conv.history[0].choiceId).toBe('opt1');
        });

        test('getNextDialogue handles end of conversation', () => {
            const conv = new Conversation(mockNPC, mockDialogueSet);
            const result = conv.getNextDialogue('opt2');
            
            expect(result.end).toBe(true);
            expect(conv.currentId).toBeNull();
        });

        test('getNextDialogue validates requirements', () => {
            mockDialogueSet.nodes.start.options[0].requires = 'some_flag';
            const conv = new Conversation(mockNPC, mockDialogueSet);
            
            // Should fail because flag is not set
            let result = conv.getNextDialogue('opt1');
            expect(result.error).toBeDefined();
            
            // Should succeed after setting flag
            State.setFlag('some_flag', true);
            result = conv.getNextDialogue('opt1');
            expect(result.node).toBeDefined();
        });

        test('glitch effect is applied at high paranoia', () => {
            State.paranoia = 100;
            const conv = new Conversation(mockNPC, mockDialogueSet);
            
            // Mock Math.random to ensure glitching happens
            const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
            
            const node = conv.getCurrentNode();
            // The text should contain some glitch characters from the glitchedChars array
            expect(node.text).toMatch(/[$#@&%!?¿¡·=+:;01]/);
            
            spy.mockRestore();
        });
    });

    describe('selectDialogueSet', () => {
        // Since selectDialogueSet depends on DialogueData which is imported in the file,
        // and we can't easily mock it after import in ESM, we'll rely on the fact that
        // it uses DialogueData which should be available in the test environment.
        
        test('selects a dialogue set', () => {
            const set = selectDialogueSet();
            expect(set).toBeDefined();
            expect(set.id).toBeDefined();
            expect(set.nodes).toBeDefined();
        });
    });
});

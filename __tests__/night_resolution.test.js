import { State } from '../js/State.js';

describe('Night Resolution System', () => {
    let gameMock;

    beforeEach(() => {
        State.reset();
        State.admittedNPCs = [];
        State.purgedNPCs = [];
        State.paranoia = 50;
        State.lastNight = { occurred: false, victims: 0, message: '' };

        gameMock = {
            audio: { playSFXByKey: jest.fn(), playAmbientByKey: jest.fn(), levels: { ambient: 0.5 } },
            ui: { 
                showLore: jest.fn().mockImplementation((id, cb) => {
                    console.log('MOCK EXECUTING CALLBACK FOR', id);
                    if (cb) cb();
                }), 
                updateHUD: jest.fn() 
            },
            triggerEnding: jest.fn(),
            continueDay: jest.fn()
        };
    });

    const simulateSleep = (state, game) => {
        const admitted = state.admittedNPCs;
        const count = admitted.length;
        const infectedInShelter = admitted.filter(n => n.isInfected);
        
        if (count === 0) {
            state.lastNight.message = "Dormiste sin compañía. El refugio no te protegió.";
            game.triggerEnding('night_player_death');
            return;
        }

        if (infectedInShelter.length > 0) {
            const victimIndex = admitted.findIndex(n => !n.isInfected);
            if (victimIndex > -1) {
                const victim = admitted[victimIndex];
                admitted.splice(victimIndex, 1);
                state.purgedNPCs.push(victim);
                state.lastNight.message = `Durante la noche, ${victim.name} fue asesinado.`;
                game.ui.showLore('night_civil_death', () => {
                    state.updateParanoia(30);
                });
            }
        } else {
            game.ui.showLore('night_tranquil', () => {
                state.updateParanoia(-10);
            });
        }
    };

    test('Empty shelter results in player death', () => {
        State.admittedNPCs = [];
        simulateSleep(State, gameMock);
        expect(gameMock.triggerEnding).toHaveBeenCalledWith('night_player_death');
    });

    test('Infected in shelter kills a civilian and increases paranoia', () => {
        State.admittedNPCs = [
            { name: 'Victim', isInfected: false },
            { name: 'Killer', isInfected: true }
        ];
        
        simulateSleep(State, gameMock);
        
        expect(State.admittedNPCs.length).toBe(1);
        expect(State.admittedNPCs[0].name).toBe('Killer');
        expect(State.purgedNPCs.length).toBe(1);
        expect(State.purgedNPCs[0].name).toBe('Victim');
        expect(State.paranoia).toBe(80);
    });

    test('Clean shelter reduces paranoia', () => {
        State.admittedNPCs = [
            { name: 'Human 1', isInfected: false },
            { name: 'Human 2', isInfected: false }
        ];
        
        simulateSleep(State, gameMock);
        
        expect(State.admittedNPCs.length).toBe(2);
        expect(State.paranoia).toBe(40);
        expect(gameMock.ui.showLore).toHaveBeenCalledWith('night_tranquil', expect.any(Function));
    });
});

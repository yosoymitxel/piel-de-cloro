let parseDialogueMarkup;

describe('parseDialogueMarkup', () => {
    beforeAll(async () => {
        ({ parseDialogueMarkup } = await import('../js/markup.js'));
    });

    test('converts *action* and "speech" and rumor to spans', () => {
        const input = "*Se arrastra hacia la luz*, \"El generador... ruge\", Se dice que alguien habló en la tubería.";
        const out = parseDialogueMarkup(input);
        expect(out.includes('<span class=\"action')).toBe(true);
        expect(out.includes('<span class=\"speech')).toBe(true);
        expect(out.includes('<span class=\"rumor')).toBe(true);
    });
});

import fs from 'node:fs';

const targets = [
    'js/UIManager.js',
    'js/AudioManager.js',
    'js/GameMechanicsManager.js',
    'js/GeneratorManager.js',
    'js/GameEventManager.js',
    'js/GameActionHandler.js',
    'js/AssignmentManager.js',
    'js/GuardAssignmentSystem.js',
    'js/State.js',
    'js/DialogueEngine.js',
    'js/RandomEventManager.js',
    'js/GameEndingManager.js'
];
const methodPattern = /^    (?!if\b|for\b|while\b|switch\b|catch\b)([A-Za-z_$][\w$]*)\s*\([^;\n]*\)\s*\{/gm;
const failures = [];

for (const target of targets) {
    const source = fs.readFileSync(target, 'utf8');
    const seen = new Map();
    for (const match of source.matchAll(methodPattern)) {
        const name = match[1];
        const line = source.slice(0, match.index).split('\n').length;
        if (seen.has(name)) {
            failures.push({ target, name, firstLine: seen.get(name), duplicateLine: line });
        } else {
            seen.set(name, line);
        }
    }
}

if (failures.length) {
    console.error('Duplicate method declarations found:');
    for (const failure of failures) {
        console.error('- ' + failure.target + ': ' + failure.name + ' at lines ' + failure.firstLine + ' and ' + failure.duplicateLine);
    }
    process.exitCode = 1;
} else {
    console.log('Structure check passed (' + targets.length + ' core files, no duplicate method declarations).');
}

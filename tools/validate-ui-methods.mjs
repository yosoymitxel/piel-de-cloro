import fs from 'node:fs';

const targets = ['js/UIManager.js', 'js/AudioManager.js'];
let failed = false;

for (const target of targets) {
    const source = fs.readFileSync(target, 'utf8');
    const methodPattern = /^    (?!if\b|for\b|while\b|switch\b|catch\b)([A-Za-z_$][\w$]*)\s*\([^;\n]*\)\s*\{/gm;
    const seen = new Map();
    const duplicates = [];

    for (const match of source.matchAll(methodPattern)) {
        const name = match[1];
        const line = source.slice(0, match.index).split('\n').length;
        if (seen.has(name)) {
            duplicates.push({ name, firstLine: seen.get(name), duplicateLine: line });
        } else {
            seen.set(name, line);
        }
    }

    if (duplicates.length) {
        failed = true;
        console.error('Duplicate methods found in ' + target + ':');
        for (const duplicate of duplicates) {
            console.error('- ' + duplicate.name + ': lines ' + duplicate.firstLine + ' and ' + duplicate.duplicateLine);
        }
    } else {
        console.log(target + ': ' + seen.size + ' methods, no duplicate declarations.');
    }
}

if (failed) process.exitCode = 1;

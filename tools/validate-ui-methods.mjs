import fs from 'node:fs';

const target = 'js/UIManager.js';
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
    console.error('Duplicate UIManager methods found:');
    for (const duplicate of duplicates) {
        console.error(\`- \${duplicate.name}: lines \${duplicate.firstLine} and \${duplicate.duplicateLine}\`);
    }
    process.exitCode = 1;
} else {
    console.log(\`UIManager method check passed (\${seen.size} methods, no duplicate declarations).\`);
}

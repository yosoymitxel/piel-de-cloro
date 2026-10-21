#!/usr/bin/env node
/**
 * Static integrity checks for dialogue data.
 * Runs without a browser so broken graph edges and missing callbacks fail CI.
 */
import { DialogueData } from '../js/DialogueData.js';

const errors = [];
const warnings = [];
const pools = [
    ...Object.entries(DialogueData.pools).map(([key, value]) => ({ key, value, kind: 'generic' })),
    ...DialogueData.loreSubjects.map(value => ({ key: value.id, value, kind: 'lore' }))
];

for (const { key, value: pool, kind } of pools) {
    const label = `${kind} pool "${key}"`;

    if (!pool || typeof pool !== 'object') {
        errors.push(`${label}: pool is not an object`);
        continue;
    }
    if (!pool.id || typeof pool.id !== 'string') errors.push(`${label}: missing string id`);
    if (!pool.root || typeof pool.root !== 'string') errors.push(`${label}: missing root node`);
    if (!pool.nodes || typeof pool.nodes !== 'object' || Array.isArray(pool.nodes)) {
        errors.push(`${label}: nodes must be an object`);
        continue;
    }
    if (pool.root && !pool.nodes[pool.root]) errors.push(`${label}: root "${pool.root}" does not exist`);

    const seenNodeIds = new Set();
    for (const [nodeKey, node] of Object.entries(pool.nodes)) {
        const nodeLabel = `${label}, node "${nodeKey}"`;
        if (!node || typeof node !== 'object') {
            errors.push(`${nodeLabel}: node is not an object`);
            continue;
        }
        if (!node.id || typeof node.id !== 'string') errors.push(`${nodeLabel}: missing string id`);
        else {
            if (node.id !== nodeKey) errors.push(`${nodeLabel}: key and node.id differ ("${node.id}")`);
            if (seenNodeIds.has(node.id)) errors.push(`${nodeLabel}: duplicate node id "${node.id}"`);
            seenNodeIds.add(node.id);
        }
        if (typeof node.text !== 'string' || node.text.trim() === '') {
            errors.push(`${nodeLabel}: missing player-facing text`);
        }
        if (!Array.isArray(node.options)) {
            errors.push(`${nodeLabel}: options must be an array`);
            continue;
        }

        const seenOptionIds = new Set();
        for (const option of node.options) {
            if (!option || typeof option !== 'object') {
                errors.push(`${nodeLabel}: option is not an object`);
                continue;
            }
            const optionLabel = `${nodeLabel}, option "${option.id ?? '(no id)'}"`;
            if (typeof option.id !== 'string' || !option.id.trim()) {
                errors.push(`${optionLabel}: missing string id`);
            } else if (seenOptionIds.has(option.id)) {
                errors.push(`${optionLabel}: duplicate option id`);
            } else {
                seenOptionIds.add(option.id);
            }
            if (typeof option.label !== 'string' || !option.label.trim()) {
                errors.push(`${optionLabel}: missing player-facing label`);
            }
            if (option.next != null && (typeof option.next !== 'string' || !pool.nodes[option.next])) {
                errors.push(`${optionLabel}: target node "${option.next}" does not exist`);
            }
            if (Object.hasOwn(option, 'onclick') && typeof option.onclick !== 'function') {
                errors.push(`${optionLabel}: onclick is not a function (likely a missing DialogueActions export)`);
            }
            for (const field of ['req', 'sets']) {
                if (option[field] != null && !Array.isArray(option[field])) {
                    errors.push(`${optionLabel}: ${field} must be an array when provided`);
                }
            }
        }
    }
}

const poolIds = new Set();
for (const { key, value: pool, kind } of pools) {
    if (!pool?.id) continue;
    if (poolIds.has(pool.id)) errors.push(`${kind} pool "${key}": duplicate pool id "${pool.id}"`);
    poolIds.add(pool.id);
}

if (warnings.length) {
    console.warn(warnings.map(message => `WARN ${message}`).join('\n'));
}
if (errors.length) {
    console.error(`Dialogue data validation failed with ${errors.length} error(s):\n${errors.map(message => `- ${message}`).join('\n')}`);
    process.exitCode = 1;
} else {
    console.log(`Dialogue data validation passed: ${pools.length} pools, ${pools.reduce((sum, item) => sum + Object.keys(item.value.nodes ?? {}).length, 0)} nodes.`);
}

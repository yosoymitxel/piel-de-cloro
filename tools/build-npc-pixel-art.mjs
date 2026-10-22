#!/usr/bin/env node
/**
 * Build the optional NPC pixel portraits authored with claude-pxl.
 * Requires Node >= 22.18 and network access on first npx invocation.
 * Generated PNGs are build outputs; do not hand-edit them.
 */
import { spawnSync } from 'node:child_process';
import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const args = [
  '--yes',
  'github:crsolver/claude-pxl',
  'build',
  'art/npcs.px.js',
  '--out',
  'assets/pixel/npcs'
];

const result = spawnSync('npx', args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
const outputDir = 'assets/pixel/npcs/sprites';
const requiredPortraits = [
  'npc_human.png',
  'npc_infected.png',
  'npc_archivist.png',
  'npc_kael.png',
  'npc_hive.png',
  'npc_patient_zero.png',
  'npc_lore_hive.png',
  'npc_lore_kael.png',
  'npc_lore_archivist.png',
  'npc_lore_patient_zero.png'
];
await access(outputDir);
const generatedFiles = new Set(await readdir(outputDir));
const missing = requiredPortraits.filter((name) => !generatedFiles.has(name));
if (missing.length) {
  console.error(`Portrait build incomplete. Missing PNGs: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`Validated ${requiredPortraits.length} NPC portraits in ${outputDir}/.`);

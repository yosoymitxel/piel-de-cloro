#!/usr/bin/env node
/**
 * Build the optional NPC pixel portraits authored with claude-pxl.
 * Requires Node >= 22.18 and network access on first npx invocation.
 * Generated PNGs are build outputs; do not hand-edit them.
 */
import { spawnSync } from 'node:child_process';

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
console.log('NPC pixel portraits generated in assets/pixel/npcs/.');

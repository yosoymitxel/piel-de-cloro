import { describe, expect, it } from '@jest/globals';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';

const root = resolve(process.cwd(), 'assets/pixel/environment');
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
const css = readFileSync(resolve(process.cwd(), 'css/PixelArtEnvironment.css'), 'utf8');
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const startScreen = readFileSync(resolve(process.cwd(), 'js/react/components/screens/ScreenStart.jsx'), 'utf8');
const finalScreen = readFileSync(resolve(process.cwd(), 'js/react/components/screens/ScreenFinalStats.jsx'), 'utf8');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function inspectPng(buffer) {
  expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  const idat = [];
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = -1;
  let sawHeader = false;
  let sawEnd = false;
  let offset = 8;

  while (offset < buffer.length) {
    expect(offset + 12 <= buffer.length).toBe(true);
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    expect(dataEnd + 4 <= buffer.length).toBe(true);
    const data = buffer.subarray(dataStart, dataEnd);
    const storedCrc = buffer.readUInt32BE(dataEnd);
    expect(crc32(buffer.subarray(offset + 4, dataEnd))).toBe(storedCrc);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      sawHeader = true;
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      sawEnd = true;
      offset = dataEnd + 4;
      break;
    }
    offset = dataEnd + 4;
  }

  expect(sawHeader).toBe(true);
  expect(sawEnd).toBe(true);
  expect(offset).toBe(buffer.length);
  expect(bitDepth).toBe(8);
  expect(colorType).toBe(6);
  const decoded = inflateSync(Buffer.concat(idat));
  expect(decoded.length).toBe(height * (1 + width * 4));
  return [width, height];
}

describe('environment pixel art', () => {
  it('ships every manifest PNG with intact chunks, decodable pixels and native dimensions', () => {
    expect(manifest.assets).toHaveLength(18);
    for (const asset of manifest.assets) {
      const path = resolve(process.cwd(), asset.path);
      expect(existsSync(path)).toBe(true);
      expect(inspectPng(readFileSync(path))).toEqual(asset.size);
    }
  });

  it('uses only existing native PNG assets in the CSS layer', () => {
    const references = [...css.matchAll(/url\(["']?([^"')]+\.png)["']?\)/g)].map(match => match[1]);
    expect(references.length).toBeGreaterThanOrEqual(10);
    for (const reference of new Set(references)) {
      expect(reference.startsWith('../assets/pixel/environment/')).toBe(true);
      expect(existsSync(resolve(process.cwd(), 'css', reference))).toBe(true);
    }
    for (const asset of manifest.assets) expect(css).toContain(asset.file);
    expect(css).toContain('image-rendering: pixelated');
    expect(css).toContain('prefers-reduced-motion');
    expect(css).toContain('grid-template-columns: repeat(6, minmax(0, 1fr)) !important');
  });

  it('targets real screens and the actual inspection viewport, not Phaser-only nodes', () => {
    expect(html).toContain('id="game-screen-container"');
    expect(css).toContain('#game-screen-container');
    expect(css).not.toContain('#screen-game-container');
    expect(startScreen).toContain('id="screen-start"');
    expect(finalScreen).toContain('id="screen-final-stats"');
    expect(css).toContain('#screen-start .industrial-panel');
    expect(css).toContain('#screen-final-stats .final-outcome-box');
    expect(css).not.toContain('.game-stage');
    expect(css).not.toContain('.generator-panel::after');
    expect(css).not.toContain('display: block !important');
  });
});

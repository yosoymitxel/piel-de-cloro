import { describe, expect, it } from '@jest/globals';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'assets/pixel/environment');
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
const css = readFileSync(resolve(process.cwd(), 'css/PixelArtEnvironment.css'), 'utf8');
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

function pngDimensions(buffer) {
  expect(buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

describe('environment pixel art', () => {
  it('ships every manifest PNG at its authored native dimensions', () => {
    expect(manifest.assets).toHaveLength(18);
    for (const asset of manifest.assets) {
      const path = resolve(process.cwd(), asset.path);
      expect(existsSync(path)).toBe(true);
      expect(pngDimensions(readFileSync(path))).toEqual(asset.size);
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

  it('does not introduce the Phaser-only selectors or fake generator visibility rules', () => {
    expect(html).toContain('id="game-screen-container"');
    expect(css).toContain('#game-screen-container');
    expect(css).not.toContain('#screen-game-container');
    expect(css).not.toContain('.game-stage');
    expect(css).not.toContain('.generator-panel::after');
    expect(css).not.toContain('display: block !important');
  });
});

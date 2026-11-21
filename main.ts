import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const project = fileURLToPath(new URL('./', import.meta.url));
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const game = join(project, 'game');
const screenshots = join(project, 'screenshots');

function checkScreenshotSet(directory: string): void {
  if (!existsSync(directory)) {
    throw new Error('Capture three or four browser screenshots before packaging.');
  }
  const visible = readdirSync(directory, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith('.'));
  if (visible.length < 3 || visible.length > 4) {
    throw new Error('Capture three or four browser screenshots before packaging.');
  }
  for (const entry of visible) {
    if (!entry.isFile() || entry.name.length > 128 || !/^[a-z\d_][a-z\d._-]*\.(png|jpe?g)$/i.test(entry.name)) {
      throw new Error(`Invalid screenshot file: ${entry.name}`);
    }
  }
}

function packageEntry(): void {
  checkScreenshotSet(screenshots);
  const dossier = buildDossier(project, {
    text_max_bytes: 160 * 1024,
    screenshots: { max: 4, max_bytes: 256 * 1024 },
    game_max_files: 993,
    game_max_bytes: 48 * 1024 * 1024,
    game_path_max_bytes: 1000,
  });

  mkdirSync(destination, { recursive: true });
  cpSync(game, join(destination, 'game'), { recursive: true });
  cpSync(screenshots, join(destination, 'screenshots'), {
    recursive: true,
    filter: path => path === screenshots || !path.slice(screenshots.length + 1).startsWith('.'),
  });
  writeFileSync(join(destination, 'dossier.json'), dossier);
}

packageEntry();

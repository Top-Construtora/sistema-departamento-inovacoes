import png2icons from 'png2icons';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../frontend/public/assets/favicon.png');
const out = resolve(here, 'icon.ico');

const input = readFileSync(src);
const ico = png2icons.createICO(input, png2icons.BICUBIC, 0, false, true);
if (!ico) throw new Error('Falha ao gerar .ico');
writeFileSync(out, ico);
console.log(`Wrote ${out} (${ico.length} bytes)`);

// รวมหน้าออฟฟิศเป็นไฟล์เดียว: office/index.html + office/world/* → office/office.html (ไฟล์ที่เผยแพร่เป็น Artifact)
// office/world/ คัดลอกมาจากโปรเจกต์ fst-pixel-game (game/game.js, art/out/game.json, art/out/game.png)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const w = (f) => path.join(root, 'office', 'world', f);
const json = fs.readFileSync(w('game.json'), 'utf8');
const png = fs.readFileSync(w('game.png')).toString('base64');
const js = fs.readFileSync(w('game.js'), 'utf8');
const src = fs.readFileSync(path.join(root, 'office', 'index.html'), 'utf8');
const out = src.replace('<script>/*WORLD*/</script>', () => `<script>window.SHEET=${json};window.SHEET_SRC="data:image/png;base64,${png}";</script>\n<script>${js}</script>`);
fs.writeFileSync(path.join(root, 'office', 'office.html'), out);
console.log(`office/office.html ${(out.length / 1024).toFixed(0)} KB`);

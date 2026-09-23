import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sharedDir = path.join(__dirname, 'src/shared');
const files = fs.readdirSync(sharedDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(sharedDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // replace ../../lib/utils with ../lib/utils
  content = content.replace(/..\/..\/lib\/utils/g, '../lib/utils');
  fs.writeFileSync(filePath, content);
}

const layoutDir = path.join(__dirname, 'src/components/layout');
const layoutFiles = fs.readdirSync(layoutDir).filter(f => f.endsWith('.tsx'));
for (const file of layoutFiles) {
  const filePath = path.join(layoutDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/..\/..\/lib\/utils/g, '../../lib/utils'); // check layout if they are in components/layout, then ../../lib/utils is correct
  fs.writeFileSync(filePath, content);
}

console.log('Fixed imports in shared components');

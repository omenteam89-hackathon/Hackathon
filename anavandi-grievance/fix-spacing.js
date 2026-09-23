import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uiDir = path.join(__dirname, 'src/components/ui');
const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/--spacing\(([\d.]+)\)/g, (match, p1) => {
    return `${parseFloat(p1) / 4}rem`;
  });
  fs.writeFileSync(filePath, content);
}
console.log('Fixed spacing syntax in components');

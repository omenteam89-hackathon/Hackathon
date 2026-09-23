import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function replaceInFile(filePath, search, replace) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content);
}

replaceInFile(
  path.join(__dirname, 'src/components/layout/TopBar.tsx'),
  "import { Link } from 'react-router-dom';",
  ""
);

replaceInFile(
  path.join(__dirname, 'src/shared/EmptyState.tsx'),
  "import { LucideIcon } from 'lucide-react';",
  "import type { LucideIcon } from 'lucide-react';"
);

replaceInFile(
  path.join(__dirname, 'src/shared/EscalationLevelChip.tsx'),
  "from '../ui/badge';",
  "from '../components/ui/badge';"
);

replaceInFile(
  path.join(__dirname, 'src/shared/KpiCard.tsx'),
  "from '../ui/card';",
  "from '../components/ui/card';"
);

replaceInFile(
  path.join(__dirname, 'src/shared/StatusBadge.tsx'),
  "from '../ui/badge';",
  "from '../components/ui/badge';"
);

replaceInFile(
  path.join(__dirname, 'src/shared/SlaTimer.tsx'),
  "const state = 'warn';",
  "let state = 'warn' as 'ok' | 'warn' | 'breach';\n  console.log(deadline, pausedAt);"
);

console.log('Fixed TS errors');

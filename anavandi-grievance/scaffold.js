import fs from 'fs';
import path from 'path';

const files = [
  'src/components/layout/PassengerShell.tsx',
  'src/components/layout/ConsoleShell.tsx',
  'src/components/layout/TopBar.tsx',
  'src/components/layout/SideNav.tsx',
  'src/shared/StatusBadge.tsx',
  'src/shared/CategoryIcon.tsx',
  'src/shared/EscalationLevelChip.tsx',
  'src/shared/KpiCard.tsx',
  'src/shared/MaskedPhone.tsx',
  'src/shared/Timeline.tsx',
  'src/shared/EmptyState.tsx',
  'src/shared/SlaTimer.tsx',
  'src/shared/EvidenceThumb.tsx',
  'src/features/passenger/LandingPage.tsx',
  'src/features/passenger/ReportPage.tsx',
  'src/features/passenger/ConfirmationPage.tsx',
  'src/features/passenger/TrackPage.tsx',
  'src/features/passenger/TrackDetailPage.tsx',
  'src/features/depot/OverviewPage.tsx',
  'src/features/depot/InboxPage.tsx',
  'src/features/depot/CaseDetailPage.tsx',
  'src/features/depot/EscalatedPage.tsx',
  'src/features/depot/AnalyticsPage.tsx',
  'src/features/regional/RegionalInboxPage.tsx',
  'src/features/regional/DepotComparePage.tsx',
  'src/features/public/PublicDashboardPage.tsx',
  'src/features/demo/DemoPanel.tsx',
  'src/features/auth/LoginPage.tsx',
  'src/features/regional/UnroutedPage.tsx',
];

for (const file of files) {
  const compName = path.basename(file, '.tsx');
  const content = `export default function ${compName}() {
  return <div>${compName} placeholder</div>;
}
`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
console.log('Scaffolded placeholder files.');

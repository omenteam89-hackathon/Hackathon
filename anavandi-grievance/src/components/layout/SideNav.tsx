import { NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import { LayoutDashboard, Inbox, AlertTriangle, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useComplaintStore } from '../../store/useComplaintStore';
import { useSessionStore } from '../../store/useSessionStore';

export default function SideNav() {
  const depotId = useSessionStore(s => s.depotId);
  const complaintsMap = useComplaintStore(state => state.complaints);
  
  const openCount = useMemo(() => {
    return Object.values(complaintsMap).filter(c => 
      c.depotId === depotId && !['RESOLVED', 'REJECTED'].includes(c.status)
    ).length;
  }, [complaintsMap, depotId]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/console/depot', end: true },
    { icon: Inbox, label: 'Inbox', to: '/console/depot/inbox', badge: openCount },
    { icon: AlertTriangle, label: 'Escalated', to: '/console/depot/escalated' },
    { icon: BarChart3, label: 'Analytics', to: '/console/depot/analytics' },
  ];

  return (
    <nav className="w-64 bg-white border-r border-border h-full hidden md:flex flex-col">
      <div className="p-4 space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted hover:bg-muted/10 hover:text-ink"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

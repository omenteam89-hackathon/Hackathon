import { useDataStore } from '../store/useDataStore';
import { format } from 'date-fns';

export function useFormatters() {
  const categories = useDataStore(s => s.categories);
  const routeMap = useDataStore(s => s.routeMap);

  return {
    categoryLabel(id: string) {
      return categories.find(c => c.id === id)?.label.en || id;
    },
    routeName(routeNo: string) {
      return routeMap.find(r => r.routeNo === routeNo)?.routeName || routeNo;
    },
    actorLabel(actor: string) {
      if (actor === 'PASSENGER') return 'You';
      if (actor === 'SYSTEM') return 'System';
      if (actor === 'DEPOT') return 'Depot officer';
      if (actor === 'REGIONAL') return 'Regional officer';
      return actor;
    },
    formatDate(iso: string) {
      try {
        return format(new Date(iso), "d MMM, h:mm a");
      } catch (e) {
        return iso;
      }
    }
  };
}

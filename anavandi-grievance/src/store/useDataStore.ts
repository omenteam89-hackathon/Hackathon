import { create } from 'zustand';
import type { RouteDepotMap, Depot } from '../domain/types';

interface DataState {
  routeMap: RouteDepotMap[];
  depots: Depot[];
  setRouteMap: (routes: RouteDepotMap[]) => void;
  setDepots: (depots: Depot[]) => void;
}

export const useDataStore = create<DataState>((set) => ({
  routeMap: [],
  depots: [],
  setRouteMap: (routes) => set({ routeMap: routes }),
  setDepots: (depots) => set({ depots }),
}));

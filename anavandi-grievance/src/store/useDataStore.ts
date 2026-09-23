import { create } from 'zustand';
import type { RouteDepotMap, Depot, Category } from '../domain/types';

interface DataState {
  routeMap: RouteDepotMap[];
  depots: Depot[];
  categories: Category[];
  regions: any[];
  setRouteMap: (routes: RouteDepotMap[]) => void;
  setDepots: (depots: Depot[]) => void;
  setCategories: (categories: Category[]) => void;
  setRegions: (regions: any[]) => void;
}

export const useDataStore = create<DataState>((set) => ({
  routeMap: [],
  depots: [],
  categories: [],
  regions: [],
  setRouteMap: (routes) => set({ routeMap: routes }),
  setDepots: (depots) => set({ depots }),
  setCategories: (categories) => set({ categories }),
  setRegions: (regions) => set({ regions }),
}));

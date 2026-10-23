import { create } from 'zustand';

/**
 * App-wide UI state. View selections (phase, step, layer) live in the URL so they
 * deep-link; only transient chrome state lives here.
 */
interface UiState {
  searchOpen: boolean;
  navOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleNav: (open?: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  searchOpen: false,
  navOpen: false,
  openSearch: () => set({ searchOpen: true, navOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  toggleNav: (open) => set((s) => ({ navOpen: open ?? !s.navOpen })),
}));

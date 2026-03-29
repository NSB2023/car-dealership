import { create } from "zustand"

export const useFilterStore = create((set) => ({
  make: "All Makes",
  model: "All Models",
  year: "Any Year",
  minPrice: "",
  maxPrice: "",
  fuel: "All",
  query: "",
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  resetFilters: () =>
    set({
      make: "All Makes",
      model: "All Models",
      year: "Any Year",
      minPrice: "",
      maxPrice: "",
      fuel: "All",
      query: "",
    }),
}))

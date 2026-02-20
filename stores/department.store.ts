/**
 * Department store — persists the user's active department selection.
 *
 * The selected department filters products, categories, banners, and mega menu.
 * Initial value comes from:
 *   1. localStorage (remembered from last visit)
 *   2. Fallback: first active department from site config
 */

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Department } from "@/lib/config/site";

interface DepartmentState {
  selected: Department | null;
  setDepartment: (dept: Department) => void;
  /** Call this on mount with the site config's active departments */
  initFromConfig: (activeDepts: Department[]) => void;
}

export const useDepartmentStore = create<DepartmentState>()(
  persist(
    (set, get) => ({
      selected: null,

      setDepartment: (dept) => set({ selected: dept }),

      initFromConfig: (activeDepts) => {
        const current = get().selected;
        // If stored dept is still an active one, keep it
        if (current && activeDepts.includes(current)) return;
        // Otherwise default to the first active department
        if (activeDepts.length > 0) {
          set({ selected: activeDepts[0] });
        }
      },
    }),
    {
      name: "riziki-department",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

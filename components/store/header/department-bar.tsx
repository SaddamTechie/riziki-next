"use client";

import { useDepartmentStore } from "@/stores/department.store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Department } from "@/lib/config/site";
import { cn } from "@/lib/utils";

interface DepartmentBarProps {
  activeDepartments: Department[];
}

const DEPT_LABELS: Record<Department, string> = {
  men: "Men",
  women: "Women",
  beauty: "Beauty",
};

export function DepartmentBar({ activeDepartments }: DepartmentBarProps) {
  const { selected, setDepartment, initFromConfig } = useDepartmentStore();
  const router = useRouter();

  // Initialize from site config on first render
  useEffect(() => {
    initFromConfig(activeDepartments);
  }, [activeDepartments, initFromConfig]);

  function handleSelect(dept: Department) {
    setDepartment(dept); // update Zustand (mega menu, search bar, etc.)
    router.push(`/?dept=${dept}`); // navigate to the dept storefront home
  }

  return (
    <div className="border-b bg-muted/40">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-0 px-4">
        {activeDepartments.map((dept) => (
          <button
            key={dept}
            onClick={() => handleSelect(dept)}
            className={cn(
              "relative px-6 py-2 text-xs font-semibold uppercase tracking-widest transition-colors",
              "hover:text-foreground focus-visible:outline-none",
              selected === dept ? "text-foreground" : "text-muted-foreground",
              // Animated underline for active dept
              selected === dept &&
                "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground after:content-['']",
            )}
          >
            {DEPT_LABELS[dept]}
          </button>
        ))}
      </div>
    </div>
  );
}

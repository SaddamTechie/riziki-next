"use client";

import { useEffect } from "react";
import { useDepartmentStore } from "@/stores/department.store";

type Dept = "women" | "men" | "beauty";

const COOKIE_NAME = "riziki_dept";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Syncs the URL `dept` search param into Zustand AND writes a cookie so
 * the server remembers the user's last-visited department even when they
 * navigate home without a `?dept=` param (e.g. clicking the logo).
 *
 * Renders nothing — pure side-effect component.
 */
export function DepartmentSync({ dept }: { dept: Dept }) {
  const setDepartment = useDepartmentStore((s) => s.setDepartment);

  useEffect(() => {
    setDepartment(dept);
    // Persist so the server can read it on the next parameterless visit
    document.cookie = `${COOKIE_NAME}=${dept}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
  }, [dept, setDepartment]);

  return null;
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DashboardContextType {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync dark class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <DashboardContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        isCollapsed,
        setIsCollapsed,
        mobileOpen,
        setMobileOpen,
      }}
    >
      <div className={isDarkMode ? 'dark' : ''}>{children}</div>
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return ctx;
}

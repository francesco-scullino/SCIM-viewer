import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SelectionContextValue {
  environmentId: number | null;
  applicationId: number | null;
  setEnvironmentId: (id: number | null) => void;
  setApplicationId: (id: number | null) => void;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

const ENV_KEY = 'scim-viewer.selectedEnvironmentId';
const APP_KEY = 'scim-viewer.selectedApplicationId';

function readStored(key: string): number | null {
  const raw = localStorage.getItem(key);
  return raw ? Number(raw) : null;
}

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [environmentId, setEnvironmentIdState] = useState<number | null>(() => readStored(ENV_KEY));
  const [applicationId, setApplicationIdState] = useState<number | null>(() => readStored(APP_KEY));

  useEffect(() => {
    if (environmentId != null) localStorage.setItem(ENV_KEY, String(environmentId));
    else localStorage.removeItem(ENV_KEY);
  }, [environmentId]);

  useEffect(() => {
    if (applicationId != null) localStorage.setItem(APP_KEY, String(applicationId));
    else localStorage.removeItem(APP_KEY);
  }, [applicationId]);

  return (
    <SelectionContext.Provider
      value={{
        environmentId,
        applicationId,
        setEnvironmentId: setEnvironmentIdState,
        setApplicationId: setApplicationIdState,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within a SelectionProvider');
  return ctx;
}

import React, {createContext, useContext, useEffect} from 'react';
import {IRootStore, createRootStore} from './RootStore';
import {hydrateSettings, watchSettings} from './settingsPersistence';
import {settingsStorage} from './settingsStorage';

// Create a context for the root store
const StoreContext = createContext<IRootStore | null>(null);

// Create a provider component to wrap the app
export const StoreProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  // Create the store only once
  const rootStore = React.useMemo(() => createRootStore(), []);

  useEffect(() => {
    let muted = true;
    const stop = watchSettings(rootStore.settingsStore, settingsStorage, {
      isMuted: () => muted,
    });
    hydrateSettings(rootStore.settingsStore, settingsStorage)
      .catch(error => {
        console.error('Could not restore camera settings:', error);
      })
      .finally(() => {
        muted = false;
      });
    return stop;
  }, [rootStore]);

  return (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
  );
};

// Hook to use the store in components
export const useStores = (): IRootStore => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return store;
};

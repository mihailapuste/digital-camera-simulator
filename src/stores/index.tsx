import React, {createContext, useContext} from 'react';
import {IRootStore, createRootStore} from './RootStore';

// Create a context for the root store
const StoreContext = createContext<IRootStore | null>(null);

// Create a provider component to wrap the app
export const StoreProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  // Create the store only once
  const rootStore = React.useMemo(() => createRootStore(), []);

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

import React, { createContext, useContext, ReactNode } from 'react';

interface CommunityContextType {
  friends: any[];
  communities: any[];
}

const CommunityContext = createContext<CommunityContextType | null>(null);

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const value: CommunityContextType = { friends: [], communities: [] };
  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
};

export const useCommunity = () => {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
};

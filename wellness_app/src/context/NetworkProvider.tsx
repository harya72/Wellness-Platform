import React, { createContext, ReactNode, useContext, useState } from "react";

type NetworkContextType = {
  showNetworkLogs: boolean;
  setShowNetworkLogs: React.Dispatch<React.SetStateAction<boolean>>;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [showNetworkLogs, setShowNetworkLogs] = useState<boolean>(false);

  return (
    <NetworkContext.Provider value={{ showNetworkLogs, setShowNetworkLogs }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within an NetworkProvider");
  }
  return context;
};

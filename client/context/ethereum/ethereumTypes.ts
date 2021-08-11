export interface Ethereumish {
  autoRefreshOnNetworkChange: boolean;
  chainId: string;
  isMetaMask?: boolean;
  isStatus?: boolean;
  networkVersion: string;
  selectedAddress: any;
  enable(): Promise<void>;
}

declare global {
  interface Window {
    ethereum: Ethereumish;
  }
}

import { ExternalProvider } from '@ethersproject/providers';

export interface WindowEthereumProvider extends ExternalProvider {
  // Metamask method to request access
  enable(): Promise<void>;
}

declare global {
  interface Window {
    ethereum?: WindowEthereumProvider;
  }
}

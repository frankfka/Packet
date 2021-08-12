import { EventType, Listener } from '@ethersproject/abstract-provider';
import { ExternalProvider, JsonRpcSigner } from '@ethersproject/providers';

export type WindowEthereumProvider = ExternalProvider & {
  on(eventName: EventType, listener: Listener): WindowEthereumProvider;
  removeAllListeners(): void;
};

export type EthereumSigner = JsonRpcSigner;

declare global {
  interface Window {
    ethereum?: WindowEthereumProvider;
  }
}

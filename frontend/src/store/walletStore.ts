import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { connect as stacksConnect, disconnect as stacksDisconnect, isConnected as stacksIsConnected } from '@stacks/connect';

interface WalletState {
  address: string | null;
  connected: boolean;
  network: 'testnet' | 'mainnet';
  connect: () => void;
  disconnect: () => void;
  setAddress: (address: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      connected: false,
      network: 'testnet',
      connect: async () => {
        try {
          const response = await stacksConnect();
          // Find the STX address from the response
          const stxEntry = response.addresses.find(
            (a: { symbol: string }) => a.symbol === 'STX'
          );
          if (stxEntry) {
            set({ connected: true, address: stxEntry.address });
          }
        } catch {
          // user cancelled or wallet not available
        }
      },
      disconnect: () => {
        stacksDisconnect();
        set({
          connected: false,
          address: null,
        });
      },
      setAddress: (address: string) => set({ address, connected: true }),
    }),
    { name: 'caskade-wallet' }
  )
);

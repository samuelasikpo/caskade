import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { showConnect } from '@stacks/connect';

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
      connect: () => {
        showConnect({
          appDetails: {
            name: 'Caskade',
            icon: window.location.origin + '/favicon.ico',
          },
          onFinish: (data) => {
            const address = data.userSession.loadUserData().profile.stxAddress.testnet;
            set({ connected: true, address });
          },
          onCancel: () => {
            // user closed the wallet popup
          },
        });
      },
      disconnect: () =>
        set({
          connected: false,
          address: null,
        }),
      setAddress: (address: string) => set({ address, connected: true }),
    }),
    { name: 'caskade-wallet' }
  )
);

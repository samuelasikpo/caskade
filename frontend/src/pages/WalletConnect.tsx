import { useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { CaskadeLogo } from '@/components/CaskadeLogo';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Zap, BarChart3 } from 'lucide-react';

export default function WalletConnect() {
  const { connect } = useWalletStore();

  useEffect(() => {
    document.title = 'Connect Wallet — Caskade';
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Radial glow behind center content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center animate-fade-in">
        {/* Brand */}
        <div className="mb-8">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-xl bg-primary/10 blur-xl" />
            <CaskadeLogo size={56} className="relative z-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Caskade</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Composable sBTC yield vaults on the Stacks blockchain. Non-custodial. Transparent. Automated.
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Shield, label: 'Non-Custodial', desc: 'Your keys, your yield' },
            { icon: Zap, label: 'Auto-Compound', desc: 'Set and forget' },
            { icon: BarChart3, label: 'Transparent', desc: 'On-chain verified' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-3 transition-colors hover:border-primary/20">
              <Icon className="h-4 w-4 text-primary mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[11px] font-semibold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* Connect Card */}
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-6">
          <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-secondary">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
            <Wallet className="h-6 w-6 text-primary relative z-10" strokeWidth={1.5} />
          </div>

          <Button
            onClick={connect}
            className="w-full h-12 text-sm font-semibold"
            size="lg"
          >
            Connect Wallet
          </Button>

          <p className="mt-3 text-[11px] text-muted-foreground">
            Supports <span className="text-foreground font-medium">Leather</span> & <span className="text-foreground font-medium">Xverse</span> wallets
          </p>
        </div>

        {/* Protocol Stats */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="font-mono text-sm font-semibold text-foreground">2</p>
            <p className="text-[10px] text-muted-foreground">Active Vaults</p>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-center">
            <p className="font-mono text-sm font-semibold text-foreground">Stacks</p>
            <p className="text-[10px] text-muted-foreground">Network</p>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-center">
            <p className="font-mono text-sm font-semibold text-foreground">sBTC</p>
            <p className="text-[10px] text-muted-foreground">Underlying</p>
          </div>
        </div>

        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 backdrop-blur-sm px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
          <span className="text-[11px] font-medium text-muted-foreground">Deployed on Stacks Testnet</span>
        </div>
      </div>
    </div>
  );
}

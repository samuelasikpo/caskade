import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Vault, PieChart, ArrowLeftRight, LogOut } from 'lucide-react';
import { CaskadeLogo } from '@/components/CaskadeLogo';
import { useWalletStore } from '@/store/walletStore';
import { Button } from '@/components/ui/button';
import { NetworkBanner } from '@/components/NetworkBanner';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Vaults', href: '/vaults', icon: Vault },
  { label: 'Portfolio', href: '/portfolio', icon: PieChart },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
];

export function AppLayout() {
  const location = useLocation();
  const { address, disconnect } = useWalletStore();

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Top Nav */}
      <header className="sticky top-0 z-50 hidden md:flex h-16 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <Link to="/" className="flex items-center gap-2 mr-12">
          <CaskadeLogo size={28} />
          <span className="text-lg font-bold tracking-tight text-foreground">Caskade</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-md border border-border">
            {truncatedAddress}
          </span>
          <Button variant="ghost" size="icon" onClick={disconnect} aria-label="Disconnect wallet" className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-50 flex md:hidden h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-4">
        <Link to="/" className="flex items-center gap-1.5">
          <CaskadeLogo size={24} />
          <span className="text-base font-bold tracking-tight text-foreground">Caskade</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded border border-border">
            {truncatedAddress}
          </span>
          <Button variant="ghost" size="icon" onClick={disconnect} className="h-8 w-8 text-muted-foreground">
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      {/* Network Warning */}
      <NetworkBanner />

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && <span className="h-0.5 w-4 rounded-full bg-primary mt-0.5" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

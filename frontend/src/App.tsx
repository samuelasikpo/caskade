import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useWalletStore } from "@/store/walletStore";
import { AppLayout } from "@/components/AppLayout";
import WalletConnect from "./pages/WalletConnect";
import Dashboard from "./pages/Dashboard";
import Vaults from "./pages/Vaults";
import VaultDetail from "./pages/VaultDetail";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { connected } = useWalletStore();
  if (!connected) return <Navigate to="/connect" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/connect" element={<ConnectGuard />} />
          <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vaults" element={<Vaults />} />
            <Route path="/vaults/:id" element={<VaultDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function ConnectGuard() {
  const { connected } = useWalletStore();
  if (connected) return <Navigate to="/" replace />;
  return <WalletConnect />;
}

export default App;

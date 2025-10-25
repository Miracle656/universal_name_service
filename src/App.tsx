import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PushUniversalWalletProvider, PushUI } from "@pushchain/ui-kit";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { MyNames } from "./pages/MyNames";

const queryClient = new QueryClient();

const walletConfig = {
  network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  login: {
    email: true,
    google: true,
    wallet: {
      enabled: true,
    },
    appPreview: true,
  },
  modal: {
    loginLayout: PushUI.CONSTANTS.LOGIN.LAYOUT.SPLIT,
    connectedLayout: PushUI.CONSTANTS.CONNECTED.LAYOUT.HOVER,
    appPreview: true,
  },
};

const appMetadata = {
  logoUrl: 'https://i.postimg.cc/26hdgX30/PNS-Logo.png',
  title: 'Push Name Service',
  description: 'Universal Identity on Push Chain',
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PushUniversalWalletProvider config={walletConfig} app={appMetadata}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/my-names" element={<MyNames />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PushUniversalWalletProvider>
  </QueryClientProvider>
);

export default App;

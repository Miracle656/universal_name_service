import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { usePushWalletContext, PushUI } from '@pushchain/ui-kit';
import PNSLogo from '../../public/PNS_Logo.png'

interface HeroProps {
  onSearch: (name: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { connectionStatus } = usePushWalletContext();
  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 sm:py-32">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Universal Name Service on Push Chain
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Your Identity Across
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Every Chain
            </span>
          </h1>

          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
            Register your unique .push name from any chain. Deployed once on Push Chain, accessible from Ethereum, Solana, and more.
            One name, unlimited possibilities.
          </p>

          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for your perfect name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-32 text-lg shadow-glow-primary transition-all focus:shadow-glow-accent"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-primary hover:opacity-90"
                disabled={!isConnected}
              >
                Search
              </Button>
            </div>
          </form>

          {!isConnected && (
            <p className="mt-4 text-sm text-muted-foreground">
              Connect your wallet to search and register names
            </p>
          )}

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-2 text-3xl font-bold text-primary">∞</div>
              <div className="font-semibold">Multi-Chain</div>
              <div className="text-sm text-muted-foreground">Connect all your addresses</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-2 text-3xl font-bold text-primary">365</div>
              <div className="font-semibold">Days Per Year</div>
              <div className="text-sm text-muted-foreground">Renewable registration</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-2 text-3xl font-bold text-primary">100%</div>
              <div className="font-semibold">Ownership</div>
              <div className="text-sm text-muted-foreground">You control your name</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

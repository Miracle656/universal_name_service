import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PushUniversalAccountButton, usePushWalletContext, usePushChainClient, PushUI } from '@pushchain/ui-kit';
import { usePNSName } from '@/hooks/usePNSName';

export const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const walletContext = usePushWalletContext();
  const { connectionStatus } = walletContext;
  console.log('[Header] Wallet Context:', walletContext);
  const { pushChainClient } = usePushChainClient();

  // Extract EVM address from CAIP-10 format (e.g., "eip155:42101:0x...")
  const evmAddress = pushChainClient?.universal?.account?.split(':').pop();

  // Fetch PNS name for the connected address
  const { pnsName, loading: pnsLoading } = usePNSName(evmAddress);

  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    }
  }, []);



  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <img
              src="/assets/pnslogo.png"
              alt="Push Name Service"
              className="h-20 w-auto transition-all group-hover:scale-110"
            />
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-400 hover:text-[#D548EC] transition-colors font-medium">
              Home
            </a>
            <a href="/my-names" className="text-gray-400 hover:text-[#D548EC] transition-colors font-medium">
              My Names
            </a>
          </nav>

          {/* Connect Wallet */}
          <div className="flex items-center gap-4">
            {isConnected && pnsName && (
              <div className="px-4 py-2 bg-[#D548EC]/10 border border-[#D548EC]/30 rounded-xl backdrop-blur-sm">
                <span className="font-bold bg-gradient-to-r from-[#D548EC] to-purple-400 bg-clip-text text-transparent">
                  {pnsName}.push
                </span>
              </div>
            )}

            <PushUniversalAccountButton
              connectButtonText="Connect Wallet"
              themeOverrides={{
                '--pwauth-btn-connect-bg-color': '#D548EC',
                // '--pwauth-btn-connect-hover-bg-color': '#e76ff5',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

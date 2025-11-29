import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PushUniversalAccountButton } from '@pushchain/ui-kit';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const headerRef = useRef<HTMLElement>(null);

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
          <div>
            <PushUniversalAccountButton />
          </div>
        </div>
      </div>
    </header>
  );
};

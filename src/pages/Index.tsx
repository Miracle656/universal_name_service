import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ConnectedNames } from '@/components/ConnectedNames';
import { NameSearch } from '@/components/NameSearch';
import { Features } from '@/components/Features';
import { RotatingIdentities } from '@/components/RotatingIdentities';

const Index = () => {
  const [searchName, setSearchName] = useState('');

  const handleSearch = (name: string) => {
    setSearchName(name);
    setTimeout(() => {
      document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRegisterSuccess = () => {
    setSearchName('');
    window.location.href = '/my-names';
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main>
        <Hero onSearch={handleSearch} />
        <ConnectedNames />
        <NameSearch searchName={searchName} onRegisterSuccess={handleRegisterSuccess} />
        <Features />
        <RotatingIdentities />
      </main>

      <footer className="bg-black border-t border-[#D548EC]/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <img src="/assets/pnslogo.png" alt="PNS" className="h-8 w-auto" />
              <span className="font-semibold text-white">Push Name Service</span>
            </div>

            <div className="flex gap-8">
              <a href="#" className="hover:text-[#D548EC] transition-colors">Documentation</a>
              <a href="#" className="hover:text-[#D548EC] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[#D548EC] transition-colors">Discord</a>
            </div>

            <p>© 2024 Push Chain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

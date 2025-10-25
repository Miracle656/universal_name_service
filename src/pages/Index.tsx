import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { NameSearch } from '@/components/NameSearch';
import { Features } from '@/components/Features';

const Index = () => {
  const [searchName, setSearchName] = useState('');

  const handleSearch = (name: string) => {
    setSearchName(name);
    // Scroll to search results
    setTimeout(() => {
      document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRegisterSuccess = () => {
    setSearchName('');
    // Redirect to my names page
    window.location.href = '/my-names';
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Hero onSearch={handleSearch} />
      <NameSearch searchName={searchName} onRegisterSuccess={handleRegisterSuccess} />
      <Features />
      
      <footer className="border-t border-border/40 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Push Name Service - Universal Identity on Push Chain</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

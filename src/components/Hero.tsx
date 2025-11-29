import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onSearch: (name: string) => void;
}

// Glowing name cards data with both scattered and vertical positions
export const HERO_NAMES = [
  {
    name: 'alice.push',
    image: '/assets/pnsglow/Group 16.png',
    color: '#F0B90B',
    heroPos: { top: '22%', left: '22%' },
    verticalIndex: 0
  },
  {
    name: 'bob.push',
    image: '/assets/pnsglow/Group 17.png',
    color: '#0052FF',
    heroPos: { top: '22%', left: '78%' },
    verticalIndex: 1
  },
  {
    name: 'john.push',
    image: '/assets/pnsglow/Group 18.png',
    color: '#5b5b94',
    heroPos: { top: '50%', left: '82%' },
    verticalIndex: 2
  },
  {
    name: 'smith.push',
    image: '/assets/pnsglow/Group 19.png',
    color: '#79797a',
    heroPos: { top: '78%', left: '78%' },
    verticalIndex: 3
  },
  {
    name: 'miracle.push',
    image: '/assets/pnsglow/Group 20.png',
    color: '#28A0F0',
    heroPos: { top: '78%', left: '22%' },
    verticalIndex: 4
  },
];

// Floating coins data
const FLOATING_COINS = [
  { image: '/assets/unicoins/Group 21.png', position: { top: '10%', left: '5%' }, delay: 0 },
  { image: '/assets/unicoins/Group 22.png', position: { top: '25%', left: '2%' }, delay: 0.5 },
  { image: '/assets/unicoins/Group 23.png', position: { top: '40%', left: '5%' }, delay: 1 },
  { image: '/assets/unicoins/Group 24.png', position: { top: '60%', left: '2%' }, delay: 1.5 },
  { image: '/assets/unicoins/Group 25.png', position: { top: '80%', left: '5%' }, delay: 2 },
  { image: '/assets/unicoins/Group 26.png', position: { top: '90%', left: '10%' }, delay: 2.5 },
];

export const Hero = ({ onSearch }: HeroProps) => {
  const [searchValue, setSearchValue] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  const coinsRef = useRef<(HTMLImageElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating animation for coins
      coinsRef.current.forEach((coin, index) => {
        if (coin) {
          gsap.to(coin, {
            y: '+=30',
            duration: 2 + index * 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: FLOATING_COINS[index].delay,
          });

          gsap.to(coin, {
            rotation: 360,
            duration: 10 + index * 2,
            repeat: -1,
            ease: 'none',
          });
        }
      });

      // Entrance animation for Hero names
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(card,
            { opacity: 0, scale: 0.5 },
            {
              opacity: 1,
              scale: 1,
              duration: 1,
              delay: 0.5 + index * 0.1,
              ease: 'back.out(1.7)',
            });
        }
      });

      // Fade out names on scroll (bidirectional with scrub)
      cardsRef.current.forEach((card) => {
        if (card) {
          gsap.fromTo(card,
            { opacity: 1, scale: 1 },
            {
              scrollTrigger: {
                trigger: heroRef.current,
                start: 'bottom bottom',
                end: 'bottom top',
                scrub: 1,
              },
              opacity: 0,
              scale: 0.8,
              ease: 'none',
            });
        }
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
      {/* Floating Coins */}
      {FLOATING_COINS.map((coin, index) => (
        <img
          key={index}
          ref={(el) => (coinsRef.current[index] = el)}
          src={coin.image}
          alt="Coin"
          className="absolute w-10 h-10 md:w-20 md:h-20 opacity-40 md:opacity-60 transition-opacity duration-300"
          style={coin.position}
        />
      ))}

      {/* Main Content */}
      <div ref={containerRef} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 text-display">
          Your Identity Across
          <br />
          <span className="text-glow-pink">Every Chain</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 md:mb-12 font-light max-w-xl mx-auto">
          Universal names for the decentralized web
        </p>

        {/* Search Bar Container */}
        <div className="relative max-w-2xl mx-auto">
          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="relative z-20">
            <div className="relative flex items-center bg-white/5 backdrop-blur-lg rounded-full border-2 border-[#D548EC]/30 overflow-hidden glow-pink">
              <Input
                type="text"
                placeholder="Search for your name..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 border-0 bg-transparent px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-medium text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 bg-[#D548EC] hover:bg-[#e76ff5] text-white rounded-full px-4 md:px-8 py-4 md:py-6 h-auto glow-pink"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Absolute Name Cards (Will fade out on scroll) */}
      {HERO_NAMES.map((item, index) => (
        <div
          key={item.name}
          ref={(el) => (cardsRef.current[index] = el)}
          data-name-card={index}
          className="absolute z-0 pointer-events-none"
          style={{
            top: item.heroPos.top,
            left: item.heroPos.left,
            transform: 'translate(-50%, -50%)' // Center on coordinate
          }}
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-24 sm:w-32 md:w-64 h-auto drop-shadow-2xl opacity-50 md:opacity-100 transition-opacity duration-300"
          />
        </div>
      ))}
    </section>
  );
};

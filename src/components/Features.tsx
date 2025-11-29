import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Infinity, Calendar, Shield } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Infinity,
    title: 'Multi-Chain',
    subtitle: 'Identity',
    description: 'Connect all your addresses across different chains under one memorable name. Your universal identity on Push Chain.',
  },
  {
    icon: Calendar,
    title: '365 Days',
    subtitle: 'Per Year',
    description: 'Renewable registration system ensures your name stays yours. No permanent locks, full control over your digital identity.',
  },
  {
    icon: Shield,
    title: '100%',
    subtitle: 'Ownership',
    description: 'You control your name completely. Transfer, update metadata, or renew - it\'s all in your hands. True decentralized ownership.',
  },
];

export const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.2,
            ease: 'power3.out',
          });
        }
      });
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={featuresRef} className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                ref={(el) => (cardsRef.current[index] = el)}
                className="relative group"
              >
                {/* Border gradient effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D548EC]/50 to-transparent rounded-3xl opacity-50 group-hover:opacity-100 blur transition duration-300" />

                {/* Card content */}
                <div className="relative bg-black border border-[#D548EC]/20 rounded-3xl p-8 h-full hover:border-[#D548EC]/40 transition-all duration-300">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#D548EC]/10 flex items-center justify-center group-hover:bg-[#D548EC]/20 transition-colors">
                      <Icon className="w-8 h-8 text-[#D548EC]" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl md:text-4xl font-black text-[#D548EC] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-gray-400 mb-4">{feature.subtitle}</p>

                  {/* Description */}
                  <p className="text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

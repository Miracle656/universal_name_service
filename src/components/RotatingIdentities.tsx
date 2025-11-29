import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Identities for the rotating ring
const IDENTITIES = [
    { id: 1, avatar: '/assets/avatars/BUBBLE.png', name: 'alice.push' },
    { id: 2, avatar: '/assets/avatars/dude.jpg', name: 'bob.push' },
    { id: 3, avatar: '/assets/avatars/haira.png', name: 'charlie.push' },
    { id: 4, avatar: '/assets/avatars/lol.coool.png', name: 'diana.push' },
    { id: 5, avatar: '/assets/avatars/sho.png', name: 'evan.push' },
];

export const RotatingIdentities = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const identitiesRef = useRef<(HTMLDivElement | null)[]>([]);
    const pushLogoRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Rotate the entire ring
            if (ringRef.current) {
                gsap.to(ringRef.current, {
                    rotation: 360,
                    duration: 30,
                    repeat: -1,
                    ease: 'none',
                });
            }

            // Pulse animation for Push logo
            if (pushLogoRef.current) {
                gsap.to(pushLogoRef.current, {
                    scale: 1.1,
                    duration: 2,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
            }

            // Entrance animation
            gsap.from(sectionRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const handleHover = (index: number, isHovering: boolean) => {
        if (ringRef.current) {
            if (isHovering) {
                gsap.to(ringRef.current, { timeScale: 0, duration: 0.5 });
            } else {
                gsap.to(ringRef.current, { timeScale: 1, duration: 0.5 });
            }
        }
    };

    return (
        <section ref={sectionRef} className="py-32 bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Join The Flourishing
                        <br />
                        <span className="text-[#D548EC]">Push Community</span>
                    </h2>
                    <p className="text-xl text-gray-400">
                        The most innovative projects are building on Push Chain
                    </p>
                </div>

                {/* Rotating Ring */}
                <div className="relative w-full max-w-2xl mx-auto aspect-square">
                    {/* Center Push Logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <img
                            ref={pushLogoRef}
                            src="/assets/pushlogo 1.png"
                            alt="Push Logo"
                            className="w-32 h-32 md:w-40 md:h-40"
                        />
                    </div>

                    {/* Orbit Rings */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="w-[60%] h-[60%] border border-[#D548EC]/30 rounded-full" />
                        <div className="absolute w-[80%] h-[80%] border border-[#D548EC]/30 rounded-full" />
                        <div className="absolute w-full h-full border border-[#D548EC]/30 rounded-full" />
                    </div>

                    {/* Rotating Identities */}
                    <div ref={ringRef} className="absolute inset-0">
                        {IDENTITIES.map((identity, index) => {
                            const angle = (360 / IDENTITIES.length) * index;
                            const radius = 45; // percentage
                            const angleRad = (angle * Math.PI) / 180;
                            const x = 50 + radius * Math.cos(angleRad);
                            const y = 50 + radius * Math.sin(angleRad);

                            return (
                                <div
                                    key={identity.id}
                                    ref={(el) => (identitiesRef.current[index] = el)}
                                    className="absolute group"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                    onMouseEnter={() => handleHover(index, true)}
                                    onMouseLeave={() => handleHover(index, false)}
                                >
                                    {/* Identity Avatar */}
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#D548EC]/20 to-[#D548EC]/10 border-2 border-[#D548EC]/30 overflow-hidden cursor-pointer hover:scale-125 hover:border-[#D548EC] transition-all duration-300 glow-pink">
                                        <img
                                            src={identity.avatar}
                                            alt={identity.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Name Tooltip */}
                                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="bg-[#D548EC]/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl">
                                            <span className="text-white font-bold text-sm">{identity.name}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO_NAMES } from './Hero';

gsap.registerPlugin(ScrollTrigger);

export const ConnectedNames = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const pnsLogoRef = useRef<HTMLImageElement>(null);
    const pushLogoRef = useRef<HTMLImageElement>(null);
    const namesRef = useRef<(HTMLDivElement | null)[]>([]);
    const pathsRef = useRef<(SVGPathElement | null)[]>([]);
    const pnsToPushPathRef = useRef<SVGPathElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [paths, setPaths] = useState<string[]>([]);
    const [pnsToPushPath, setPnsToPushPath] = useState<string>('');

    const calculatePaths = () => {
        if (!pushLogoRef.current || !pnsLogoRef.current || !sectionRef.current) return;

        const pushRect = pushLogoRef.current.getBoundingClientRect();
        const pnsRect = pnsLogoRef.current.getBoundingClientRect();
        const sectionRect = sectionRef.current.getBoundingClientRect();

        // Push logo position (center point for connections to names)
        const pushX = pushRect.left - sectionRect.left + pushRect.width / 2;
        const pushY = pushRect.top - sectionRect.top + pushRect.height / 2;

        // PNS logo position
        const pnsX = pnsRect.left - sectionRect.left + pnsRect.width / 2;
        const pnsY = pnsRect.top - sectionRect.top + pnsRect.height / 2;

        const isVertical = window.innerWidth < 1024; // lg breakpoint

        // Calculate path from PNS to Push
        let pnsToPushPathString = '';
        if (isVertical) {
            // Vertical: PNS (top) -> Push (bottom)
            const controlY1 = pnsY + (pushY - pnsY) * 0.5;
            const controlY2 = pnsY + (pushY - pnsY) * 0.5;
            pnsToPushPathString = `M ${pnsX} ${pnsRect.bottom - sectionRect.top} C ${pnsX} ${controlY1}, ${pushX} ${controlY2}, ${pushX} ${pushRect.top - sectionRect.top}`;
        } else {
            // Horizontal: PNS (left) -> Push (right)
            const controlX1 = pnsX + (pushX - pnsX) * 0.5;
            const controlX2 = pnsX + (pushX - pnsX) * 0.5;
            pnsToPushPathString = `M ${pnsRect.right - sectionRect.left} ${pnsY} C ${controlX1} ${pnsY}, ${controlX2} ${pushY}, ${pushRect.left - sectionRect.left} ${pushY}`;
        }
        setPnsToPushPath(pnsToPushPathString);

        // Calculate paths from Push to each name
        const newPaths = namesRef.current.map((nameEl) => {
            if (!nameEl) return '';

            const nameRect = nameEl.getBoundingClientRect();
            const nameX = nameRect.left - sectionRect.left + nameRect.width / 2;
            const nameY = nameRect.top - sectionRect.top + nameRect.height / 2;

            if (isVertical) {
                // Vertical: Push (top) -> Name (bottom)
                // Start from bottom of Push logo
                const startX = pushX;
                const startY = pushRect.bottom - sectionRect.top;

                // End at left of Name card (or top if stacked tightly, but left looks better for list)
                // Actually for vertical stack, names are below push.
                // Let's connect to the top of the name card
                const endX = nameX;
                const endY = nameRect.top - sectionRect.top;

                const controlY1 = startY + (endY - startY) * 0.5;
                const controlY2 = startY + (endY - startY) * 0.5;

                return `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`;
            } else {
                // Horizontal: Push (left) -> Name (right)
                // Start from right of Push logo
                const startX = pushRect.right - sectionRect.left;
                const startY = pushY;

                // End at left of Name card
                const endX = nameRect.left - sectionRect.left;
                const endY = nameY;

                const controlX1 = startX + (endX - startX) * 0.5;
                const controlX2 = startX + (endX - startX) * 0.5;

                return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;
            }
        });

        setPaths(newPaths);
    };

    // Calculate paths after layout is ready and on resize
    useEffect(() => {
        calculatePaths();

        // Use ResizeObserver for robust updates
        const observer = new ResizeObserver(() => {
            calculatePaths();
        });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        // Also add window resize listener as backup
        window.addEventListener('resize', calculatePaths);

        // Initial delay to ensure fonts/images loaded
        const timer = setTimeout(calculatePaths, 500);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', calculatePaths);
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (paths.length === 0 || !pnsToPushPath) return;

        const ctx = gsap.context(() => {
            // Initial states
            if (pnsLogoRef.current) gsap.set(pnsLogoRef.current, { opacity: 0, scale: 0.5 });
            if (pushLogoRef.current) gsap.set(pushLogoRef.current, { opacity: 0, scale: 0.5 });
            namesRef.current.forEach(el => {
                if (el) gsap.set(el, { opacity: 0, x: 50, scale: 0.8 });
            });

            // Main Entrance Timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 60%',
                    toggleActions: 'play none none reverse'
                }
            });

            // 1. Pop PNS Logo first
            if (pnsLogoRef.current) {
                tl.to(pnsLogoRef.current, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: 'back.out(1.5)'
                });
            }

            // 2. Draw line from PNS to Push
            if (pnsToPushPathRef.current) {
                const length = pnsToPushPathRef.current.getTotalLength();
                gsap.set(pnsToPushPathRef.current, {
                    strokeDasharray: length,
                    strokeDashoffset: length,
                    opacity: 1
                });

                tl.to(pnsToPushPathRef.current, {
                    strokeDashoffset: 0,
                    duration: 0.8,
                    ease: 'power2.out'
                }, '-=0.3');
            }

            // 3. Pop Push Logo
            if (pushLogoRef.current) {
                tl.to(pushLogoRef.current, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: 'back.out(1.5)'
                }, '-=0.4');
            }

            // 4. Draw lines from Push to Names
            pathsRef.current.forEach((path, index) => {
                if (path) {
                    const length = path.getTotalLength();
                    gsap.set(path, {
                        strokeDasharray: length,
                        strokeDashoffset: length,
                        opacity: 1
                    });

                    tl.to(path, {
                        strokeDashoffset: 0,
                        duration: 0.8,
                        ease: 'power2.out'
                    }, `-=${index === 0 ? 0.3 : 0.7}`);
                }
            });

            // 5. Staggered Pop-out of Names
            tl.to(namesRef.current, {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }, '-=0.6');

            // Pulse animation loop for both logos
            if (pnsLogoRef.current) {
                gsap.to(pnsLogoRef.current, {
                    filter: 'drop-shadow(0 0 20px rgba(213, 72, 236, 0.5))',
                    repeat: -1,
                    yoyo: true,
                    duration: 1.5,
                    ease: 'sine.inOut',
                    delay: 2
                });
            }

            if (pushLogoRef.current) {
                gsap.to(pushLogoRef.current, {
                    filter: 'drop-shadow(0 0 30px rgba(213, 72, 236, 0.8))',
                    repeat: -1,
                    yoyo: true,
                    duration: 1.5,
                    ease: 'sine.inOut',
                    delay: 2
                });
            }

        }, sectionRef);

        return () => ctx.revert();
    }, [paths, pnsToPushPath]);

    return (
        <section
            ref={sectionRef}
            id="connected-names-section"
            className="relative bg-black min-h-screen flex items-center justify-center py-20 overflow-hidden"
        >
            {/* SVG Canvas for Lines */}
            <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    {/* Glow filter for PNS to Push line */}
                    <filter id="pns-push-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {HERO_NAMES.map((item, index) => (
                        <filter key={`glow-${index}`} id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    ))}
                </defs>
                {/* PNS to Push connection line */}
                <path
                    ref={pnsToPushPathRef}
                    d={pnsToPushPath || ''}
                    stroke="#D548EC"
                    strokeWidth="4"
                    fill="none"
                    opacity="0"
                    filter="url(#pns-push-glow)"
                    style={{
                        filter: 'drop-shadow(0 0 15px #D548EC)'
                    }}
                />
                {/* Push to Names connection lines */}
                {HERO_NAMES.map((item, index) => (
                    <path
                        key={item.name}
                        ref={el => (pathsRef.current[index] = el)}
                        d={paths[index] || ''}
                        stroke={item.color}
                        strokeWidth="3"
                        fill="none"
                        opacity="0"
                        filter={`url(#glow-${index})`}
                        style={{
                            filter: `drop-shadow(0 0 10px ${item.color})`
                        }}
                    />
                ))}
            </svg>

            {/* Flex Container - Responsive: Vertical on mobile, Horizontal on desktop */}
            <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 relative z-10">

                {/* PNS Logo */}
                <div className="flex items-center justify-center">
                    <img
                        ref={pnsLogoRef}
                        src="/assets/pnslogo.png"
                        alt="PNS Logo"
                        className="w-32 h-32 md:w-40 md:h-40"
                        style={{ filter: 'drop-shadow(0 0 15px rgba(213, 72, 236, 0.4))' }}
                        onLoad={calculatePaths}
                    />
                </div>

                {/* Push Logo */}
                <div className="flex items-center justify-center">
                    <img
                        ref={pushLogoRef}
                        src="/assets/pushlogo 1.png"
                        alt="Push Logo"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-3xl mix-blend-screen"
                        style={{ filter: 'drop-shadow(0 0 20px rgba(213, 72, 236, 0.6))' }}
                        onLoad={calculatePaths}
                    />
                </div>

                {/* Names Column */}
                <div className="flex flex-col justify-center gap-4 lg:gap-1 relative">
                    {HERO_NAMES.map((item, index) => (
                        <div
                            key={item.name}
                            ref={el => (namesRef.current[index] = el)}
                            className="relative"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-56 md:w-72 h-auto drop-shadow-2xl"
                                onLoad={calculatePaths}
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

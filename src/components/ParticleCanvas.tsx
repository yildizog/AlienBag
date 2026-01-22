import React, { useRef, useEffect } from 'react';
import { AttackParticle } from '@/utils/particle';
import { Attack } from '@/data/securityData';

interface ElementPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ParticleCanvasProps {
    activeAttacks: Map<string, Attack>;
    positions: {
        [key: string]: ElementPosition | null;
        server: ElementPosition | null;
        employee: ElementPosition | null;
    };
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ activeAttacks, positions }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<AttackParticle[]>([]);
    const requestRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Handle resizing
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Initial resize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Spawn particles for active attacks
            activeAttacks.forEach((attack) => {
                const startPos = positions[attack.id];
                const endPos = attack.target === 'server' ? positions.server : positions.employee;

                if (startPos && endPos) {
                    // Spawn chance (approx 60ms interval at 60fps is once every ~4 frames)
                    // Increasing probability slightly to ensure flow
                    if (Math.random() < 0.3) {
                        const startX = startPos.x + startPos.width / 2;
                        const startY = startPos.y + startPos.height / 2;

                        const endX = endPos.x + endPos.width / 2;
                        const endY = endPos.y + endPos.height / 2;

                        // Add a little randomness to start point so they don't look like a single line
                        const jitterX = (Math.random() - 0.5) * 20;
                        const jitterY = (Math.random() - 0.5) * 10;

                        particlesRef.current.push(
                            new AttackParticle(
                                startX + jitterX,
                                startY + jitterY,
                                endX,
                                endY,
                                '#ef4444' // Tailwind red-500
                            )
                        );
                    }
                }
            });

            // Update and Draw particles
            particlesRef.current = particlesRef.current.filter(p => {
                const isAlive = p.update();
                if (isAlive) {
                    p.draw(ctx);
                }
                return isAlive;
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [activeAttacks, positions]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-50"
        />
    );
};

export default ParticleCanvas;

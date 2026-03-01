import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export default function CursorFX() {
    const cursorX = useMotionValue(-200);
    const cursorY = useMotionValue(-200);

    // Dot — near-instant
    const dotX = useSpring(cursorX, { stiffness: 900, damping: 50 });
    const dotY = useSpring(cursorY, { stiffness: 900, damping: 50 });

    // Ring — lagged
    const ringX = useSpring(cursorX, { stiffness: 180, damping: 28 });
    const ringY = useSpring(cursorY, { stiffness: 180, damping: 28 });

    // Glow — very lagged
    const glowX = useSpring(cursorX, { stiffness: 80, damping: 22 });
    const glowY = useSpring(cursorY, { stiffness: 80, damping: 22 });

    const [hovering, setHovering] = useState(false);
    const [clicking, setClicking] = useState(false);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const isInteractive = (el: Element | null): boolean => {
            if (!el) return false;
            return !!el.closest('a, button, input, textarea, select, label, [role="button"], [tabindex]');
        };

        const onOver = (e: MouseEvent) => setHovering(isInteractive(e.target as Element));
        const onDown = (e: MouseEvent) => {
            setClicking(true);
            const id = Date.now();
            setRipples(r => [...r, { id, x: e.clientX, y: e.clientY }]);
            setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700);
        };
        const onUp = () => setClicking(false);

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mouseover', onOver, { passive: true });
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseover', onOver);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            {/* Click ripples */}
            <AnimatePresence>
                {ripples.map(r => (
                    <motion.div
                        key={r.id}
                        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
                        initial={{ width: 0, height: 0, x: r.x, y: r.y, translateX: '-50%', translateY: '-50%', opacity: 0.6 }}
                        animate={{ width: 80, height: 80, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        style={{ border: '1px solid rgba(168,85,247,0.7)' }}
                    />
                ))}
            </AnimatePresence>

            {/* Glow blob — very slow trail */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9997] rounded-full"
                style={{
                    x: glowX,
                    y: glowY,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: 120,
                    height: 120,
                    background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
                    filter: 'blur(12px)',
                }}
            />

            {/* Outer ring */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
                style={{
                    x: ringX,
                    y: ringY,
                    translateX: '-50%',
                    translateY: '-50%',
                    border: '1px solid rgba(168,85,247,0.6)',
                }}
                animate={{
                    width: clicking ? 18 : 28,
                    height: clicking ? 18 : 28,
                    borderColor: 'rgba(168,85,247,0.6)',
                    borderWidth: 1,
                    boxShadow: clicking
                        ? '0 0 8px rgba(168,85,247,0.8)'
                        : '0 0 8px rgba(168,85,247,0.2)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />

            {/* Inner dot */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
                style={{
                    x: dotX,
                    y: dotY,
                    translateX: '-50%',
                    translateY: '-50%',
                    background: 'linear-gradient(135deg, #c084fc, #a855f7)',
                    boxShadow: '0 0 8px rgba(168,85,247,0.9)',
                }}
                animate={{
                    width: clicking ? 3 : 6,
                    height: clicking ? 3 : 6,
                    opacity: clicking ? 0.5 : 1,
                }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
            />
        </>
    );
}

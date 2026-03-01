import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
    const { isDark, toggle } = useTheme();
    const isSmall = size === 'sm';

    const trackW = isSmall ? 50 : 56;
    const trackH = isSmall ? 26 : 30;
    const knobSize = isSmall ? 20 : 24;
    const pad = (trackH - knobSize) / 2;
    const knobX = isDark ? trackW - knobSize - pad : pad; // Fixed knob logic to match common toggle direction

    return (
        <motion.button
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                width: trackW,
                height: trackH,
                borderRadius: 9999,
                flexShrink: 0,
                cursor: 'pointer',
                outline: 'none',
                border: 'none',
                padding: 0,
                transition: 'background 0.4s ease, box-shadow 0.4s ease',
                ...(isDark ? {
                    background: 'linear-gradient(135deg, #1a0840 0%, #2d1269 60%, #3d1580 100%)',
                    boxShadow: '0 0 0 1px rgba(168,85,247,0.4), 0 2px 14px rgba(124,58,237,0.5)',
                } : {
                    background: '#fbf7ff',
                    boxShadow: '0 0 0 1.5px rgba(124, 85, 237, 0.45), 0 2px 8px rgba(124, 58, 237, 0.12)',
                }),
            }}
        >
            <AnimatePresence>
                {isDark && (
                    <motion.span
                        key="stars"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            position: 'absolute',
                            left: pad + 4,
                            right: knobSize + pad * 2 + 2,
                            top: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3,
                            pointerEvents: 'none',
                        }}
                    >
                        {[2.5, 1.8, 2.5].map((s, i) => (
                            <span key={i} style={{
                                width: s, height: s,
                                borderRadius: '50%',
                                background: 'rgba(196,148,255,0.55)',
                                flexShrink: 0,
                            }} />
                        ))}
                    </motion.span>
                )}

                {!isDark && (
                    <motion.span
                        key="lines"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            position: 'absolute',
                            left: knobSize + pad * 2 + 2,
                            right: 8,
                            top: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        {[6, 4, 6].map((h, i) => (
                            <span key={i} style={{
                                width: 1.5,
                                height: h,
                                borderRadius: 2,
                                background: 'rgba(124, 58, 237, 0.25)',
                                marginLeft: i > 0 ? 3 : 0,
                                flexShrink: 0,
                            }} />
                        ))}
                    </motion.span>
                )}
            </AnimatePresence>

            <motion.span
                animate={{ x: knobX }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{
                    position: 'absolute',
                    top: pad,
                    left: 0,
                    width: knobSize,
                    height: knobSize,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    ...(isDark ? {
                        background: 'linear-gradient(135deg,#7c3aed 0%,#a855f7 60%,#c084fc 100%)',
                        boxShadow: '0 2px 10px rgba(124,58,237,0.7), 0 0 18px rgba(168,85,247,0.45)',
                    } : {
                        background: '#7c3aed',
                        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)',
                    }),
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={isDark ? 'moon' : 'sun'}
                        initial={{ scale: 0.4, opacity: 0, rotate: isDark ? -60 : 60 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isDark
                            ? <Moon size={isSmall ? 11 : 13} style={{ color: '#ffffff', strokeWidth: 2 }} />
                            : <Sun size={isSmall ? 11 : 13} style={{ color: '#ffffff', strokeWidth: 2.5 }} />
                        }
                    </motion.span>
                </AnimatePresence>
            </motion.span>
        </motion.button>
    );
}

import { motion } from 'framer-motion';

/**
 * Shared auth-page background — rich but not overwhelming.
 * Drop this as the first child inside the page's root div.
 */
export default function AuthBg() {
    return (
        <>
            {/* Deep base */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 110% 80% at 15% 45%, rgba(88,28,235,0.18) 0%, transparent 60%),' +
                        'radial-gradient(ellipse 90% 90% at 85% 20%, rgba(124,58,237,0.14) 0%, transparent 55%),' +
                        'radial-gradient(ellipse 60% 60% at 75% 85%, rgba(168,85,247,0.1) 0%, transparent 60%),' +
                        'linear-gradient(180deg, #08051a 0%, #050310 100%)',
                }}
            />

            {/* Dot grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.055]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, rgba(168,85,247,0.85) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Large slow orb — top-left */}
            <motion.div className="absolute rounded-full pointer-events-none"
                animate={{ x: [0, 18, 0], y: [0, -14, 0], opacity: [0.45, 0.7, 0.45] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    width: 520, height: 520,
                    top: '-80px', left: '-80px',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, rgba(88,28,235,0.1) 45%, transparent 70%)',
                    filter: 'blur(64px)',
                }}
            />

            {/* Medium orb — bottom-right */}
            <motion.div className="absolute rounded-full pointer-events-none"
                animate={{ x: [0, -16, 0], y: [0, 12, 0], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                style={{
                    width: 420, height: 420,
                    bottom: '-60px', right: '-60px',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.24) 0%, rgba(124,58,237,0.08) 50%, transparent 70%)',
                    filter: 'blur(55px)',
                }}
            />

            {/* Small accent — top-right */}
            <motion.div className="absolute rounded-full pointer-events-none"
                animate={{ x: [0, -10, 0], y: [0, 16, 0], opacity: [0.25, 0.5, 0.25] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                style={{
                    width: 260, height: 260,
                    top: '8%', right: '5%',
                    background: 'radial-gradient(circle, rgba(192,132,252,0.18) 0%, transparent 65%)',
                    filter: 'blur(40px)',
                }}
            />

            {/* Subtle horizontal light band at top */}
            <div className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.35), rgba(124,58,237,0.5), rgba(168,85,247,0.35), transparent)',
                }}
            />
        </>
    );
}

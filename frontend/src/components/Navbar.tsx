import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const f = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', f, { passive: true });
        return () => window.removeEventListener('scroll', f);
    }, []);

    const navBg = isDark
        ? scrolled ? 'rgba(5,5,15,0.9)' : 'rgba(5,5,15,0.5)'
        : scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.75)';
    const navBorder = scrolled
        ? isDark ? '1px solid rgba(168,85,247,0.15)' : '1px solid rgba(0,0,0,0.1)'
        : '1px solid transparent';
    const navShadow = scrolled
        ? isDark
            ? '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(168,85,247,0.08)'
            : '0 4px 20px rgba(0,0,0,0.08), 0 1px 0 rgba(0,0,0,0.06)'
        : 'none';

    const linkColor = isDark ? 'rgba(220,210,255,0.75)' : 'rgba(31,41,55,0.7)';
    const linkHoverColor = isDark ? '#fff' : '#000000';
    const linkHoverBg = isDark ? 'rgba(168,85,247,0.22)' : 'rgba(0,0,0,0.05)';

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12"
            animate={{ backdropFilter: scrolled ? 'blur(24px)' : 'blur(12px)' }}
            style={{ background: navBg, borderBottom: navBorder, boxShadow: navShadow, transition: 'all 0.4s ease' }}>

            {/* Logo LEFT */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
                <div className="relative">
                    {isDark && (
                        <div className="absolute -inset-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.55), transparent 70%)', filter: 'blur(6px)', animation: 'glowPulse 3s ease-in-out infinite' }} />
                    )}
                    <img src="/logo.png" alt="Finexa" className="relative w-9 h-9 object-contain"
                        style={{ filter: isDark ? 'drop-shadow(0 0 10px rgba(168,85,247,0.9))' : 'none' }} />
                </div>
                <span className="font-display font-extrabold text-xl"
                    style={isDark
                        ? { background: 'linear-gradient(120deg,#7c3aed 0%,#a855f7 50%,#c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.01em' }
                        : { color: '#0a0a0a', letterSpacing: '-0.01em' }}>
                    Finexa
                </span>
            </Link>

            {/* Nav RIGHT */}
            <div className="flex items-center gap-4 md:gap-5 ml-auto">
                <div className="hidden md:flex items-center gap-1">
                    {[['How It Works', '/how-it-works'], ['Subscription', '/subscription'], ['FAQ', '/faq']].map(([label, href]) => (
                        <Link key={label} to={href}
                            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
                            style={{ color: linkColor, background: 'transparent', boxShadow: 'none' }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = linkHoverColor; el.style.background = linkHoverBg; }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = linkColor; el.style.background = 'transparent'; }}>
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Theme toggle */}
                <ThemeToggle size="sm" />

                {/* Action button */}
                <div className="flex items-center">
                    {user ? (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                            <Link to="/dashboard" className="btn text-xs px-3.5 py-1.5">
                                Dashboard <ArrowRight size={12} />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                            <Link to="/signup" className="btn text-xs px-3.5 py-1.5">
                                Get Started <ArrowRight size={12} />
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}

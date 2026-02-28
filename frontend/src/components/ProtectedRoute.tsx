import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                            style={{ borderTopColor: 'var(--aqua)', borderRightColor: 'rgba(0,212,255,0.3)' }} />
                        <div className="absolute inset-2 rounded-full animate-pulse"
                            style={{ background: 'rgba(0,212,255,0.1)' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--aqua)' }}>Loading Finexa...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    // Redirect to onboarding if not completed
    if (user.onboarding_completed === false && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
}

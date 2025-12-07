import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading, logout, login } = useAuth();
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  const handleSignInClick = () => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
    setShowAuthModal(false); // Закрываем модалку если она была открыта
  };

  const handleAuthSuccess = async () => {
    await login();
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' ? (
        <LandingPage onNavigateToDashboard={handleSignInClick} />
      ) : (
        <Dashboard onNavigateToLanding={handleLogout} />
      )}
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

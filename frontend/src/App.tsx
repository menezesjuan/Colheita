import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { AuthPage } from './pages/AuthPage.js';
import { GameDashboard } from './pages/GameDashboard.js';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060a08] flex items-center justify-center text-zinc-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <span>Sincronizando com o mundo rural...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <GameDashboard />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

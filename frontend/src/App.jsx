import { useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';

export function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('nova_user') || 'null'));

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  if (!user) return <Auth onLogin={setUser} />;
  return <Dashboard user={user} onLogout={logout} />;
}

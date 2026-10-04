import { useCallback, useEffect, useRef, useState } from 'react';
import { getUsers } from './api/users';
import { DiscoverView } from './components/DiscoverView';
import { ManageUsers } from './components/ManageUsers';
import { MatchesView } from './components/MatchesView';
import type { User } from './types';

type View = 'discover' | 'matches' | 'manage';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState<View>('discover');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setUsers(await getUsers());
    } catch {
      setLoadError('Unable to load users. Please make sure the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const currentUser = users.find((user) => user.id === currentUserId) ?? null;

  useEffect(() => {
    if (currentUser) return;
    setCurrentUserId(users.length > 0 ? users[0].id : null);
  }, [users, currentUser]);

  function showToast(message: string) {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 3000);
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="brand">DevMatch ❤️</h1>
          <p className="page-subtitle">
            Discover people you may connect with.
          </p>
        </div>

        {users.length > 0 && (
          <label className="user-switch">
            Playing as
            <select
              value={currentUserId ?? ''}
              onChange={(event) => setCurrentUserId(Number(event.target.value))}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (@{user.username})
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      <nav className="tabs">
        <button
          className={`tab ${view === 'discover' ? 'tab-active' : ''}`}
          onClick={() => setView('discover')}
        >
          Discover
        </button>
        <button
          className={`tab ${view === 'matches' ? 'tab-active' : ''}`}
          onClick={() => setView('matches')}
        >
          Matches
        </button>
        <button
          className={`tab ${view === 'manage' ? 'tab-active' : ''}`}
          onClick={() => setView('manage')}
        >
          Manage
        </button>
      </nav>

      <main>
        {loading && (
          <div className="state">
            <div className="spinner" />
            <p>Loading users…</p>
          </div>
        )}

        {!loading && loadError && (
          <div className="state">
            <div className="alert alert-error">{loadError}</div>
            <button className="btn btn-secondary" onClick={loadUsers}>
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && !currentUser && (
          <div className="state empty-state">
            <p className="empty-title">No users yet</p>
            <p className="empty-text">
              Create a user in the Manage tab to start matching.
            </p>
            <button className="btn btn-primary" onClick={() => setView('manage')}>
              Go to Manage
            </button>
          </div>
        )}

        {!loading && !loadError && currentUser && (
          <>
            {view === 'discover' && (
              <DiscoverView
                key={currentUser.id}
                currentUser={currentUser}
                onToast={showToast}
                onViewMatches={() => setView('matches')}
              />
            )}
            {view === 'matches' && <MatchesView currentUser={currentUser} />}
            {view === 'manage' && (
              <ManageUsers
                users={users}
                onChanged={loadUsers}
                onToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;

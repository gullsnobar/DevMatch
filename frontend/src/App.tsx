import { useCallback, useEffect, useRef, useState } from 'react';
import { getUsers } from './api/users';
import { DiscoverView } from './components/DiscoverView';
import { LikesView } from './components/LikesView';
import { ManageUsers } from './components/ManageUsers';
import { MatchesView } from './components/MatchesView';
import type { User } from './types';

type View = 'discover' | 'likes' | 'matches' | 'manage';
type MatchingView = Exclude<View, 'manage'>;

const matchingViews: Array<{ id: MatchingView; label: string }> = [
  { id: 'discover', label: 'Discover' },
  { id: 'likes', label: 'Likes you' },
  { id: 'matches', label: 'Matches' },
];

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
      setLoadError(
        'Unable to load profiles. Check that the API is running, then try again.',
      );
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
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            D
          </div>
          <div>
            <h1 className="brand">DevMatch</h1>
            <p className="brand-caption">Meet your people in tech</p>
          </div>
        </div>
        <button
          className={
            view === 'manage'
              ? 'btn btn-primary manage-link'
              : 'btn btn-secondary manage-link'
          }
          onClick={() => setView(view === 'manage' ? 'discover' : 'manage')}
        >
          {view === 'manage' ? 'Back to matching' : 'Manage profiles'}
        </button>
      </header>

      {users.length > 0 && (
        <section className="account-bar" aria-label="Demo profile">
          <div className="account-copy">
            <span className="account-label">Demo profile</span>
            <span className="account-hint">
              Switch profiles to try both sides of a match.
            </span>
          </div>
          <label className="user-switch">
            <span className="sr-only">Choose a profile</span>
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
        </section>
      )}

      {view !== 'manage' && (
        <nav className="tabs" aria-label="Matching steps">
          {matchingViews.map((step, index) => (
            <button
              key={step.id}
              className={view === step.id ? 'tab tab-active' : 'tab'}
              aria-current={view === step.id ? 'page' : undefined}
              onClick={() => setView(step.id)}
            >
              <span className="tab-step">0{index + 1}</span>
              {step.label}
            </button>
          ))}
        </nav>
      )}

      <main>
        {loading && (
          <div className="state">
            <div className="spinner" />
            <p>Loading profiles...</p>
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

        {!loading && !loadError && !currentUser && view !== 'manage' && (
          <div className="state empty-state">
            <span className="empty-icon" aria-hidden="true">
              +
            </span>
            <p className="empty-title">Start with a profile</p>
            <p className="empty-text">
              Add a few demo profiles, then discover people and try a match.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setView('manage')}
            >
              Create a profile
            </button>
          </div>
        )}

        {!loading && !loadError && view === 'manage' && (
          <ManageUsers
            users={users}
            onChanged={loadUsers}
            onToast={showToast}
          />
        )}

        {!loading && !loadError && currentUser && view !== 'manage' && (
          <>
            {view === 'discover' && (
              <DiscoverView
                key={currentUser.id}
                currentUser={currentUser}
                onToast={showToast}
                onViewMatches={() => setView('matches')}
                onViewLikes={() => setView('likes')}
                onManageProfiles={() => setView('manage')}
              />
            )}
            {view === 'likes' && (
              <LikesView
                key={currentUser.id}
                currentUser={currentUser}
                onToast={showToast}
                onViewMatches={() => setView('matches')}
                onViewDiscover={() => setView('discover')}
              />
            )}
            {view === 'matches' && (
              <MatchesView
                key={currentUser.id}
                currentUser={currentUser}
                onViewDiscover={() => setView('discover')}
              />
            )}
          </>
        )}
      </main>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;

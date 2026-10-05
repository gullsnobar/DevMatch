import { useEffect, useState } from 'react';
import { getMatches } from '../api/users';
import type { MatchedUser, User } from '../types';
import { ProfileModal } from './ProfileModal';

interface MatchesViewProps {
  currentUser: User;
  onViewDiscover: () => void;
}

export function MatchesView({ currentUser, onViewDiscover }: MatchesViewProps) {
  const [matches, setMatches] = useState<MatchedUser[] | null>(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [profileUser, setProfileUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError('');
    getMatches(currentUser.id)
      .then((data) => {
        if (!cancelled) setMatches(data);
      })
      .catch(() => {
        if (!cancelled)
          setError("We couldn't load your matches. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser.id, retryCount]);

  if (error) {
    return (
      <div className="state">
        <div className="alert alert-error">{error}</div>
        <button
          className="btn btn-secondary"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Try again
        </button>
      </div>
    );
  }

  if (matches === null) {
    return (
      <div className="state">
        <div className="spinner" />
        <p>Loading matches...</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="matches-title">
      <div className="screen-heading">
        <div>
          <span className="eyebrow">Step 3 of 3</span>
          <h2 className="screen-title" id="matches-title">
            Your matches
          </h2>
          <p className="screen-subtitle">
            You both liked each other. Your connections are all gathered here.
          </p>
        </div>
        {matches.length > 0 && (
          <span className="queue-pill">{matches.length} mutual</span>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-icon" aria-hidden="true">
            ♥
          </div>
          <p className="empty-title">No matches yet</p>
          <p className="empty-text">
            When you and another developer like each other, the match will show
            up here.
          </p>
          <button className="btn btn-primary" onClick={onViewDiscover}>
            Start discovering
          </button>
        </div>
      ) : (
        <ul className="user-list">
          {matches.map((user) => (
            <li key={user.id} className="user-card match-card">
              <div className="user-info">
                <span className="avatar avatar-sm" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="match-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-username">@{user.username}</span>
                  <span className="match-note">You both liked each other</span>
                </div>
              </div>
              <div className="user-actions">
                <span className="matched-at">
                  {isToday(user.matchedAt)
                    ? 'Matched today'
                    : `Matched ${new Date(user.matchedAt).toLocaleDateString()}`}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setProfileUser(user)}
                >
                  View profile
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {profileUser && (
        <ProfileModal
          user={profileUser}
          acting={false}
          showActions={false}
          onPass={() => {}}
          onLike={() => {}}
          onClose={() => setProfileUser(null)}
        />
      )}
    </section>
  );
}

function isToday(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

import { useEffect, useState } from 'react';
import { getIncomingLikes, getMatches } from '../api/users';
import type { MatchedUser, User } from '../types';

interface MatchesViewProps {
  currentUser: User;
}

export function MatchesView({ currentUser }: MatchesViewProps) {
  const [matches, setMatches] = useState<MatchedUser[] | null>(null);
  const [likedBy, setLikedBy] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');

    Promise.all([getMatches(currentUser.id), getIncomingLikes(currentUser.id)])
      .then(([matchesData, likesData]) => {
        if (cancelled) return;
        setMatches(matchesData);
        setLikedBy(likesData);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load matches. Please make sure the API is running.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser.id]);

  if (error) {
    return (
      <div className="state">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (matches === null) {
    return (
      <div className="state">
        <div className="spinner" />
        <p>Loading matches…</p>
      </div>
    );
  }

  const likedByIds = new Set(matches.map((match) => match.id));
  const pendingLikes = likedBy.filter((user) => !likedByIds.has(user.id));

  return (
    <section>
      {pendingLikes.length > 0 && (
        <p className="likes-hint">
          {pendingLikes.length} {pendingLikes.length === 1 ? 'person' : 'people'}{' '}
          liked you — like them back in Discover to match.
        </p>
      )}

      {matches.length === 0 ? (
        <div className="state empty-state">
          <p className="empty-title">No matches yet</p>
          <p className="empty-text">Keep discovering — matches show up here.</p>
        </div>
      ) : (
        <ul className="user-list">
          {matches.map((user) => (
            <li key={user.id} className="user-card match-card">
              <div className="user-info">
                <span className="avatar avatar-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="match-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-username">@{user.username}</span>
                </div>
                <span className="user-role">{user.role}</span>
              </div>
              <span className="matched-at">
                {isToday(user.matchedAt)
                  ? 'Matched today'
                  : `Matched ${new Date(user.matchedAt).toLocaleDateString()}`}
              </span>
            </li>
          ))}
        </ul>
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

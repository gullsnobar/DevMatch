import { useEffect, useState } from 'react';
import {
  ApiError,
  getIncomingLikes,
  getMatches,
  likeUser,
  passUser,
} from '../api/users';
import type { User } from '../types';
import { MatchModal } from './MatchModal';

interface LikesViewProps {
  currentUser: User;
  onToast: (message: string) => void;
  onViewMatches: () => void;
  onViewDiscover: () => void;
}

export function LikesView({
  currentUser,
  onToast,
  onViewMatches,
  onViewDiscover,
}: LikesViewProps) {
  const [likes, setLikes] = useState<User[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actingId, setActingId] = useState<number | null>(null);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLikes(null);
    setLoadError('');
    Promise.all([getIncomingLikes(currentUser.id), getMatches(currentUser.id)])
      .then(([incoming, matches]) => {
        if (cancelled) return;
        const matchedIds = new Set(matches.map((match) => match.id));
        setLikes(incoming.filter((user) => !matchedIds.has(user.id)));
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(
            "We couldn't load your likes. Check that the API is running, then try again.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser.id, retryCount]);

  function removeUser(id: number) {
    setLikes((list) => (list ? list.filter((user) => user.id !== id) : list));
  }

  function actionError(error: unknown) {
    if (error instanceof ApiError && error.status === 409) {
      return 'You already responded to this profile.';
    }
    return "We couldn't save that response. Please try again.";
  }

  async function handleLike(user: User) {
    if (actingId !== null) return;
    setActingId(user.id);
    try {
      const result = await likeUser(user.id, currentUser.id);
      removeUser(user.id);
      if (result.match && result.matchedWith) {
        setMatchedUser(result.matchedWith);
      } else {
        onToast(`You liked ${user.name}`);
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 409)
      ) {
        removeUser(user.id);
      }
      onToast(actionError(error));
    } finally {
      setActingId(null);
    }
  }

  async function handlePass(user: User) {
    if (actingId !== null) return;
    setActingId(user.id);
    try {
      await passUser(user.id, currentUser.id);
      removeUser(user.id);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 409)
      ) {
        removeUser(user.id);
      }
      onToast(actionError(error));
    } finally {
      setActingId(null);
    }
  }

  if (loadError) {
    return (
      <div className="state">
        <div className="alert alert-error">{loadError}</div>
        <button
          className="btn btn-secondary"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Try again
        </button>
      </div>
    );
  }

  if (likes === null) {
    return (
      <div className="state">
        <div className="spinner" />
        <p>Loading likes...</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="likes-title">
      <div className="screen-heading">
        <div>
          <span className="eyebrow">Step 2 of 3</span>
          <h2 className="screen-title" id="likes-title">
            Likes you
          </h2>
          <p className="screen-subtitle">
            These people liked your profile. Like them back to make a match.
          </p>
        </div>
        {likes.length > 0 && (
          <span className="queue-pill">{likes.length} waiting</span>
        )}
      </div>

      {likes.length === 0 ? (
        <div className="empty-panel">
          <div className="empty-icon" aria-hidden="true">
            L
          </div>
          <p className="empty-title">No likes yet</p>
          <p className="empty-text">
            When someone likes your profile, you can respond here. Keep
            discovering in the meantime.
          </p>
          <button className="btn btn-primary" onClick={onViewDiscover}>
            Back to discover
          </button>
        </div>
      ) : (
        <ul className="user-list">
          {likes.map((user) => (
            <li key={user.id} className="user-card">
              <div className="user-info">
                <span className="avatar avatar-sm" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div className="match-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-username">@{user.username}</span>
                </div>
                <span className="likes-badge">Likes your profile</span>
              </div>
              <div className="user-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => void handlePass(user)}
                  disabled={actingId !== null}
                >
                  {actingId === user.id ? 'Saving...' : 'Pass'}
                </button>
                <button
                  className="btn btn-like"
                  onClick={() => void handleLike(user)}
                  disabled={actingId !== null}
                >
                  {actingId === user.id ? 'Saving...' : 'Like back'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {matchedUser && (
        <MatchModal
          user={matchedUser}
          onClose={() => setMatchedUser(null)}
          onViewMatches={() => {
            setMatchedUser(null);
            onViewMatches();
          }}
        />
      )}
    </section>
  );
}

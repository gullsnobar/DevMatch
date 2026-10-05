import { useEffect, useState } from 'react';
import { ApiError, getDiscoverable, likeUser, passUser } from '../api/users';
import type { User } from '../types';
import { MatchModal } from './MatchModal';

interface DiscoverViewProps {
  currentUser: User;
  onToast: (message: string) => void;
  onViewMatches: () => void;
  onViewLikes: () => void;
  onManageProfiles: () => void;
}

export function DiscoverView({
  currentUser,
  onToast,
  onViewMatches,
  onViewLikes,
  onManageProfiles,
}: DiscoverViewProps) {
  const [candidates, setCandidates] = useState<User[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [acting, setActing] = useState<'like' | 'pass' | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setCandidates(null);
    setLoadError('');
    getDiscoverable(currentUser.id)
      .then((data) => {
        if (!cancelled) setCandidates(data);
      })
      .catch(() => {
        if (!cancelled)
          setLoadError(
            "We couldn't load profiles. Check that the API is running, then try again.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser.id, retryCount]);

  const current = candidates?.[0];

  function dropCurrent() {
    setCandidates((list) => (list ? list.slice(1) : list));
  }

  function errorMessage(error: unknown) {
    if (error instanceof ApiError && error.status === 409) {
      return 'You already responded to this profile.';
    }
    return "We couldn't save that response. Please try again.";
  }

  async function handleLike() {
    if (!current || acting) return;
    setActing('like');
    try {
      const result = await likeUser(current.id, currentUser.id);
      dropCurrent();
      if (result.match && result.matchedWith) {
        setMatchedUser(result.matchedWith);
      } else {
        onToast(`You liked ${current.name}`);
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 409)
      ) {
        dropCurrent();
      }
      onToast(errorMessage(error));
    } finally {
      setActing(null);
    }
  }

  async function handlePass() {
    if (!current || acting) return;
    setActing('pass');
    try {
      await passUser(current.id, currentUser.id);
      dropCurrent();
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 409)
      ) {
        dropCurrent();
      }
      onToast(errorMessage(error));
    } finally {
      setActing(null);
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

  if (candidates === null) {
    return (
      <div className="state">
        <div className="spinner" />
        <p>Finding profiles...</p>
      </div>
    );
  }

  return (
    <section className="discover-page" aria-labelledby="discover-title">
      <div className="screen-heading">
        <div>
          <span className="eyebrow">Step 1 of 3</span>
          <h2 className="screen-title" id="discover-title">
            Discover people
          </h2>
          <p className="screen-subtitle">
            Like a profile to show interest, or pass to see the next person.
          </p>
        </div>
        <span className="queue-pill">
          {candidates.length} {candidates.length === 1 ? 'profile' : 'profiles'}{' '}
          left
        </span>
      </div>

      <div className="how-it-works">
        <div className="flow-step">
          <span>1</span>
          <p>Like someone</p>
        </div>
        <div className="flow-connector" aria-hidden="true" />
        <div className="flow-step">
          <span>2</span>
          <p>They like you back</p>
        </div>
        <div className="flow-connector" aria-hidden="true" />
        <div className="flow-step">
          <span>3</span>
          <p>You match</p>
        </div>
      </div>

      {!current ? (
        <div className="empty-panel">
          <div className="empty-icon" aria-hidden="true">
            ✓
          </div>
          <p className="empty-title">You're all caught up</p>
          <p className="empty-text">
            You've seen everyone available for this profile. Check incoming
            likes or add more profiles to keep exploring.
          </p>
          <div className="empty-actions">
            <button className="btn btn-secondary" onClick={onViewLikes}>
              See who likes you
            </button>
            <button className="btn btn-primary" onClick={onManageProfiles}>
              Manage profiles
            </button>
          </div>
        </div>
      ) : (
        <>
          <article className="profile-card">
            <span className="profile-overline">Developer profile</span>
            <div className="avatar avatar-xl" aria-hidden="true">
              {current.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="profile-card-name">{current.name}</h3>
            <p className="discover-username">@{current.username}</p>
            <span className="user-role profile-card-role">{current.role}</span>
            <p className="profile-card-hint">Would you like to connect?</p>
          </article>

          <div className="action-row" aria-label="Respond to profile">
            <button
              className="btn btn-secondary action-btn"
              onClick={() => void handlePass()}
              disabled={acting !== null}
            >
              {acting === 'pass' ? 'Passing...' : 'Pass'}
            </button>
            <button
              className="btn btn-like action-btn"
              onClick={() => void handleLike()}
              disabled={acting !== null}
            >
              {acting === 'like' ? 'Sending like...' : 'Like'}
            </button>
          </div>
        </>
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

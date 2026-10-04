import { useEffect, useState } from 'react';
import { ApiError, getDiscoverable, likeUser, passUser } from '../api/users';
import type { User } from '../types';
import { MatchModal } from './MatchModal';
import { ProfileModal } from './ProfileModal';

interface DiscoverViewProps {
  currentUser: User;
  onToast: (message: string) => void;
  onViewMatches: () => void;
}

export function DiscoverView({
  currentUser,
  onToast,
  onViewMatches,
}: DiscoverViewProps) {
  const [candidates, setCandidates] = useState<User[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDiscoverable(currentUser.id)
      .then((data) => {
        if (!cancelled) setCandidates(data);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(
            'Unable to load profiles. Please make sure the API is running.',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser.id]);

  function removeCandidate(id: number) {
    setCandidates((current) =>
      current ? current.filter((user) => user.id !== id) : current,
    );
  }

  async function handleLike(user: User) {
    setActingId(user.id);
    try {
      const result = await likeUser(user.id, currentUser.id);
      removeCandidate(user.id);
      if (result.match && result.matchedWith) {
        setMatchedUser(result.matchedWith);
      } else {
        onToast(`You liked ${user.name}`);
      }
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 409)) {
        removeCandidate(user.id);
      }
      onToast(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    } finally {
      setActingId(null);
      setProfileUser(null);
    }
  }

  async function handlePass(user: User) {
    setActingId(user.id);
    try {
      await passUser(user.id, currentUser.id);
      removeCandidate(user.id);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 409)) {
        removeCandidate(user.id);
      }
      onToast(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    } finally {
      setActingId(null);
      setProfileUser(null);
    }
  }

  if (loadError) {
    return (
      <div className="state">
        <div className="alert alert-error">{loadError}</div>
      </div>
    );
  }

  if (candidates === null) {
    return (
      <div className="state">
        <div className="spinner" />
        <p>Loading profiles…</p>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="state empty-state">
        <p className="empty-title">No more people to discover</p>
        <p className="empty-text">
          You've seen everyone. Add more users in the Manage tab.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="discover-count">
        {candidates.length}{' '}
        {candidates.length === 1 ? 'person' : 'people'} nearby
      </p>

      <div className="discover-grid">
        {candidates.map((user) => (
          <button
            key={user.id}
            type="button"
            className="discover-card"
            onClick={() => setProfileUser(user)}
          >
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="discover-name">{user.name}</div>
            <div className="discover-username">@{user.username}</div>
            <div className="user-role discover-role">{user.role}</div>
            <div className="discover-actions">
              <button
                className="btn btn-secondary discover-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  void handlePass(user);
                }}
                disabled={actingId === user.id}
              >
                Pass
              </button>
              <button
                className="btn btn-like discover-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleLike(user);
                }}
                disabled={actingId === user.id}
              >
                {actingId === user.id ? '…' : 'Like'}
              </button>
            </div>
          </button>
        ))}
      </div>

      {profileUser && (
        <ProfileModal
          user={profileUser}
          acting={actingId === profileUser.id}
          onPass={(user) => void handlePass(user)}
          onLike={(user) => void handleLike(user)}
          onClose={() => setProfileUser(null)}
        />
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
    </>
  );
}

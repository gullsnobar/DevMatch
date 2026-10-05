import type { User } from '../types';

interface MatchModalProps {
  user: User;
  onClose: () => void;
  onViewMatches: () => void;
}

export function MatchModal({ user, onClose, onViewMatches }: MatchModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-sm match-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="match-symbol" aria-hidden="true">
          It's mutual
        </div>
        <h2 className="match-title" id="match-title">
          It's a match
        </h2>
        <p className="modal-text match-text">
          You and <strong>{user.name}</strong> liked each other.
        </p>
        <div className="modal-actions match-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Keep browsing
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onViewMatches}
          >
            View matches
          </button>
        </div>
      </div>
    </div>
  );
}

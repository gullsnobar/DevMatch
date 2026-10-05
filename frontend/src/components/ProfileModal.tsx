import type { User } from '../types';

interface ProfileModalProps {
  user: User;
  acting: boolean;
  showActions?: boolean;
  onPass: (user: User) => void;
  onLike: (user: User) => void;
  onClose: () => void;
}

export function ProfileModal({
  user,
  acting,
  showActions = true,
  onPass,
  onLike,
  onClose,
}: ProfileModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="avatar avatar-lg" aria-hidden="true">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="profile-name" id="profile-modal-title">
          {user.name}
        </h2>
        <p className="profile-username">@{user.username}</p>
        <span className="user-role">{user.role}</span>

        {showActions ? (
          <div className="discover-actions profile-actions">
            <button
              className="btn btn-secondary discover-btn"
              onClick={() => onPass(user)}
              disabled={acting}
            >
              Pass
            </button>
            <button
              className="btn btn-like discover-btn"
              onClick={() => onLike(user)}
              disabled={acting}
            >
              {acting ? 'Saving...' : 'Like'}
            </button>
          </div>
        ) : (
          <div className="modal-actions match-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

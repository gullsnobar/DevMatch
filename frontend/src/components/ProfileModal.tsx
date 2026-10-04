import type { User } from '../types';

interface ProfileModalProps {
  user: User;
  acting: boolean;
  onPass: (user: User) => void;
  onLike: (user: User) => void;
  onClose: () => void;
}

export function ProfileModal({
  user,
  acting,
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
        onClick={(event) => event.stopPropagation()}
      >
        <div className="avatar avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-username">@{user.username}</p>
        <span className="user-role">{user.role}</span>

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
            {acting ? '…' : 'Like'}
          </button>
        </div>
      </div>
    </div>
  );
}

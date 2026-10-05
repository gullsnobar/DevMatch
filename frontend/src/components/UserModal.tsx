import { useState } from 'react';
import type { FormEvent } from 'react';
import type { User, UserFormData } from '../types';

interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof UserFormData, string>>;

export function UserModal({ user, onClose, onSubmit }: UserModalProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [role, setRole] = useState(user?.role ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = user !== null;

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!username.trim()) next.username = 'Username is required';
    if (!role.trim()) next.role = 'Role is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        username: username.trim(),
        role: role.trim(),
      });
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
      >
        <h2 className="modal-title" id="user-modal-title">
          {isEdit ? 'Edit profile' : 'Create a profile'}
        </h2>
        <p className="modal-text">
          Profiles appear in Discover and can be switched from the demo profile
          menu.
        </p>
        {serverError && (
          <div className="alert alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="user-name">Display name</label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Gull"
              autoFocus
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="user-username">Username</label>
            <input
              id="user-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="gull-dev"
              autoComplete="off"
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="user-role">Role or specialty</label>
            <input
              id="user-role"
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Software engineer"
            />
            {errors.role && <span className="field-error">{errors.role}</span>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : isEdit
                  ? 'Save changes'
                  : 'Create profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

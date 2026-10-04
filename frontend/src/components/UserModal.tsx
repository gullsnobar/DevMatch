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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="modal-title">
          {isEdit ? 'Edit User' : 'Add User'}
        </h2>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="user-name">Name</label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Gull"
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
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="user-role">Role</label>
            <input
              id="user-role"
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Software Engineer"
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
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

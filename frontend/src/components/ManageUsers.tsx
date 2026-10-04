import { useState } from 'react';
import { createUser, deleteUser, updateUser } from '../api/users';
import type { User, UserFormData } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { UserModal } from './UserModal';

interface ManageUsersProps {
  users: User[];
  onChanged: () => Promise<void>;
  onToast: (message: string) => void;
}

export function ManageUsers({ users, onChanged, onToast }: ManageUsersProps) {
  const [modal, setModal] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  function openCreate() {
    setEditingUser(null);
    setModal('create');
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setModal('edit');
  }

  async function handleSubmit(data: UserFormData) {
    if (modal === 'create') {
      const created = await createUser(data);
      await onChanged();
      onToast(`User "${created.name}" created`);
    } else if (editingUser) {
      const changes: Partial<UserFormData> = {};
      if (data.name !== editingUser.name) changes.name = data.name;
      if (data.username !== editingUser.username)
        changes.username = data.username;
      if (data.role !== editingUser.role) changes.role = data.role;

      const updated = await updateUser(editingUser.id, changes);
      await onChanged();
      onToast(`User "${updated.name}" updated`);
    }
    setModal('closed');
    setEditingUser(null);
  }

  async function handleDelete() {
    if (!deletingUser) return;
    await deleteUser(deletingUser.id);
    await onChanged();
    onToast(`User "${deletingUser.name}" deleted`);
    setDeletingUser(null);
  }

  return (
    <section>
      <div className="section-header">
        <p className="manage-subtitle">
          Admin area. Create, edit, or remove users.
        </p>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add User
        </button>
      </div>

      {users.length === 0 ? (
        <div className="state empty-state">
          <p className="empty-title">No users yet</p>
          <p className="empty-text">Add your first team member.</p>
        </div>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id} className="user-card">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-username">@{user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <div className="user-actions">
                <button className="btn btn-ghost" onClick={() => openEdit(user)}>
                  Edit
                </button>
                <button
                  className="btn btn-ghost btn-danger-text"
                  onClick={() => setDeletingUser(user)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal !== 'closed' && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setModal('closed');
            setEditingUser(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {deletingUser && (
        <ConfirmDialog
          user={deletingUser}
          onCancel={() => setDeletingUser(null)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
}

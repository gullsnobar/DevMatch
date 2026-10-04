import { useCallback, useEffect, useRef, useState } from 'react';
import { createUser, deleteUser, getUsers, updateUser } from './api/users';
import { ConfirmDialog } from './components/ConfirmDialog';
import { UserModal } from './components/UserModal';
import type { User, UserFormData } from './types';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modal, setModal] = useState<'closed' | 'create' | 'edit'>('closed');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setUsers(await getUsers());
    } catch {
      setLoadError('Unable to load users. Please make sure the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function showToast(message: string) {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 3000);
  }

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
      setUsers((current) => [...current, created]);
      showToast(`User "${created.name}" created`);
    } else if (editingUser) {
      const changes: Partial<UserFormData> = {};
      if (data.name !== editingUser.name) changes.name = data.name;
      if (data.username !== editingUser.username)
        changes.username = data.username;
      if (data.role !== editingUser.role) changes.role = data.role;

      const updated = await updateUser(editingUser.id, changes);
      setUsers((current) =>
        current.map((user) => (user.id === updated.id ? updated : user)),
      );
      showToast(`User "${updated.name}" updated`);
    }
    setModal('closed');
    setEditingUser(null);
  }

  async function handleDelete() {
    if (!deletingUser) return;
    await deleteUser(deletingUser.id);
    setUsers((current) =>
      current.filter((user) => user.id !== deletingUser.id),
    );
    showToast(`User "${deletingUser.name}" deleted`);
    setDeletingUser(null);
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="brand">DevMatch</h1>
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">
            Manage your developers and team members.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add User
        </button>
      </header>

      <main>
        {loading && (
          <div className="state">
            <div className="spinner" />
            <p>Loading users…</p>
          </div>
        )}

        {!loading && loadError && (
          <div className="state">
            <div className="alert alert-error">{loadError}</div>
            <button className="btn btn-secondary" onClick={loadUsers}>
              Try again
            </button>
          </div>
        )}

        {!loading && !loadError && users.length === 0 && (
          <div className="state empty-state">
            <p className="empty-title">No users yet</p>
            <p className="empty-text">
              Get started by adding your first team member.
            </p>
            <button className="btn btn-primary" onClick={openCreate}>
              + Add User
            </button>
          </div>
        )}

        {!loading && !loadError && users.length > 0 && (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} className="user-card">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-username">@{user.username}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <div className="user-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={() => openEdit(user)}
                  >
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
      </main>

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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;

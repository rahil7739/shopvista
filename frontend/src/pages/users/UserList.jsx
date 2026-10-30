import { useCallback, useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSearch, FaTrash, FaUserCircle } from "react-icons/fa";
import api from "../../shared/api/client";

const pageSize = 5;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/users", { params: { per_page: 100 } });
      setUsers(data.data.map((user) => ({
        ...user,
        role: user.role || "user",
        status: user.active ? "Active" : "Inactive",
        joined: new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      })));
    } catch (error) {
      setFormError(error.response?.data?.message || "Unable to load users from the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api.get("/admin/users", { params: { per_page: 100 } })
      .then(({ data }) => {
        if (!active) return;
        setUsers(data.data.map((user) => ({
          ...user,
          role: user.role || "user",
          status: user.active ? "Active" : "Inactive",
          joined: new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        })));
      })
      .catch((error) => {
        if (active) setFormError(error.response?.data?.message || "Unable to load users from the server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.role} ${user.status}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query, users]);
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const openForm = (user = null) => {
    setEditingUser(user ? { ...user } : {
      id: null,
      name: "",
      email: "",
      role: "user",
      status: "Active",
      password: "",
      password_confirmation: "",
    });
    setFormError("");
  };

  const saveUser = async (event) => {
    event.preventDefault();
    const name = editingUser.name.trim();
    const email = editingUser.email.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Enter a name and a valid email address.");
      return;
    }
    if ((!editingUser.id || editingUser.password) && editingUser.password.length < 8) {
      setFormError("The password must be at least 8 characters.");
      return;
    }
    if (editingUser.password && editingUser.password !== editingUser.password_confirmation) {
      setFormError("The password confirmation does not match.");
      return;
    }

    const duplicateEmail = users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.id !== editingUser.id,
    );
    if (duplicateEmail) {
      setFormError("A user with this email address already exists.");
      return;
    }

    setFormError("");
    const payload = {
      name,
      email,
      role: editingUser.role,
      active: editingUser.status === "Active",
    };
    if (editingUser.password) {
      payload.password = editingUser.password;
      payload.password_confirmation = editingUser.password_confirmation;
    }

    try {
      if (editingUser.id) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
      } else {
        await api.post("/admin/users", payload);
      }
      setEditingUser(null);
      await loadUsers();
      setPage(1);
    } catch (error) {
      setFormError(
        Object.values(error.response?.data?.errors || {})[0]?.[0]
          || error.response?.data?.message
          || "Unable to save this user.",
      );
    }
  };

  const deleteUser = async (user) => {
    if (window.confirm(`Delete ${user.name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/users/${user.id}`);
        await loadUsers();
      } catch (error) {
        setFormError(error.response?.data?.message || "Unable to delete this user.");
      }
    }
  };

  return (
    <section className="users-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>Users</h1>
          <p className="muted-copy">Manage your store team and customer accounts.</p>
        </div>
        <button className="primary-button add-user-button" type="button" onClick={() => openForm()}>
          <FaPlus aria-hidden="true" /> Add user
        </button>
      </div>

      <section className="panel users-panel">
        <div className="users-toolbar">
          <div><h2>All users</h2><p className="muted-copy">{filteredUsers.length} users in this list</p></div>
          <label className="search-bar">
            <FaSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Search users..."
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              aria-label="Search users"
            />
          </label>
        </div>

        <div className="table-responsive">
          <table className="table custom-table users-table mb-0">
            <thead><tr><th>USER</th><th>ROLE</th><th>STATUS</th><th>JOINED</th><th className="text-end">ACTIONS</th></tr></thead>
            <tbody>
              {loading && <tr><td className="empty-table" colSpan="5">Loading users...</td></tr>}
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td><div className="user-identity"><FaUserCircle aria-hidden="true" /><div><strong>{user.name}</strong><span>{user.email}</span></div></div></td>
                  <td>{user.role === "user" ? "Customer" : user.role === "super-admin" ? "Super Admin" : "Admin"}</td>
                  <td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
                  <td>{user.joined}</td>
                  <td><div className="table-actions">
                    <button className="action-btn edit-btn" type="button" aria-label={`Edit ${user.name}`} onClick={() => openForm(user)}><FaEdit /></button>
                    <button className="action-btn delete-btn" type="button" aria-label={`Delete ${user.name}`} onClick={() => deleteUser(user)}><FaTrash /></button>
                  </div></td>
                </tr>
              ))}
              {!loading && visibleUsers.length === 0 && (
                <tr><td className="empty-table" colSpan="5">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="users-pagination">
          {formError && !editingUser && <p className="form-notice" role="alert">{formError}</p>}
          <span>Showing {filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length}</span>
          <div className="pagination-wrapper">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                className={page === pageNumber ? "active" : ""}
                aria-current={page === pageNumber ? "page" : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </div>
      </section>

      {editingUser && (
        <div className="custom-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingUser(null); }}>
          <section className="custom-modal user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div className="custom-modal-header">
              <div><h2 id="user-modal-title">{editingUser.id ? "Edit user" : "Add user"}</h2><p className="muted-copy">Changes are saved to the store database.</p></div>
              <button type="button" aria-label="Close dialog" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <form className="custom-modal-body user-form" noValidate onSubmit={saveUser}>
              <label htmlFor="user-name">Full name</label>
              <input id="user-name" value={editingUser.name} onChange={(event) => setEditingUser({ ...editingUser, name: event.target.value })} />
              <label htmlFor="user-email">Email address</label>
              <input id="user-email" type="email" value={editingUser.email} onChange={(event) => setEditingUser({ ...editingUser, email: event.target.value })} />
              {!editingUser.id && <><label htmlFor="user-password">Temporary password</label><input id="user-password" type="password" autoComplete="new-password" value={editingUser.password} onChange={(event) => setEditingUser({ ...editingUser, password: event.target.value })} /><label htmlFor="user-password-confirmation">Confirm temporary password</label><input id="user-password-confirmation" type="password" autoComplete="new-password" value={editingUser.password_confirmation} onChange={(event) => setEditingUser({ ...editingUser, password_confirmation: event.target.value })} /></>}
              {editingUser.id && <><label htmlFor="user-password">New password (optional)</label><input id="user-password" type="password" autoComplete="new-password" value={editingUser.password || ""} onChange={(event) => setEditingUser({ ...editingUser, password: event.target.value })} /><label htmlFor="user-password-confirmation">Confirm new password</label><input id="user-password-confirmation" type="password" autoComplete="new-password" value={editingUser.password_confirmation || ""} onChange={(event) => setEditingUser({ ...editingUser, password_confirmation: event.target.value })} /></>}
              <div className="user-form-row">
                <div><label htmlFor="user-role">Role</label><select id="user-role" value={editingUser.role} onChange={(event) => setEditingUser({ ...editingUser, role: event.target.value })}><option value="user">Customer</option><option value="admin">Admin</option></select></div>
                <div><label htmlFor="user-status">Status</label><select id="user-status" value={editingUser.status} onChange={(event) => setEditingUser({ ...editingUser, status: event.target.value })}><option>Active</option><option>Inactive</option></select></div>
              </div>
              {formError && <p className="form-notice" role="alert">{formError}</p>}
              <div className="user-form-actions"><button className="secondary-button" type="button" onClick={() => setEditingUser(null)}>Cancel</button><button className="primary-button" type="submit">Save user</button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};

export default UserList;
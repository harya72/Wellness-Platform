import { useState, useEffect } from 'react'
import { adminFetch } from '../config/supabase'
import { format } from 'date-fns'

export default function Users() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  useEffect(() => {
    adminFetch('/api/admin/users')
      .then(res => {
        setUsers(res.data.users)
        setTotal(res.data.total)
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')
    setCreating(true)
    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setUsers(prev => [res.data.user, ...prev])
      setTotal(t => t + 1)
      setCreateSuccess(`✅ User "${res.data.user.email}" created successfully!`)
      setForm({ email: '', password: '', name: '' })
      setTimeout(() => { setShowCreate(false); setCreateSuccess('') }, 2000)
    } catch (e) {
      setCreateError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q)
  })

  const stats = {
    total,
    onboarded: users.filter(u => u.isOnboarded).length,
    totalMeals: users.reduce((s, u) => s + (u._count?.meals || 0), 0),
  }

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Users</span>
        <div className="topbar-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create User
          </button>
        </div>
      </div>

      <div className="page-body" style={{ paddingTop: 28 }}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.onboarded}</div>
            <div className="stat-label">Onboarded</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-value">{stats.totalMeals}</div>
            <div className="stat-label">Total Meals Logged</div>
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">No users found</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Body Metrics</th>
                  <th>Goal</th>
                  <th>BMI</th>
                  <th>Calorie Goal</th>
                  <th>Meals</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                          {user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="cell-primary">{user.name || '—'}</div>
                          <div className="text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">
                      {user.weight ? `${user.weight}kg` : '—'}
                      {user.height ? ` · ${user.height}cm` : ''}
                      {user.gender ? ` · ${user.gender}` : ''}
                      {user.age ? ` · ${user.age}y` : ''}
                    </td>
                    <td>
                      {user.goal
                        ? <span className="badge badge-pending" style={{ textTransform: 'capitalize' }}>{user.goal}</span>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>{user.bmi ? user.bmi.toFixed(1) : '—'}</td>
                    <td>{user.dailyCalorieGoal ? `${user.dailyCalorieGoal} kcal` : '—'}</td>
                    <td className="cell-primary">{user._count?.meals ?? 0}</td>
                    <td>
                      <span className={`badge ${user.isOnboarded ? 'badge-approved' : 'badge-pending'}`}>
                        {user.isOnboarded ? '✅ Onboarded' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="text-muted">
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Create User Account</div>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>

            {createError && <div className="error-msg">⚠️ {createError}</div>}
            {createSuccess && (
              <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--green)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, marginBottom: 16 }}>
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Full Name (optional)</label>
                <input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Email address *</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <span className="spinner" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

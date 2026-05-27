import { useEffect, useState, useCallback } from 'react'
import { supabase, adminFetch } from '../config/supabase'
import { format, formatDistanceToNow } from 'date-fns'
import MealDetailModal from '../components/MealDetailModal'

const STATUS_FILTERS = ['all', 'pending', 'approved', 'flagged']

export default function MealsDashboard() {
  const [meals, setMeals] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [newIds, setNewIds] = useState(new Set())
  const [isLive, setIsLive] = useState(false)

  const fetchMeals = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: 100 })
      if (filter !== 'all') params.set('status', filter)
      const res = await adminFetch(`/api/admin/meals?${params}`)
      setMeals(res.data.meals)
      setTotal(res.data.total)
    } catch (e) {
      console.error('Failed to fetch meals:', e)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchMeals() }, [fetchMeals])

  useEffect(() => {
    const channel = supabase
      .channel('admin-meals-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Meal' }, (payload) => {
        const newMeal = payload.new
        setMeals(prev => [{ ...newMeal, user: {}, foodItems: [], comments: [] }, ...prev])
        setTotal(t => t + 1)
        setNewIds(s => new Set([...s, newMeal.id]))
        setTimeout(() => setNewIds(s => { const n = new Set(s); n.delete(newMeal.id); return n }), 3000)
        fetchMeals()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Meal' }, () => {
        fetchMeals()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'Meal' }, (payload) => {
        setMeals(prev => prev.filter(m => m.id !== payload.old.id))
        setTotal(t => t - 1)
      })
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => supabase.removeChannel(channel)
  }, [fetchMeals])

  const handleStatusChange = async (mealId, status) => {
    try {
      await adminFetch(`/api/admin/meals/${mealId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setMeals(prev => prev.map(m => m.id === mealId ? { ...m, status } : m))
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  const filteredMeals = meals.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.user?.name?.toLowerCase().includes(q) ||
      m.user?.email?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.mealType?.toLowerCase().includes(q)
    )
  })

  const stats = {
    total,
    pending: meals.filter(m => m.status === 'pending').length,
    approved: meals.filter(m => m.status === 'approved').length,
    flagged: meals.filter(m => m.status === 'flagged').length,
  }

  return (
    <>
      <div className="topbar">
        <div className="flex items-center gap-3">
          <span className="topbar-title">Meal Entries</span>
          {isLive && (
            <span className="badge badge-live">
              <span className="realtime-dot" /> Live
            </span>
          )}
        </div>
        <div className="topbar-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search user, meal…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="page-body" style={{ paddingTop: 28 }}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Meals</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚩</div>
            <div className="stat-value">{stats.flagged}</div>
            <div className="stat-label">Flagged</div>
          </div>
        </div>

        <div className="filters mb-4">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : filteredMeals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <div className="empty-state-text">No meal entries found</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Meal Type</th>
                  <th>Description</th>
                  <th>Calories</th>
                  <th>Macros (P/C/F)</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeals.map(meal => (
                  <tr
                    key={meal.id}
                    className={newIds.has(meal.id) ? 'row-new' : ''}
                    onClick={() => setSelectedMeal(meal)}
                  >
                    <td>
                      <div className="cell-primary">{meal.user?.name || '—'}</div>
                      <div className="text-muted truncate">{meal.user?.email}</div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{meal.mealType}</span>
                    </td>
                    <td>
                      <div className="truncate" style={{ maxWidth: 180 }}>
                        {meal.description || <span className="text-muted">No description</span>}
                      </div>
                    </td>
                    <td className="cell-primary">{meal.totalCalories} kcal</td>
                    <td className="text-muted">
                      {Math.round(meal.protein || 0)}g / {Math.round(meal.carbs || 0)}g / {Math.round(meal.fats || 0)}g
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        className="badge"
                        value={meal.status || 'pending'}
                        onChange={e => handleStatusChange(meal.id, e.target.value)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: meal.status === 'approved' ? 'var(--green)' :
                            meal.status === 'flagged' ? 'var(--red)' : 'var(--yellow)',
                          fontWeight: 600, fontSize: 11,
                        }}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="approved">✅ Approved</option>
                        <option value="flagged">🚩 Flagged</option>
                      </select>
                    </td>
                    <td className="text-muted">
                      {formatDistanceToNow(new Date(meal.createdAt), { addSuffix: true })}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedMeal(meal)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status)
            setSelectedMeal(prev => ({ ...prev, status }))
          }}
          onCommentAdded={(comment) => {
            setSelectedMeal(prev => ({
              ...prev,
              comments: [...(prev.comments || []), comment],
            }))
            setMeals(prev => prev.map(m =>
              m.id === selectedMeal.id
                ? { ...m, comments: [...(m.comments || []), comment] }
                : m
            ))
          }}
        />
      )}
    </>
  )
}

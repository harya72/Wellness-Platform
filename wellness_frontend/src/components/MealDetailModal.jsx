import { useState, useEffect } from 'react'
import { adminFetch } from '../config/supabase'
import { format } from 'date-fns'
import { formatDistanceToNow } from 'date-fns'

export default function MealDetailModal({ meal, onClose, onStatusChange, onCommentAdded }) {
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState('Admin')
  const [submitting, setSubmitting] = useState(false)
  const [comments, setComments] = useState(meal.comments || [])

  useEffect(() => {
    adminFetch(`/api/admin/meals/${meal.id}/comments`)
      .then(res => setComments(res.data.comments))
      .catch(() => { })
  }, [meal.id])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      const res = await adminFetch(`/api/admin/meals/${meal.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ authorName, body: comment }),
      })
      const newComment = res.data.comment
      setComments(prev => [...prev, newComment])
      onCommentAdded(newComment)
      setComment('')
    } catch (e) {
      console.error('Failed to add comment:', e)
    } finally {
      setSubmitting(false)
    }
  }

  const ai = meal.foodItems || []

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-header">
          <div>
            <div className="modal-title">🍽️ Meal Detail</div>
            <div className="text-muted" style={{ marginTop: 2 }}>
              {meal.user?.name || meal.user?.email} · {meal.mealType}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {meal.imageUrl && (
          <img src={meal.imageUrl} alt="Meal" className="meal-image" />
        )}

        <div className="meal-detail">
          <div className="detail-item">
            <div className="detail-label">Calories</div>
            <div className="detail-value">{meal.totalCalories} kcal</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Date</div>
            <div className="detail-value">
              {meal.mealDate ? format(new Date(meal.mealDate), 'MMM d, yyyy') : '—'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Meal Type</div>
            <div className="detail-value" style={{ textTransform: 'capitalize' }}>{meal.mealType}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <select
                value={meal.status || 'pending'}
                onChange={e => onStatusChange(meal.id, e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'inherit', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: 0 }}
              >
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Approved</option>
                <option value="flagged">🚩 Flagged</option>
              </select>
            </div>
          </div>
        </div>

        <div className="macro-bar">
          {[
            { label: 'Protein', value: meal.protein, unit: 'g', color: 'var(--blue)' },
            { label: 'Carbs', value: meal.carbs, unit: 'g', color: 'var(--yellow)' },
            { label: 'Fats', value: meal.fats, unit: 'g', color: 'var(--red)' },
            { label: 'Fiber', value: meal.fiber, unit: 'g', color: 'var(--green)' },
          ].map(({ label, value, unit, color }) => (
            <div className="macro-chip" key={label}>
              <div className="macro-chip-value" style={{ color }}>{Math.round(value || 0)}{unit}</div>
              <div className="macro-chip-label">{label}</div>
            </div>
          ))}
        </div>

        {meal.description && (
          <div style={{ marginTop: 16 }}>
            <div className="ai-badge">✨ AI Analysis</div>
            <div className="ai-insight">{meal.description}</div>
          </div>
        )}

        {ai.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="text-muted" style={{ marginBottom: 8 }}>Food Items ({ai.length})</div>
            <div className="food-items">
              {ai.map((item, i) => (
                <div className="food-item" key={i}>
                  <div>
                    <span className="food-name">{item.foodName}</span>
                    <span className="food-meta"> · {item.quantity}{item.unit}</span>
                  </div>
                  <span className="food-cal">{item.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="divider" />

        <div>
          <div className="card-title" style={{ marginBottom: 12 }}>
            💬 Admin Comments ({comments.length})
          </div>

          {comments.length > 0 ? (
            <div className="comments-list">
              {comments.map(c => (
                <div className="comment-item" key={c.id}>
                  <div className="comment-meta">
                    <span className="comment-author">{c.authorName}</span>
                    <span className="comment-time">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="comment-body">{c.body}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted" style={{ marginBottom: 12 }}>No comments yet.</div>
          )}

          <form onSubmit={handleAddComment} className="comment-form">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Your name"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                style={{ width: 140, flexShrink: 0 }}
              />
              <textarea
                placeholder="Write a comment…"
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ flex: 1, minHeight: 60 }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !comment.trim()}
              style={{ alignSelf: 'flex-end' }}
            >
              {submitting ? <span className="spinner" /> : '💬 Add Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

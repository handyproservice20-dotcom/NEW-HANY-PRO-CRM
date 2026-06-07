import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const STATUSES = ['draft', 'sent', 'approved', 'declined', 'completed']
const EMPTY_FORM = {
  customer_name: '',
  title: '',
  description: '',
  amount: '',
  status: 'draft',
  estimate_date: new Date().toISOString().split('T')[0],
}

export default function Estimates() {
  const [estimates, setEstimates] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [estRes, custRes] = await Promise.all([
      supabase.from('estimates').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, name').order('name'),
    ])
    if (!estRes.error) setEstimates(estRes.data)
    if (!custRes.error) setCustomers(custRes.data)
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function openEdit(est) {
    setEditing(est)
    setForm({
      customer_name: est.customer_name || '',
      title: est.title || '',
      description: est.description || '',
      amount: est.amount != null ? String(est.amount) : '',
      status: est.status || 'draft',
      estimate_date: est.estimate_date || new Date().toISOString().split('T')[0],
    })
    setError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleCustomerPick(e) {
    const name = e.target.value
    setForm(f => ({ ...f, customer_name: name }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Estimate title is required.'); return }
    setSaving(true)
    setError('')

    const payload = {
      customer_name: form.customer_name,
      title: form.title,
      description: form.description,
      amount: form.amount !== '' ? parseFloat(form.amount) : null,
      status: form.status,
      estimate_date: form.estimate_date || null,
    }

    if (editing) {
      const { error } = await supabase.from('estimates').update(payload).eq('id', editing.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('estimates').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    setSaving(false)
    closeModal()
    loadData()
  }

  async function handleDelete(est) {
    if (!confirm(`Delete estimate "${est.title}"? This cannot be undone.`)) return
    await supabase.from('estimates').delete().eq('id', est.id)
    loadData()
  }

  const filtered = estimates.filter(e => {
    const matchSearch = [e.customer_name, e.title, e.description].join(' ')
      .toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalFiltered = filtered.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Estimates</h1>
        <button className="btn-add" onClick={openAdd}>+ New Estimate</button>
      </div>

      <div className="card">
        <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search estimates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', background: 'white', minWidth: '120px' }}
          >
            <option value="all">All Status</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div>{search || filterStatus !== 'all' ? 'No estimates match your search.' : 'No estimates yet. Create your first one!'}</div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(est => (
                    <tr key={est.id}>
                      <td>{est.customer_name || '—'}</td>
                      <td style={{ fontWeight: 600 }}>{est.title}</td>
                      <td>{est.estimate_date || '—'}</td>
                      <td>{est.amount != null ? `$${parseFloat(est.amount).toLocaleString()}` : '—'}</td>
                      <td><span className={`badge badge-${est.status}`}>{est.status}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => openEdit(est)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDelete(est)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-soft)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{filtered.length} estimate{filtered.length !== 1 ? 's' : ''}</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                Total: ${totalFiltered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Estimate' : 'New Estimate'}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-msg">{error}</div>}

              <div className="form-group">
                <label>Customer</label>
                {customers.length > 0 ? (
                  <select name="customer_name" value={form.customer_name} onChange={handleCustomerPick}>
                    <option value="">— Select a customer —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="__other__">Other (type below)</option>
                  </select>
                ) : null}
                {(form.customer_name === '__other__' || customers.length === 0) && (
                  <input
                    name="customer_name"
                    value={form.customer_name === '__other__' ? '' : form.customer_name}
                    onChange={handleChange}
                    placeholder="Customer name"
                    style={{ marginTop: customers.length > 0 ? '8px' : '0' }}
                    autoFocus={customers.length === 0}
                  />
                )}
              </div>

              <div className="form-group">
                <label>Estimate Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Bathroom Remodel" autoFocus={customers.length > 0} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Scope of work, materials, details..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input name="estimate_date" type="date" value={form.estimate_date} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Estimate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

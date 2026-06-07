import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const EMPTY_FORM = { name: '', phone: '', email: '', address: '', notes: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name')
    if (!error) setCustomers(data)
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function openEdit(customer) {
    setEditing(customer)
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
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

  async function handleSave() {
    if (!form.name.trim()) { setError('Customer name is required.'); return }
    setSaving(true)
    setError('')

    if (editing) {
      const { error } = await supabase.from('customers').update(form).eq('id', editing.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('customers').insert(form)
      if (error) { setError(error.message); setSaving(false); return }
    }

    setSaving(false)
    closeModal()
    loadCustomers()
  }

  async function handleDelete(customer) {
    if (!confirm(`Delete ${customer.name}? This cannot be undone.`)) return
    await supabase.from('customers').delete().eq('id', customer.id)
    loadCustomers()
  }

  const filtered = customers.filter(c =>
    [c.name, c.phone, c.email, c.address].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Customers</h1>
        <button className="btn-add" onClick={openAdd}>+ Add Customer</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, phone, email, or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div>{search ? 'No customers match your search.' : 'No customers yet. Add your first one!'}</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td>{c.address || '—'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-edit" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(c)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Customer' : 'Add Customer'}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="error-msg">{error}</div>}
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" autoFocus />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 000-0000" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St, City, ST 00000" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

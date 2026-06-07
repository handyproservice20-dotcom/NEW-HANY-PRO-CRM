import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalEstimates: 0,
    approvedTotal: 0,
    pendingCount: 0,
  })
  const [recentEstimates, setRecentEstimates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const [customersRes, estimatesRes] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact' }),
      supabase.from('estimates').select('*').order('created_at', { ascending: false }).limit(5),
    ])

    const allEstimates = estimatesRes.data || []
    const approvedTotal = allEstimates
      .filter(e => e.status === 'approved' || e.status === 'completed')
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    const pendingCount = allEstimates.filter(e => e.status === 'sent' || e.status === 'draft').length

    setStats({
      totalCustomers: customersRes.count || 0,
      totalEstimates: allEstimates.length,
      approvedTotal,
      pendingCount,
    })
    setRecentEstimates(allEstimates.slice(0, 5))
    setLoading(false)
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div>Loading...</div>
  }

  return (
    <>
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-sub">
            <button
              onClick={() => setActiveTab('customers')}
              style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '13px', padding: 0 }}
            >
              View all →
            </button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Estimates</div>
          <div className="stat-value">{stats.totalEstimates}</div>
          <div className="stat-sub">
            <button
              onClick={() => setActiveTab('estimates')}
              style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '13px', padding: 0 }}
            >
              View all →
            </button>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-label">Approved Value</div>
          <div className="stat-value">${stats.approvedTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div className="stat-sub">Approved &amp; completed</div>
        </div>

        <div className="stat-card amber">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pendingCount}</div>
          <div className="stat-sub">Draft &amp; sent estimates</div>
        </div>
      </div>

      <div className="recent-section card">
        <div className="section-header">Recent Estimates</div>
        {recentEstimates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div>No estimates yet. <button onClick={() => setActiveTab('estimates')} style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '14px' }}>Create one →</button></div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEstimates.map(est => (
                  <tr key={est.id}>
                    <td>{est.customer_name || '—'}</td>
                    <td>{est.title}</td>
                    <td>{est.amount != null ? `$${parseFloat(est.amount).toLocaleString()}` : '—'}</td>
                    <td><span className={`badge badge-${est.status}`}>{est.status}</span></td>
                    <td>{est.estimate_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

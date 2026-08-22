function StatCard({ icon, label, value, action, onClick }) {
  return (
    <button className={`stat-card stat-card-${String(label).toLowerCase()}`} type="button" onClick={onClick}>
      <div className="stat-card-top">
        <span className="stat-card-icon" aria-hidden="true">{icon}</span>
        <span className="stat-card-label">{label}</span>
      </div>
      <strong className="stat-card-value">{value}</strong>
      <span className="stat-card-action">{action} →</span>
    </button>
  )
}

export default StatCard
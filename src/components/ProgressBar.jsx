function ProgressBar({ value, label }) {
  const progress = Math.min(100, Math.max(0, value))

  return (
    <div className="progress-wrap">
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
        <span className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="progress-value">{Math.round(progress)}%</span>
    </div>
  )
}

export default ProgressBar
import { useState } from 'react'
import { loginAdmin } from '../utils/adminAuthService.js'

function AdminLoginPage({ onAdminLoginSuccess, onSwitchToStudent }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')

    const cleanId = identifier.trim()
    const cleanPass = password.trim()

    if (!cleanId || !cleanPass) {
      setErrorMessage('Please enter both your admin ID/email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await loginAdmin(cleanId, cleanPass, true)
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid admin credentials.')
        setIsSubmitting(false)
        return
      }

      onAdminLoginSuccess(result.user)
    } catch {
      setErrorMessage('Authentication error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="admin-login-page" aria-label="Admin Login">
      <div className="login-card-container">
        <header className="login-brand-header">
          <div className="brand-logo-circle">CQ</div>
          <h1>CAMPUSQUEST</h1>
          <p className="brand-subline">Admin Login</p>
        </header>

        <form className="clean-auth-form" onSubmit={handleSubmit} noValidate>
          {/* 1. ADMIN ID / EMAIL */}
          <div className="auth-field-group">
            <label htmlFor="admin-identifier">Admin ID / Email</label>
            <input
              id="admin-identifier"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value)
                setErrorMessage('')
              }}
              placeholder="Enter admin ID or email"
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          {/* 2. PASSWORD */}
          <div className="auth-field-group password-group">
            <label htmlFor="admin-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrorMessage('')
                }}
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="auth-error-banner" role="alert">
              <span>❌ {errorMessage}</span>
            </div>
          )}

          {/* 3. LOGIN BUTTON */}
          <button className="clean-primary-btn auth-submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Login'}
          </button>

          {/* 4. SWITCH TO STUDENT APP */}
          <div className="switch-portal-row" style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              type="button"
              className="clean-link-btn inline-link"
              onClick={onSwitchToStudent}
            >
              ← Back to Student Portal
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default AdminLoginPage

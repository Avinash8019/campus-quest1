import { useState } from 'react'
import { loginStudent } from '../utils/authService.js'

function StudentLoginPage({ onLoginSuccess, onGoToRegister, onSwitchToAdmin, successMessage }) {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')

    const cleanRegNo = registrationNumber.trim().toUpperCase()
    const cleanPassword = password.trim()

    if (!cleanRegNo || !cleanPassword) {
      setErrorMessage('Please enter both your registration number and password.')
      return
    }

    const result = loginStudent(cleanRegNo, cleanPassword)
    if (!result.success) {
      setErrorMessage('Invalid registration number or password.')
      return
    }

    onLoginSuccess(result.user)
  }

  return (
    <main className="clean-login-page" aria-label="Student Login">
      <div className="login-card-container">
        <header className="login-brand-header">
          <div className="brand-logo-circle">CQ</div>
          <h1>CAMPUSQUEST</h1>
          <p className="brand-subline">SRKR Student Login</p>
        </header>

        {successMessage && (
          <div className="auth-info-banner" role="status">
            <span>✓ {successMessage}</span>
          </div>
        )}

        <form className="clean-auth-form" onSubmit={handleSubmit} noValidate>
          {/* 1. REGISTRATION NUMBER */}
          <div className="auth-field-group">
            <label htmlFor="login-reg-number">Registration Number</label>
            <input
              id="login-reg-number"
              type="text"
              value={registrationNumber}
              onChange={(e) => {
                setRegistrationNumber(e.target.value.toUpperCase())
                setErrorMessage('')
              }}
              placeholder="Enter your registration number (e.g. 25B91A61XX)"
              autoComplete="username"
              maxLength={12}
              autoFocus
              required
            />
          </div>

          {/* 2. PASSWORD */}
          <div className="auth-field-group password-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrorMessage('')
                }}
                placeholder="Enter your password"
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
          <button className="clean-primary-btn auth-submit-btn" type="submit">
            Login →
          </button>

          {/* 4. REGISTER LINK */}
          <div className="switch-portal-row register-cta-row">
            <span>New student? </span>
            <button
              type="button"
              className="clean-link-btn inline-link"
              onClick={onGoToRegister}
            >
              Create an account
            </button>
          </div>

          {/* 5. ADMIN PORTAL LINK */}
          {onSwitchToAdmin && (
            <div className="switch-portal-row" style={{ marginTop: 18, borderTop: '1px solid var(--game-border)', paddingTop: 14 }}>
              <button
                type="button"
                className="clean-link-btn"
                onClick={onSwitchToAdmin}
                style={{ fontSize: 12, color: 'var(--game-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>🏛️</span>
                <span>Administrator Login</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

export default StudentLoginPage

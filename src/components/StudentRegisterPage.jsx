import { useState } from 'react'
import { registerStudent } from '../utils/authService.js'

const BRANCH_OPTIONS = [
  'AI & ML',
  'CSE',
  'CSE (AI)',
  'CSE (DS)',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'Information Technology (IT)',
  'Computer Science & Business Systems (CSBS)',
  'Computer Science & Design (CSD)',
]

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

function StudentRegisterPage({ onGoToLogin, onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    email: '',
    branch: '',
    year: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [successBanner, setSuccessBanner] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'registrationNumber' ? value.toUpperCase() : value,
    }))
    setErrorMessage('')
    setIsDuplicate(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')
    setIsDuplicate(false)

    try {
      const result = await registerStudent(formData)
      if (!result.success) {
        setErrorMessage(result.error)
        if (result.isDuplicate) {
          setIsDuplicate(true)
        }
        return
      }

      // Success
      setSuccessBanner('✓ Account Created! Welcome to CampusQuest.')
      setTimeout(() => {
        onRegistrationSuccess(result.message)
      }, 1200)
    } catch {
      setErrorMessage('Unable to connect to server. Please try again.')
    }
  }

  return (
    <main className="clean-login-page" aria-label="Student Registration">
      <div className="login-card-container register-card-wide">
        <header className="login-brand-header">
          <div className="brand-logo-circle">CQ</div>
          <h1>Create Your SRKR Account</h1>
          <p className="brand-subline">Register once to start exploring SRKR with CampusQuest.</p>
        </header>

        {successBanner ? (
          <div className="auth-success-celebration" role="status">
            <div className="celebration-check">✓</div>
            <h2>Account Created Successfully!</h2>
            <p>Redirecting to student login...</p>
          </div>
        ) : (
          <form className="clean-auth-form" onSubmit={handleSubmit} noValidate>
            {/* 1. FULL NAME */}
            <div className="auth-field-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                autoFocus
                required
              />
            </div>

            {/* 2. REGISTRATION NUMBER */}
            <div className="auth-field-group">
              <label htmlFor="reg-number">Registration Number</label>
              <input
                id="reg-number"
                name="registrationNumber"
                type="text"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="25B91A61XX"
                autoComplete="off"
                maxLength={12}
                required
              />
            </div>

            {/* 3. SRKR EMAIL */}
            <div className="auth-field-group">
              <label htmlFor="reg-email">SRKR Email</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="yourname@srkrec.ac.in"
                autoComplete="email"
                required
              />
            </div>

            {/* 4. BRANCH & 5. YEAR */}
            <div className="auth-row-fields">
              <div className="auth-field-group">
                <label htmlFor="reg-branch">Branch</label>
                <select
                  id="reg-branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Branch</option>
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="auth-field-group">
                <label htmlFor="reg-year">Year</label>
                <select
                  id="reg-year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Year</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 6. PASSWORD */}
            <div className="auth-field-group password-group">
              <label htmlFor="reg-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  autoComplete="new-password"
                  minLength={8}
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
              <small className="field-hint-text">Minimum 8 characters</small>
            </div>

            {/* 7. CONFIRM PASSWORD */}
            <div className="auth-field-group password-group">
              <label htmlFor="reg-confirm-password">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="auth-error-banner" role="alert">
                <span>❌ {errorMessage}</span>
                {isDuplicate && (
                  <button
                    type="button"
                    className="error-goto-login-btn"
                    onClick={onGoToLogin}
                  >
                    Go to Login →
                  </button>
                )}
              </div>
            )}

            <button className="clean-primary-btn auth-submit-btn" type="submit">
              Create Account →
            </button>

            <div className="switch-portal-row">
              <span>Already have an account? </span>
              <button
                type="button"
                className="clean-link-btn inline-link"
                onClick={onGoToLogin}
              >
                Log In Here →
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default StudentRegisterPage

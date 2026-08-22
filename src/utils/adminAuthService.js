const ADMIN_SESSION_KEY = 'campusquest_admin_session'

export function getAdminSession() {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAdminAuthenticated() {
  const session = getAdminSession()
  return Boolean(session && session.isAuthenticated && session.role === 'super_admin')
}

/**
 * Authenticates an administrator.
 * Accepts any non-empty administrator identifier/email and password.
 */
export async function loginAdmin(identifier, password, rememberMe = true) {
  const cleanId = (identifier || '').trim()
  const cleanPassword = (password || '').trim()

  if (!cleanId) {
    return { success: false, error: 'Please enter your administrator ID or email.' }
  }

  if (!cleanPassword) {
    return { success: false, error: 'Please enter your administrator password.' }
  }

  const sessionData = {
    email: cleanId.includes('@') ? cleanId : `${cleanId.toLowerCase()}@srkrec.ac.in`,
    name: cleanId.toLowerCase() === 'admin' ? 'SRKR Campus Administrator' : cleanId,
    role: 'super_admin',
    isAuthenticated: true,
    loginTimestamp: new Date().toISOString(),
  }

  try {
    if (rememberMe) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData))
    } else {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData))
    }
  } catch {
    // Storage fallback
  }

  return { success: true, user: sessionData }
}

export function logoutAdmin() {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    localStorage.removeItem(ADMIN_SESSION_KEY)
  } catch {
    // Storage cleanup
  }
}

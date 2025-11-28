import { useAuthStore } from '../stores/auth'

/**
 * useAuth hook
 */
export const useAuth = () => {
  const {
    status,
    tokens,
    me,
    userInfo,
    error,
    login,
    refresh,
    fetchMe,
    fetchUserInfo,
    logout,
    clearError,
  } = useAuthStore()

  return {
    //status: 'checking' | 'authenticated' | 'unauthenticated'
    status,
    tokens,
    me,
    userInfo,
    error,
    // if token exists and status is not unauthenticated, then isAuthenticated is true
    isAuthenticated: !!tokens && status !== 'unauthenticated',
    isLoading: status === 'checking',

    // methods
    login,
    refresh,
    fetchMe,
    fetchUserInfo,
    logout,
    clearError,
  }
}

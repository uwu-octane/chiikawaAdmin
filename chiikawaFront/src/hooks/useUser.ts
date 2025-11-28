import { useUserStore } from '../stores/user'

/**
 * useUser hook
 */
export const useUser = () => {
  const { profile, status, error, fetchUserProfile, setUserProfile, clearUserProfile, clearError } =
    useUserStore()

  return {
    profile,
    status,
    error,
    // status checks
    isLoading: status === 'loading',
    isLoaded: status === 'loaded',
    hasProfile: !!profile,

    // methods
    fetchUserProfile,
    setUserProfile,
    clearUserProfile,
    clearError,
  }
}

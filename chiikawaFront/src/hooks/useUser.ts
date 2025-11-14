import { useUserStore } from '../stores/user'

/**
 * useUser hook - 封装 user store 的便捷方法
 */
export const useUser = () => {
  const { profile, status, error, fetchUserProfile, setUserProfile, clearUserProfile, clearError } =
    useUserStore()

  return {
    // 状态
    profile,
    status,
    error,
    // 便捷状态判断
    isLoading: status === 'loading',
    isLoaded: status === 'loaded',
    hasProfile: !!profile,

    // 方法
    fetchUserProfile,
    setUserProfile,
    clearUserProfile,
    clearError,
  }
}


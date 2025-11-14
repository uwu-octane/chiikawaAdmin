import { useAuthStore } from '../stores/auth'
import type { LoginReq } from '../api/generated/schemas'

/**
 * useAuth hook - 封装 auth store 的便捷方法
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
    // 状态
    status,
    tokens,
    me,
    userInfo,
    error,
    // 改进：如果有 tokens 且状态不是 unauthenticated，就认为已登录
    // 这样刷新后只要 tokens 在，就先当作登录状态，用户体验更好
    isAuthenticated: status === 'authenticated' || (!!tokens && status !== 'unauthenticated'),
    isLoading: status === 'checking',

    // 方法
    login: async (payload: LoginReq) => {
      await login(payload)
    },
    refresh,
    fetchMe,
    fetchUserInfo,
    logout,
    clearError,
  }
}

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LoginReq, LoginResp, MeResp, UserInfoResp } from '../api/generated/schemas'
import { login, logout, logoutAll, me, refresh } from '../api/generated/auth/auth'
import { getUserInfo } from '../api/generated/user/user'
import { useUserStore } from './user'

// ====== 类型定义 ======

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated'

export interface AuthTokens {
  accessToken: string
  tokenType: string
  expiresAt: number // 毫秒时间戳
  sessionId?: string
}

export interface AuthState {
  status: AuthStatus
  tokens: AuthTokens | null
  me: MeResp | null
  userInfo: UserInfoResp | null
  error: string | null

  // === actions ===
  login: (payload: LoginReq) => Promise<void>
  refresh: () => Promise<void>
  fetchMe: () => Promise<void>
  fetchUserInfo: () => Promise<void>
  logout: (all?: boolean) => Promise<void>

  // 辅助：清空错误
  clearError: () => void
}

// ====== 从 LoginResp 映射到前端可用 tokens ======
function mapLoginRespToTokens(resp: LoginResp): AuthTokens {
  const now = Date.now()
  const expiresInMs = resp.expires_in * 1000 // 后端返回的是秒，转换为毫秒

  return {
    accessToken: resp.access_token,
    tokenType: resp.token_type || 'Bearer',
    expiresAt: now + expiresInMs,
    sessionId: resp.session_id,
  }
}

// ====== 保存 token 到 localStorage（与 client.ts 保持一致） ======
function saveTokenToLocalStorage(token: string) {
  localStorage.setItem('access_token', token)
}

function removeTokenFromLocalStorage() {
  localStorage.removeItem('access_token')
}

// ====== store 实现 ======
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      tokens: null,
      me: null,
      userInfo: null,
      error: null,

      clearError: () => set({ error: null }),

      // 登录：成功后写入 tokens，并把状态设为 authenticated
      async login(payload) {
        set({ status: 'checking', error: null })

        try {
          const resp = await login(payload)
          const tokens = mapLoginRespToTokens(resp.data)

          // 保存 token 到 localStorage（与 client.ts 保持一致）
          saveTokenToLocalStorage(tokens.accessToken)

          set({
            tokens,
            status: 'authenticated',
            error: null,
          })

          // 登录成功后自动获取用户资料（用于填充 avatar dropdown 等）
          // 使用 useUserStore 而不是 auth store 的 userInfo
          try {
            await useUserStore.getState().fetchUserProfile()
          } catch (err) {
            // 获取用户信息失败不影响登录流程，只记录错误
            console.warn('Failed to fetch user profile after login', err)
          }
        } catch (err) {
          console.error('login error', err)
          removeTokenFromLocalStorage()
          const errorMessage = err instanceof Error ? err.message : '登录失败'
          set({
            status: 'unauthenticated',
            error: errorMessage,
            tokens: null,
            me: null,
            userInfo: null,
          })
          throw err // 让调用方可以根据错误做 UI 反馈
        }
      },

      // 刷新 access token（使用 cookie(sid)）
      async refresh() {
        const { tokens } = get()

        // 如果本地都没 token 了，一般就算未登录，不必刷新
        if (!tokens) {
          set({ status: 'unauthenticated' })
          return
        }

        try {
          const resp = await refresh()
          const newTokens = mapLoginRespToTokens(resp.data)

          // 更新 localStorage 中的 token
          saveTokenToLocalStorage(newTokens.accessToken)

          set({
            tokens: newTokens,
            status: 'authenticated',
          })
        } catch (err) {
          console.error('refresh error', err)
          removeTokenFromLocalStorage()
          // 刷新失败，直接视为登出
          const errorMessage = err instanceof Error ? err.message : '刷新登录状态失败'
          set({
            tokens: null,
            me: null,
            userInfo: null,
            status: 'unauthenticated',
            error: errorMessage,
          })
        }
      },

      // 获取 JWT claims 信息（uid/jti/iat）
      async fetchMe() {
        try {
          const resp = await me()
          set({ me: resp.data })
        } catch (err) {
          console.error('fetchMe error', err)
          // 如果 401，这里不要把 tokens 立刻清掉，交给 refresh/路由守卫处理也可以
          const errorMessage = err instanceof Error ? err.message : '获取身份信息失败'
          set({ error: errorMessage })
        }
      },

      // 获取展示用用户信息（头像、昵称等）
      async fetchUserInfo() {
        try {
          const resp = await getUserInfo()
          set({ userInfo: resp.data })
        } catch (err) {
          console.error('fetchUserInfo error', err)
          const errorMessage = err instanceof Error ? err.message : '获取用户信息失败'
          set({ error: errorMessage })
        }
      },

      // 登出：默认当前 session，传 all=true 调用 LogoutAll
      async logout(all = false) {
        try {
          if (all) {
            await logoutAll()
          } else {
            await logout()
          }
        } catch (err) {
          // 这里即使后端报错，一般也没必要阻止前端清空状态
          console.warn('logout error', err)
        } finally {
          removeTokenFromLocalStorage()
          set({
            tokens: null,
            me: null,
            userInfo: null,
            status: 'unauthenticated',
            error: null,
          })
          // 登出时同时清空 user store
          useUserStore.getState().clearUserProfile()
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => window.localStorage),
      // 只持久化 tokens，避免把各种 runtime 状态写进 storage
      partialize: (state) => ({
        tokens: state.tokens,
      }),
      // rehydrate 之后，同步 tokens 和 access_token
      onRehydrateStorage: () => (state) => {
        const token = state?.tokens?.accessToken
        if (token) {
          saveTokenToLocalStorage(token)
        } else {
          removeTokenFromLocalStorage()
        }
      },
    },
  ),
)

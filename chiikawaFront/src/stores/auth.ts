import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LoginReq, LoginResp, MeResp, UserInfoResp } from '../api/generated/schemas'
import { login, logout, logoutAll, me, refresh } from '../api/generated/auth/auth'
import { getUserInfo } from '../api/generated/user/user'
import { useUserStore } from './user'

// ====== Type definitions ======

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated'

export interface AuthTokens {
  accessToken: string
  tokenType: string
  expiresAt: number
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

  // helper: clear error
  clearError: () => void
}

// ====== Map LoginResp to frontend usable tokens ======
function mapLoginRespToTokens(resp: LoginResp): AuthTokens {
  const now = Date.now()
  const expiresInMs = resp.expires_in * 1000 // backend returns seconds, convert to milliseconds

  return {
    accessToken: resp.access_token,
    tokenType: resp.token_type || 'Bearer',
    expiresAt: now + expiresInMs,
    sessionId: resp.session_id,
  }
}

// ====== Save token to localStorage (consistent with client.ts) ======
function saveTokenToLocalStorage(token: string) {
  localStorage.setItem('access_token', token)
}

function removeTokenFromLocalStorage() {
  localStorage.removeItem('access_token')
}

// ====== store implementation ======
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      tokens: null,
      me: null,
      userInfo: null,
      error: null,

      clearError: () => set({ error: null }),
      // login: write tokens to localStorage and set status to authenticated after successful login
      async login(payload) {
        set({ status: 'checking', error: null })

        try {
          const resp = await login(payload)
          const tokens = mapLoginRespToTokens(resp.data)

          // save token to localStorage (consistent with client.ts)
          saveTokenToLocalStorage(tokens.accessToken)

          set({
            tokens,
            status: 'authenticated',
            error: null,
          })

          // after login, automatically fetch user profile (for avatar dropdown, etc.)
          try {
            await useUserStore.getState().fetchUserProfile()
          } catch (err) {
            // if fetching user profile fails, it does not affect the login process, only record the error
            console.warn('Failed to fetch user profile after login', err)
          }
        } catch (err) {
          console.error('login error', err)
          removeTokenFromLocalStorage()
          const errorMessage = err instanceof Error ? err.message : 'login failed'
          set({
            status: 'unauthenticated',
            error: errorMessage,
            tokens: null,
            me: null,
            userInfo: null,
          })
          throw err // let caller do UI feedback based on error
        }
      },

      // refresh access token (using cookie(sid))
      async refresh() {
        const { tokens } = get()

        // if no token in localStorage, usually it means not logged in, no need to refresh
        if (!tokens) {
          set({ status: 'unauthenticated' })
          return
        }

        try {
          const resp = await refresh()
          const newTokens = mapLoginRespToTokens(resp.data)

          // update token in localStorage
          saveTokenToLocalStorage(newTokens.accessToken)

          set({
            tokens: newTokens,
            status: 'authenticated',
          })
        } catch (err) {
          console.error('refresh error', err)
          removeTokenFromLocalStorage()
          // if refresh fails, directly视为登出
          const errorMessage = err instanceof Error ? err.message : 'refresh login status failed'
          set({
            tokens: null,
            me: null,
            userInfo: null,
            status: 'unauthenticated',
            error: errorMessage,
          })
        }
      },

      // fetch JWT claims information (uid/jti/iat)
      async fetchMe() {
        try {
          const resp = await me()
          set({ me: resp.data })
        } catch (err) {
          console.error('fetchMe error', err)
          // if 401, do not clear tokens immediately, let refresh/route guard handle it
          const errorMessage = err instanceof Error ? err.message : 'fetch me information failed'
          set({ error: errorMessage })
        }
      },

      // fetch user information for display (avatar, nickname, etc.)
      async fetchUserInfo() {
        try {
          const resp = await getUserInfo()
          set({ userInfo: resp.data })
        } catch (err) {
          console.error('fetchUserInfo error', err)
          const errorMessage = err instanceof Error ? err.message : 'fetch user information failed'
          set({ error: errorMessage })
        }
      },

      // logout: default current session, call LogoutAll if all=true
      async logout(all = false) {
        try {
          if (all) {
            await logoutAll()
          } else {
            await logout()
          }
        } catch (err) {
          // if backend error, usually it is not necessary to prevent frontend from clearing state
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
          // clear user store when logout
          useUserStore.getState().clearUserProfile()
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => window.localStorage),
      // only persist tokens, avoid writing various runtime states to storage
      partialize: (state) => ({
        tokens: state.tokens,
      }),
      // after rehydrate, sync tokens and access_token
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

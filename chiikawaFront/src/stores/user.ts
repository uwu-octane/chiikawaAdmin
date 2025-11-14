import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserInfoResp } from '../api/generated/schemas'
import { getUserInfo } from '../api/generated/user/user'

// ====== 类型定义 ======

export type UserStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UserState {
  // 用户档案（当前登录用户）
  profile: UserInfoResp | null
  status: UserStatus
  error: string | null

  // === actions ===
  fetchUserProfile: () => Promise<void>
  setUserProfile: (profile: UserInfoResp | null) => void
  clearUserProfile: () => void
  clearError: () => void
}

// ====== store 实现 ======
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      status: 'idle',
      error: null,

      clearError: () => set({ error: null }),

      setUserProfile: (profile) =>
        set({
          profile,
          status: profile ? 'loaded' : 'idle',
          error: null,
        }),

      clearUserProfile: () =>
        set({
          profile: null,
          status: 'idle',
          error: null,
        }),

      async fetchUserProfile() {
        set({ status: 'loading', error: null })

        try {
          const resp = await getUserInfo()
          set({
            profile: resp.data,
            status: 'loaded',
            error: null,
          })
        } catch (err) {
          console.error('fetchUserProfile error', err)
          const message = err instanceof Error ? err.message : '获取用户信息失败'
          set({
            status: 'error',
            error: message,
          })
        }
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => window.localStorage),
      // 可以只持久化 profile，status/error 属于 runtime
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
)

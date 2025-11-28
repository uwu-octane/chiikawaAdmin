import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserInfoResp } from '../api/generated/schemas'
import { getUserInfo } from '../api/generated/user/user'

// ====== Type definitions ======

export type UserStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface UserState {
  // user profile (current logged in user)
  profile: UserInfoResp | null
  status: UserStatus
  error: string | null

  // === actions ===
  fetchUserProfile: () => Promise<void>
  setUserProfile: (profile: UserInfoResp | null) => void
  clearUserProfile: () => void
  clearError: () => void
}

// ====== store implementation ======
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
          const message = err instanceof Error ? err.message : 'fetch user information failed'
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
      // only persist profile, status/error are runtime states
      partialize: (state) => ({
        profile: state.profile,
      }),
    },
  ),
)

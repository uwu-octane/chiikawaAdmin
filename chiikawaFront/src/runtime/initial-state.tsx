// import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import type { Settings as LayoutSettings } from '@ant-design/pro-components'
// import { getUserInfo } from '@/services/chiikawa-pro/user'
// import defaultSettings from '@/config/defaultSettings' // 没有的话等下我们补

// // 按你的后端类型来，如果有 API.UserInfoResp 就用那个
// export type CurrentUser = any // TODO: 换成 API.UserInfoResp

// type InitialState = {
//   settings?: Partial<LayoutSettings>
//   currentUser?: CurrentUser
//   loading: boolean
//   fetchUserInfo: () => Promise<CurrentUser | undefined>
// }

// const InitialStateContext = createContext<InitialState | null>(null)

// const loginPath = '/user/login'
// const publicPaths = [loginPath, '/user/register', '/user/register-result']

// export const InitialStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>()
//   const [settings, setSettings] = useState<Partial<LayoutSettings>>(defaultSettings || {})
//   const [loading, setLoading] = useState(true)

//   const location = useLocation()
//   const navigate = useNavigate()

//   const fetchUserInfo = useCallback(async () => {
//     try {
//       const userInfo = await getUserInfo({
//         skipErrorHandler: true,
//       })
//       const payload = (userInfo as any)?.data ?? userInfo
//       setCurrentUser(payload)
//       return payload
//     } catch (e) {
//       // 请求失败，不直接跳转，交给下面的守卫逻辑决定
//       setCurrentUser(undefined)
//       return undefined
//     }
//   }, [])

//   // 初始化：非公开路由时拉取用户信息
//   useEffect(() => {
//     const init = async () => {
//       const pathname = location.pathname
//       // 登录/注册页不拉用户信息
//       if (publicPaths.includes(pathname)) {
//         setLoading(false)
//         return
//       }

//       const user = await fetchUserInfo()
//       if (!user) {
//         navigate(loginPath, { replace: true })
//       }
//       setLoading(false)
//     }

//     init()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []) // 只在首次挂载跑一次初始化

//   // 路由变化守卫：没登录又访问受保护页面 -> 跳登录
//   useEffect(() => {
//     if (loading) return
//     const pathname = location.pathname

//     if (!currentUser && !publicPaths.includes(pathname)) {
//       navigate(loginPath, { replace: true })
//     }
//   }, [location.pathname, loading, currentUser, navigate])

//   const value: InitialState = {
//     settings,
//     currentUser,
//     loading,
//     fetchUserInfo,
//   }

//   return <InitialStateContext.Provider value={value}>{children}</InitialStateContext.Provider>
// }

// export function useInitialState() {
//   const ctx = useContext(InitialStateContext)
//   if (!ctx) {
//     throw new Error('useInitialState must be used within InitialStateProvider')
//   }
//   return ctx
// }

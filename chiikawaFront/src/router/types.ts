import type { RouteObject } from 'react-router-dom'
import type { ReactNode } from 'react'

export interface ApiRoute {
  path: string
  component: string
  name: string
  icon?: string
  hideInMenu?: boolean
  children?: ApiRoute[]
}

export type AppRouteObject = RouteObject & {
  name?: string
  icon?: ReactNode
  hideInMenu?: boolean
  children?: AppRouteObject[]
}
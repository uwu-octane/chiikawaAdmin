import type { App } from 'antd'

/**
 * 从 App.useApp() 获取的类型
 */
type AppInstance = ReturnType<typeof App.useApp>

/**
 * 全局配置接口
 */
interface GlobalConfigIntl {
  message?: AppInstance['message']
  modal?: {
    readonly info: AppInstance['modal']['info']
    readonly success: AppInstance['modal']['success']
    readonly error: AppInstance['modal']['error']
    readonly warning: AppInstance['modal']['warning']
    readonly confirm: AppInstance['modal']['confirm']
  }
  notification?: AppInstance['notification']
}

/**
 * 全局配置对象
 */
const globalConfig: GlobalConfigIntl = {}

/**
 * 获取全局配置
 */
export function useGlobalConfig() {
  return globalConfig
}

/**
 * 设置全局配置
 */
export function useSetGlobalConfig(config: GlobalConfigIntl) {
  globalConfig.message = config.message
  globalConfig.modal = config.modal
  globalConfig.notification = config.notification
}

/**
 * 获取 message 实例
 */
export function useMessage() {
  if (!globalConfig.message) {
    throw new Error('Message is not initialized. Please call useSetGlobalConfig in App component.')
  }
  return globalConfig.message
}

/**
 * 获取 modal 实例
 */
export function useModal() {
  if (!globalConfig.modal) {
    throw new Error('Modal is not initialized. Please call useSetGlobalConfig in App component.')
  }
  return globalConfig.modal
}

/**
 * 获取 notification 实例
 */
export function useNotification() {
  if (!globalConfig.notification) {
    throw new Error('Notification is not initialized. Please call useSetGlobalConfig in App component.')
  }
  return globalConfig.notification
}


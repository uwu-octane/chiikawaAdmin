import type { ProLayoutProps } from '@ant-design/pro-components'

/**
 * @name Layout Settings
 */
const Settings: ProLayoutProps & {
  pwa?: boolean
  logo?: string
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Chiikawa Pro',
  pwa: true,
  // 使用公共目录下的静态资源路径，而不是本地文件系统绝对路径
  logo: '/icons/chiikawa.png',
  iconfontUrl: '',
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    // https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
  },
}

export default Settings

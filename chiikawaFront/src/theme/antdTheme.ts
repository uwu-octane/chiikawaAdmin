// src/theme/antdTheme.ts
import type { ThemeConfig } from 'antd'

export const antdAppTheme: ThemeConfig = {
  // 1) Token：替代 Less 变量
  token: {
    // @primary-color
    colorPrimary: '#1677ff',

    // @font-size-base
    fontSize: 14,

    // @border-radius-base
    borderRadius: 6,

    // @link-color（可选）
    colorLink: '#1677ff',

    // 字体配置 - AlibabaSans
    fontFamily:
      'AlibabaSans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',

    // @success-color / @warning-color / @error-color 等，也可按需覆盖
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
  },

  // 2) 组件级别细化（可覆盖 Pro 中对特定组件的定制）
  components: {
    Layout: {
      // @layout-header-height
      headerHeight: 56,
      // @layout-header-background
      headerBg: '#001529',
      // @layout-sider-background
      siderBg: '#001529',
    },
    Menu: {
      // @menu-item-height
      itemHeight: 40,
    },
    Card: {
      borderRadiusLG: 12,
      borderRadius: 12,
    },
    Button: {
      defaultColor: '#1890ff',
    },
  },

  // 3) 主题算法（暗色/紧凑；如果 Pro 有 dark/compact）
  // algorithm: [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm],
}

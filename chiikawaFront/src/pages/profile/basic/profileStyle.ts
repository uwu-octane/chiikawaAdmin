import { createStyles } from 'antd-style'

const useProfileStyles = createStyles(({ token }) => {
  return {
    // 整个设置页主容器（挂在 GridContent 里面）
    main: {
      display: 'flex',
      width: '100%',
      height: '100%',
      paddingTop: 16,
      paddingBottom: 16,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgContainer,

      // 只作用于 main 下的直接子 div 中的 List
      '.profile-settings-page & > div > .ant-list-split .ant-list-item:last-child': {
        borderBottom: `1px solid ${token.colorSplit}`,
      },
      '.profile-settings-page & > div > .ant-list-item': {
        paddingTop: 14,
        paddingBottom: 14,
      },

      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        flexDirection: 'column',
      },
    },

    // 左侧菜单容器
    leftMenu: {
      width: 224,
      borderRight: `${token.lineWidth}px solid ${token.colorSplit}`,

      // 只影响 leftMenu 下面的 Menu，不影响 ProLayout 的 Sider
      '.profile-settings-page .ant-menu-inline': {
        border: 'none',
      },
      '.profile-settings-page .ant-menu-horizontal': {
        fontWeight: 'bold',
      },

      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        width: '100%',
        border: 'none',
      },
    },

    // 右侧内容容器
    right: {
      flex: 1,
      padding: '8px 40px',

      [`@media screen and (max-width: ${token.screenMD}px)`]: {
        padding: 40,
      },
    },

    // 标题
    title: {
      marginBottom: 12,
      color: token.colorTextHeading,
      fontWeight: 500,
      fontSize: 20,
      lineHeight: '28px',
    },

    taobao: {
      display: 'block',
      color: '#ff4000',
      fontSize: 48,
      lineHeight: '48px',
      borderRadius: token.borderRadius,
    },

    dingding: {
      margin: 2,
      padding: 6,
      color: '#fff',
      fontSize: 32,
      lineHeight: '32px',
      backgroundColor: '#2eabff',
      borderRadius: token.borderRadius,
    },

    alipay: {
      color: '#2eabff',
      fontSize: 48,
      lineHeight: '48px',
      borderRadius: token.borderRadius,
    },

    // 全局 font.* 只在 profile-settings-page 里生效
    ':global': {
      '.profile-settings-page font.strong': { color: token.colorSuccess },
      '.profile-settings-page font.medium': { color: token.colorWarning },
      '.profile-settings-page font.weak': { color: token.colorError },
    },
  }
})

export default useProfileStyles

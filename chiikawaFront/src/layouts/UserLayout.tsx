import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'

const { Content } = Layout

const UserLayout: React.FC = () => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: 360,
            padding: 32,
            borderRadius: 16,
            background: '#ffffff',
            boxShadow: '0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12)',
          }}
        >
          {/* 登录、注册等页面会通过 Outlet 渲染到这里 */}
          <Outlet />
        </div>
      </Content>
    </Layout>
  )
}

export default UserLayout

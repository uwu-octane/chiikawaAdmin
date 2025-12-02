import { ping } from '@/api/generated/auth/auth'
import type { LoginReq } from '@/api/generated/schemas'
import PublicRoute from '@/components/auth/PublicRoute'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons'
import { LoginForm, ProFormCaptcha, ProFormCheckbox, ProFormText } from '@ant-design/pro-components'
import { Alert, Tabs } from 'antd'
import { createStyles } from 'antd-style'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import React, { useState } from 'react'
import { useMessage } from '@/hooks/useGlobalConfig'

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      width: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  }
})

const LoginMessage: React.FC<{
  content: string
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  )
}

const ActionIcons = () => {
  const { styles } = useStyles()
  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.action} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.action} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.action} />
    </>
  )
}

const Login: React.FC = () => {
  const [type, setType] = useState<string>('account')
  const [submitting, setSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<string>('')
  const { styles } = useStyles()
  const message = useMessage()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // 从 useAuth 获取登录方法
  const { login: loginAction, clearError } = useAuth()

  // 获取跳转目标：优先使用 state.from，其次使用 redirect 参数，最后使用默认路径
  type LocationState = {
    from?: Location
  }
  const from =
    (location.state as LocationState)?.from?.pathname ||
    searchParams.get('redirect') ||
    '/dashboard/analysis'

  const handleSubmit = async (values: LoginReq) => {
    setSubmitting(true)
    setLoginError('')
    clearError() // 清空之前的错误

    try {
      // 使用 useAuth 的 login 方法
      // 登录成功后，auth store 会自动获取用户信息（用于填充 avatar dropdown 等）
      await loginAction({
        username: values.username,
        password: values.password,
      })

      // 登录成功提示
      message.success('登录成功！')

      // 跳转到目标页面（优先跳回原页）
      navigate(from, { replace: true })
    } catch (error) {
      console.error('[LoginPage] login error', error)
      const errorMessage = error instanceof Error ? error.message : '登录失败，请检查账号或密码'
      setLoginError(errorMessage)
      message.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/icons/chiikawa.png" />}
          title="Chiikawa Pro"
          subTitle="欢迎登录"
          initialValues={{
            autoLogin: true,
          }}
          actions={['其他登录方式', <ActionIcons key="icons" />]}
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: '登录',
            },
            submitButtonProps: {
              loading: submitting,
            },
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
              {
                key: 'mobile',
                label: '手机号登录',
              },
            ]}
          />
          {loginError && type === 'account' && <LoginMessage content={loginError} />}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder="用户名: admin or user"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder="密码"
                rules={[
                  {
                    required: true,
                    message: '请输入密码！',
                  },
                ]}
              />
            </>
          )}
          {loginError && type === 'mobile' && <LoginMessage content="验证码错误" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder="手机号"
                rules={[
                  {
                    required: true,
                    message: '请输入手机号！',
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: '手机号格式错误！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder="请输入验证码"
                captchaTextRender={(timing: boolean, count: number) => {
                  if (timing) {
                    return `${count} 秒后重新获取验证码`
                  }
                  return '获取验证码'
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                ]}
                onGetCaptcha={async () => {
                  try {
                    await ping()
                    message.success('获取验证码成功！验证码为：1234')
                  } catch {
                    message.error('获取验证码失败')
                  }
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <PublicRoute>
      <Login />
    </PublicRoute>
  )
}

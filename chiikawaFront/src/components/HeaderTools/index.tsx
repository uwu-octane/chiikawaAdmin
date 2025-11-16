import React, { useMemo, useState } from 'react'
import { GlobalOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Dropdown, Space, Typography } from 'antd'

type LanguageKey = 'zh-CN' | 'en-US' | 'ja-JP'

const languageMeta: Record<
  LanguageKey,
  {
    label: string
    description: string
  }
> = {
  'zh-CN': {
    label: '简体中文',
    description: 'Simplified Chinese',
  },
  'en-US': {
    label: 'English',
    description: 'English (US)',
  },
  'ja-JP': {
    label: '日本語',
    description: 'Japanese',
  },
}

export const SelectLang: React.FC = () => {
  const [current, setCurrent] = useState<LanguageKey>('zh-CN')

  const items = useMemo<MenuProps['items']>(
    () =>
      (Object.keys(languageMeta) as LanguageKey[]).map((key) => ({
        key,
        label: (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{languageMeta[key].label}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {languageMeta[key].description}
            </Typography.Text>
          </Space>
        ),
      })),
    [],
  )

  const label = useMemo(() => languageMeta[current]?.label ?? current, [current])

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items,
        onClick: ({ key }) => {
          setCurrent(key as LanguageKey)
        },
        selectedKeys: [current],
      }}
    >
      <Space
        size={4}
        style={{
          cursor: 'pointer',
          height: 48,
          padding: '0 8px',
          fontSize: 14,
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <GlobalOutlined />
        <Typography.Text style={{ margin: 0 }}>{label}</Typography.Text>
      </Space>
    </Dropdown>
  )
}

export const Question: React.FC = () => {
  return (
    <a
      href="https://pro.ant.design/docs/getting-started"
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        padding: '4px',
        fontSize: '18px',
        color: 'inherit',
      }}
    >
      <QuestionCircleOutlined />
    </a>
  )
}

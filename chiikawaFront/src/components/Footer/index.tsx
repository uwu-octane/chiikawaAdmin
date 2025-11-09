import { GithubOutlined } from '@ant-design/icons'
import { DefaultFooter } from '@ant-design/pro-components'
import React from 'react'

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by Tao"
      links={[
        {
          key: 'Chiikawa Pro',
          title: 'Chiikawa Pro',
          href: 'https://github.com/uwu-octane',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/uwu-octane',
          blankTarget: true,
        },
        {
          key: 'chikkawa',
          title: 'chikkawa',
          href: 'https://www.chiikawaofficial.com',
          blankTarget: true,
        },
      ]}
    />
  )
}

export default Footer

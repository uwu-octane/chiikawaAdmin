import useProfileComponentStyles from './profileComponentStyle'
import { useUser } from '@/hooks/useUser'
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDependency,
  ProFormFieldSet,
} from '@ant-design/pro-components'
import { Upload, Button, message, Input } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { queryProvince, queryCity } from '@/api/generated/geographic/geographic'

const validatorPhone = (_rule: unknown, value: string[], callback: (message?: string) => void) => {
  if (!value[0]) {
    callback('Please input your area code!')
  }
  if (!value[1]) {
    callback('Please input your phone number!')
  }
  callback()
}

const BaseView: React.FC = () => {
  const { styles } = useProfileComponentStyles()
  const AvatarView = ({ avatar }: { avatar: string | null }) => (
    <>
      <div className={styles.avatar_title}>头像</div>
      <div className={styles.avatar}>{avatar && <img src={avatar} alt="avatar" />}</div>
      <Upload showUploadList={false}>
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            更换头像
          </Button>
        </div>
      </Upload>
    </>
  )
  const { profile, isLoading } = useUser()
  const getAvatar = () => {
    if (profile) {
      if (profile.avatar_url) {
        return profile.avatar_url
      }
      const url =
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pinterest.com%2Fchickenmcchickenz%2Fchiikawa%2F&psig=AOvVaw3MME4Y-bfSSWDgfvit4a4O&ust=1763416571462000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCOj98ejU95ADFQAAAAAdAAAAABAE'
      return url
    }
    return null
  }

  const handleFinish = async () => {
    message.success('更新基本信息成功')
  }

  return (
    <div className={styles.profile_basic}>
      {isLoading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: '保存',
                },
                submitButtonProps: {
                  style: {
                    backgroundColor: '#1890ff',
                  },
                },
                render: (_, dom) => dom[1],
              }}
              initialValues={{
                ...profile,
              }}
            >
              <ProFormText
                width="md"
                name="email"
                label="邮箱"
                rules={[
                  {
                    required: true,
                    type: 'email',
                    message: '请输入正确的邮箱',
                  },
                ]}
              />
              <ProFormText
                width="md"
                name="display_name"
                label="显示名称"
                rules={[
                  {
                    required: true,
                    message: '请输入显示名称',
                  },
                ]}
              />
              <ProFormText
                width="md"
                name="username"
                label="用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名',
                  },
                ]}
              />
              <ProFormTextArea
                width="md"
                name="bio"
                label="个人简介"
                rules={[
                  {
                    required: true,
                    message: '请输入个人简介',
                  },
                ]}
                placeholder="个人简介"
              />
              <ProFormSelect
                width="sm"
                name="country"
                label="国家/地区"
                rules={[
                  {
                    required: true,
                    message: '请输入您的国家或地区!',
                  },
                ]}
                options={[
                  {
                    label: '中国',
                    value: 'China',
                  },
                ]}
              />

              <ProForm.Group title="所在省市" size={8}>
                <ProFormSelect
                  rules={[
                    {
                      required: true,
                      message: '请输入您的所在省!',
                    },
                  ]}
                  width="sm"
                  label="省份"
                  name="province"
                  fieldProps={{
                    labelInValue: true,
                  }}
                  request={async () => {
                    return queryProvince().then(
                      ({ data }: { data: Array<{ name: string; id: string }> }) => {
                        return data.map((item: { name: string; id: string }) => {
                          return {
                            label: item.name,
                            value: item.id,
                          }
                        })
                      },
                    )
                  }}
                />
                <ProFormDependency name={['province']}>
                  {({ province }) => {
                    return (
                      <ProFormSelect
                        width="sm"
                        name="city"
                        label="城市"
                        rules={[
                          {
                            required: true,
                            message: '请输入您的所在城市!',
                          },
                        ]}
                        disabled={!province}
                        request={async () => {
                          if (!province?.value) {
                            return []
                          }
                          return queryCity(province.value).then(
                            ({ data }: { data: Array<{ name: string; id: string }> }) => {
                              return data.map((item: { name: string; id: string }) => {
                                return {
                                  label: item.name,
                                  value: item.id,
                                }
                              })
                            },
                          )
                        }}
                      />
                    )
                  }}
                </ProFormDependency>
              </ProForm.Group>
              <ProFormFieldSet
                name="phone"
                label="联系电话"
                rules={[
                  {
                    required: false,
                    message: '请输入您的联系电话!',
                  },
                  {
                    validator: validatorPhone,
                  },
                ]}
              >
                <Input className={styles.area_code} />
                <Input className={styles.phone_number} />
              </ProFormFieldSet>
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatar={getAvatar()} />
          </div>
        </>
      )}
    </div>
  )
}

export default BaseView

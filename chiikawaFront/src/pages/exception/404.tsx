import { useNavigate } from 'react-router-dom'
import { Button, Card, Result } from 'antd'
import { useCallback } from 'react'

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  const handleBackHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <Card variant="borderless">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={handleBackHome}>
            Back Home
          </Button>
        }
      />
    </Card>
  )
}

export default NotFoundPage

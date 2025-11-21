import { Card } from 'antd'
//import { ChatButton } from '@/components/chatbox/chatbutton'
//import ChatInput from '@/components/chatbox/chatinput'
import { ActionDock } from '@/components/chatbox/actiondocker'
import { testActions } from '@/components/chatbox/testactions'
import { ChatPopoverLauncher } from '@/components/chatbox/chatbox'

const ChatDemo: React.FC = () => {
  return (
    <Card className="h-[800px] w-full flex flex-col justify-between items-center p-6 relative">
      <div className="flex-1 flex items-center justify-center">{/* <ChatButton /> */}</div>
      {/* <ChatInput /> */}
      <div className="w-full max-w-3xl">
        <ActionDock actions={testActions} />
      </div>
      <ChatPopoverLauncher />
    </Card>
  )
}

export default ChatDemo

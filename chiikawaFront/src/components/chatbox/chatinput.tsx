import { useState } from 'react'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from '@/components/motion-primitives/prompt-input'
import { Magnetic } from '@/components/motion-primitives/magnetic'
import { Button } from '@/components/motion-primitives/customButton'
import { Square, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const ChatInput: React.FC = () => {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onInputChange = (value: string) => {
    setInput(value)
  }

  const onSubmit = () => {
    setIsLoading(true)
  }
  return (
    <div className="w-full mx-auto">
      <PromptInput
        value={input}
        onValueChange={onInputChange}
        isLoading={isLoading}
        onSubmit={onSubmit}
        maxHeight={200}
        className="w-full mx-auto overflow-hidden relative rounded-2xl p-0 pr-3"
      >
        <PromptInputTextarea
          placeholder="Ask me anything..."
          className={cn(
            'relative z-10 min-h-[20px] max-h-[200px] overflow-y-auto pr-4',
            'leading-6 placeholder:text-zinc-400 text-xs',
            'scrollbar-hide',
          )}
        />
        <PromptInputActions className="absolute bottom-1 right-2 p-0 m-0">
          <PromptInputAction tooltip={isLoading ? 'Stop generation' : 'Send message'}>
            <Magnetic intensity={0.4} range={150}>
              <Button
                variant="default"
                size="icon"
                className="h-5 w-5 rounded-full bg-black text-white"
                onClick={onSubmit}
              >
                {isLoading ? (
                  <Square className="size-3 fill-current" />
                ) : (
                  <ArrowUp className="size-3" />
                )}
              </Button>
            </Magnetic>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  )
}

export default ChatInput

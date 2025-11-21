import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // 确保扫描所有相关文件
  content: {
    filesystem: ['./src/**/*.{js,jsx,ts,tsx}'],
  },
  presets: [
    presetUno(), // 使用 presetUno，完全兼容 Tailwind CSS
    presetAttributify(),
    presetIcons(),
  ],
  transformers: [
    transformerDirectives(), // 支持 @apply, @screen 等指令
    transformerVariantGroup(), // 支持 variant group 语法，如 hover:(bg-gray-400 font-medium)
  ],
  theme: {
    colors: {
      // 定义 CSS 变量作为颜色，适配 shadcn/ui 和 motion primitives
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      // 添加更多颜色支持
      zinc: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
        950: '#09090b',
      },
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
  shortcuts: {
    // 自定义快捷方式
  },
  safelist: [
    // 确保某些动态类名不会被清除
    'shadow-xs',
    'size-3',
    'size-5',
  ],
  rules: [
    // 添加自定义规则支持 shadow-xs
    [
      'shadow-xs',
      {
        'box-shadow': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    ],
    // 支持 data-* 属性选择器的动画
    [
      /^data-\[(.+)\]:(.+)$/,
      ([, attr, value]) => ({
        [`&[data-${attr}]`]: value,
      }),
    ],
  ],
})

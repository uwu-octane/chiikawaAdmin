# Chiikawa Admin - Frontend

基于 React + TypeScript + Vite 构建的现代化管理后台前端应用。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite (rolldown-vite)
- **UI 组件库**: Ant Design 5.x + Ant Design Pro Components
- **路由**: React Router v6
- **状态管理**: Zustand
- **数据请求**: TanStack Query (React Query) + ky
- **样式方案**: TailwindCSS + Ant Design Style + CSS-in-JS
- **动画**: Motion (Framer Motion)
- **AI 集成**: Vercel AI SDK
- **API 生成**: Orval (基于 OpenAPI)

## 项目结构

```plaintext
src/
├── api/                    # API 相关
│   └── generated/          # Orval 自动生成的 API 代码
│       ├── auth/           # 认证接口
│       ├── user/           # 用户接口
│       └── schemas/        # 数据结构定义
├── components/             # 通用组件
│   ├── auth/               # 认证组件 (RequireAuth, PublicRoute)
│   ├── chatbox/            # 聊天组件
│   ├── ai-elements/        # AI 对话元素
│   ├── motion-primitives/  # 动画基础组件
│   ├── ui/                 # 通用 UI 组件
│   ├── HeaderTools/        # 头部工具栏
│   ├── AvatarDropdown/     # 用户头像下拉菜单
│   └── Footer/             # 页脚
├── pages/                  # 页面组件
│   ├── dashboard/          # 仪表盘
│   │   └── analysis/       # 数据分析页
│   ├── profile/            # 个人信息
│   │   └── basic/          # 基础信息
│   ├── Agent/              # AI Agent
│   │   └── chatdemo/       # 聊天演示
│   ├── user/               # 用户相关
│   │   └── login/          # 登录页
│   └── exception/          # 异常页面
│       └── 404.tsx         # 404 页面
├── layouts/                # 布局组件
│   ├── ProtectedLayout.tsx # 需要认证的布局
│   ├── BasicLayout.tsx     # 基础布局
│   └── BlankLayout.tsx     # 空白布局
├── router/                 # 路由配置
│   ├── index.tsx           # 路由入口
│   ├── routes.tsx          # 路由定义
│   └── types.ts            # 路由类型
├── stores/                 # Zustand 状态管理
│   ├── auth.ts             # 认证状态
│   ├── user.ts             # 用户状态
│   └── chat.ts             # 聊天状态
├── contexts/               # React Context
│   └── chatContext.tsx     # 聊天上下文管理
├── hooks/                  # 自定义 Hooks
│   ├── useAuth.ts          # 认证 Hook
│   ├── useUser.ts          # 用户信息 Hook
│   ├── useChatSession.ts   # 聊天会话 Hook
│   └── useGeographic.ts    # 地理信息 Hook
├── lib/                    # 工具库
│   ├── request/            # HTTP 请求封装
│   └── utils.ts            # 通用工具函数
├── theme/                  # 主题配置
│   └── antdTheme.ts        # Ant Design 主题定制
├── config/                 # 配置文件
│   └── defaultSettings.ts  # 默认设置
└── runtime/                # 运行时配置
    └── initial-state.tsx   # 初始状态
```

## 核心功能

### 1. 认证与授权

- 基于 Token 的用户认证
- 路由级别的权限控制
- 自动 Token 刷新机制

### 2. 布局系统

- **ProtectedLayout**: 带侧边栏和顶部导航的主布局，需要认证
- **BlankLayout**: 空白布局，用于登录页等公开页面
- **BasicLayout**: 基础布局模板

### 3. AI 聊天功能

- 集成 Vercel AI SDK
- 支持多会话管理
- 实时流式对话
- 消息持久化存储
- 支持自定义 Action 操作

### 4. 用户管理

- 用户信息展示与编辑
- 个人设置管理
- 头像上传
- 通知设置

### 5. 仪表盘

- 数据可视化展示
- 实时数据更新

## 开发指南

### 安装依赖

```bash
bun install
```

### 启动开发服务器

```bash
bun run dev
```

### 生成 API 代码

基于后端的 OpenAPI 规范自动生成 TypeScript API 客户端代码：

```bash
bun run api:gen
```

### 构建生产版本

```bash
bun run build
```

### 代码规范

```bash
# 检查代码规范
bun run lint

# 自动修复代码问题
bun run lint:fix

# 格式化代码
bun run format
```

## 路由说明

- `/user/login` - 登录页
- `/dashboard/analysis` - 数据分析仪表盘（默认首页）
- `/profile/basic` - 个人基础信息
- `/agent/chat` - AI 聊天对话
- `/*` - 404 页面

所有路由（除登录页外）都需要认证才能访问。

## 环境要求

- Node.js >= 18
- Bun (推荐) 或 npm/yarn

## 配置文件

- `vite.config.ts` - Vite 构建配置
- `tsconfig.json` - TypeScript 配置
- `tailwind.config.js` - TailwindCSS 配置
- `orval.config.ts` - API 代码生成配置
- `eslint.config.js` - ESLint 配置

## API 集成

项目使用 Orval 根据后端提供的 `openapi.json` 自动生成类型安全的 API 客户端代码。生成的代码位于 `src/api/generated/` 目录。

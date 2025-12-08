# 存储架构方案

## 1. 架构概览

### 1.1 后端架构（服务端）

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application)                      │
│              (chat-controller, routes, etc.)                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Repository 层 (统一接口层)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │SessionRepo   │  │MessageRepo   │  │MemoRepo      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Store 层 (缓存 + 持久化协调层)                      │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Cache-Aside Store (统一实现)                     │       │
│  │  - SessionCacheAsideStore                        │       │
│  │  - MessageCacheAsideStore                        │       │
│  │  - MemoCacheAsideStore                           │       │
│  │  职责：缓存读写 + 缓存失效时回写数据库               │       │
│  └──────────────────────────────────────────────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐                 ┌───────────────────┐
│   Cache 层        │                 │  Persistence 层   │
│ (Redis Store)     │                 │  (DB Store)       │
│                   │                 │                   │
│ - SessionCache    │                 │ - SessionStore    │
│ - MessageCache    │                 │ - MessageStore    │
│ - MemoCache       │                 │ - MemoStore       │
└───────────────────┘                 └───────────────────┘
        │                                       │
        ▼                                       ▼
┌───────────────────┐                 ┌───────────────────┐
│     Redis         │                 │   PostgreSQL      │
│   (临时存储)       │                 │   (永久存储)       │
└───────────────────┘                 └───────────────────┘
```

### 1.2 前端架构（客户端）

```
┌─────────────────────────────────────────────────────────────┐
│                    组件层 (Components)                        │
│              (Chat, Auth, UserProfile, etc.)                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Zustand Stores (状态管理)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │AuthStore     │  │ChatStore     │  │UserStore     │      │
│  │- 认证状态     │  │- 会话列表     │  │- 用户信息     │      │
│  │- Token管理   │  │- 当前会话     │  │- 用户资料     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API 层 (HTTP Client)                             │
│              (generated API clients)                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              后端服务 (Backend API)                           │
└─────────────────────────────────────────────────────────────┘
```

## 2. 目录结构

### 2.1 后端目录结构（新建架构）

```
chiikawaBackend/src/
├── store/                          # 统一存储层（新建架构）
│   ├── schema/                     # 数据模型定义（Zod Schema）
│   │   └── conversation/
│   │       ├── session.ts
│   │       ├── message.ts
│   │       └── memo.ts
│   │
│   ├── repository/                 # Repository 层（统一接口）
│   │   └── conversation/
│   │       ├── session-repo.ts     # SessionRepository
│   │       ├── message-repo.ts     # MessageRepository
│   │       ├── memo-repo.ts        # MemoRepository
│   │       └── index.ts            # 导出所有 Repository
│   │
│   ├── store/                      # Store 层（缓存 + 持久化协调）
│   │   └── conversation/
│   │       ├── session-store.ts    # SessionCacheAsideStore
│   │       ├── message-store.ts    # MessageCacheAsideStore
│   │       ├── memo-store.ts       # MemoCacheAsideStore
│   │       └── base-store.ts       # 基础抽象类/工具
│   │
│   ├── cache/                      # Cache 层（Redis 实现）
│   │   └── conversation/
│   │       ├── session-cache.ts
│   │       ├── message-cache.ts
│   │       ├── memo-cache.ts
│   │       └── base-cache.ts       # Redis 客户端封装
│   │
│   └── persistence/                # Persistence 层（DB 实现）
│       └── conversation/
│           ├── session-persistence.ts
│           ├── message-persistence.ts
│           ├── memo-persistence.ts
│           └── base-persistence.ts # Prisma 客户端封装
│
├── ai/
│   └── conversation/
│       └── store/                   # 现有实现（待迁移）
│           ├── schema/             # 数据模型（将迁移到 src/store/schema/）
│           ├── cache/              # Redis 缓存（将迁移到 src/store/cache/）
│           └── repo/               # Repository（将迁移到 src/store/repository/）
│
└── db/
    ├── store/                       # 现有数据库实现（待迁移）
    │   └── message-db-store.ts     # 将迁移到 src/store/persistence/conversation/
    ├── prisma.ts                    # Prisma 客户端
    └── generated/                  # Prisma 生成的类型
```

### 2.2 前端目录结构

```
chiikawaFront/src/
└── stores/                          # Zustand 状态管理
    ├── auth.ts                     # 认证状态管理
    │   - 登录/登出
    │   - Token 管理
    │   - 认证状态
    │
    ├── chat.ts                      # 聊天会话状态管理
    │   - 会话列表
    │   - 当前会话
    │   - 会话元数据
    │
    └── user.ts                      # 用户信息状态管理
        - 用户资料
        - 用户信息
```

### 2.3 目录组织原则

1. **按业务域划分**：使用 `conversation/` 子目录，便于扩展其他业务域（如 `user/`、`order/`）
2. **前后端分离**：前端使用 Zustand 管理 UI 状态，后端负责数据持久化
3. **统一存储层**：后端使用 `src/store/` 作为统一的存储架构入口

## 3. 核心设计原则

### 3.1 单一职责原则

- **Repository**: 仅提供业务接口，不关心底层实现
- **Store**: 协调缓存和持久化，实现 Cache-Aside 模式
- **Cache**: 仅负责 Redis 读写操作
- **Persistence**: 仅负责数据库读写操作

### 3.2 Cache-Aside 模式

```
读流程：
1. 先读缓存
2. 缓存命中 → 直接返回
3. 缓存未命中 → 读数据库 → 写入缓存 → 返回

写流程：
1. 写数据库
2. 更新/删除缓存
```

### 3.3 接口驱动

每层都定义清晰的接口（TypeScript Interface），方便测试和替换实现。

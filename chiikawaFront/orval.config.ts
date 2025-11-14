const config = {
  api: {
    input: {
      target: 'http://localhost:28256/schema/openapi.json',
      parserOptions: {
        validate: false,
        skipValidation: true,
      },
      validation: false,
      override: {
        useTypeOverInterfaces: true,
      },
      // 注意：lint: false 无法解决 Node.js v22/v23 兼容性问题
      // 请使用 Node.js 20 运行 api:gen 命令
      // lint: false,
    },
    output: {
      target: 'src/api/generated/index.ts',
      client: 'fetch',
      override: {
        mutator: {
          path: './src/lib/request/client.ts',
          name: 'orvalKy',
        },
      },
      schemas: 'src/api/generated/schemas',
      mode: 'tags-split',
      hooks: {
        enabled: true,
        // 若你不想要 hooks，改为 false
      },
    },
  },
}

export default config

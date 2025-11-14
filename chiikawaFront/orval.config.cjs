/** @type import('orval').OrvalConfig */
const config = {
  api: {
    input: {
      target: 'http://localhost:28256/schema/openapi.json',
      parserOptions: {
        validate: false,
        skipValidation: true,
        lint: false,
      },
      override: {
        useTypeOverInterfaces: true,
      },
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
      },
    },
  },
}

module.exports = config

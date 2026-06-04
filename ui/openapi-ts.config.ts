import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../api/openapi/openapi.yaml',
  output: {
    clean: true,
    path: 'src/shared/services/api/generated/clear-api',
    tsConfigPath: './tsconfig.app.json',
  },
  plugins: [
    {
      baseUrl: true,
      name: '@hey-api/client-axios',
      runtimeConfigPath: './src/shared/services/api/runtime-config.ts',
      throwOnError: true,
    },
    {
      name: '@hey-api/typescript',
    },
    {
      definitions: true,
      name: 'zod',
      requests: false,
      responses: true,
    },
    {
      client: '@hey-api/client-axios',
      name: '@hey-api/sdk',
      operations: {
        strategy: 'flat',
      },
      paramsStructure: 'grouped',
      validator: {
        request: false,
        response: 'zod',
      },
    },
  ],
})

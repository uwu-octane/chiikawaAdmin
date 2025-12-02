import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginImp from 'vite-plugin-imp'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      vitePluginImp({
        libList: [
          {
            libName: 'antd',
            style: (name) => `antd/es/${name}/style/index.js`,
          },
        ],
      }),
    ],
    resolve: {
      alias: [{ find: '@/', replacement: path.resolve(__dirname, 'src') + '/' }],
    },
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          // 可在这里自定义 Ant Design 主题变量（等价于 antdAppTheme）
          modifyVars: {
            'primary-color': '#1677ff',
            'border-radius-base': '6px',
          },
        },
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        // 举例：后端接口转发到你的网关
        '/api': {
          target: 'http://localhost:28256',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
        '/chiikawa': {
          target: 'http://localhost:28256',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/chiikawa/, '/chiikawa'),
        },
      },
    },
  }
})

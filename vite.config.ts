import { ConfigEnv, UserConfig, defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import viteCompression from 'vite-plugin-compression'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import { wrapperEnv } from './src/utils/getEnv'

export default defineConfig((mode: ConfigEnv): UserConfig => {
  const env = loadEnv(mode.mode, process.cwd())
  const viteEnv = wrapperEnv(env)
  // server config
  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "@/styles/var.less";`
          },
          javascriptEnabled: true
        }
      }
    },
    server: {
      host: '0.0.0.0', // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
      port: viteEnv.VITE_PORT,
      open: viteEnv.VITE_OPEN,
      cors: true,
      // https: false,
      // 代理跨域
      proxy: {
        '/ats': {
          target: 'http://localhost:8086',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/ats/, '')
        }
      }
    },
    plugins: [
      vue(),
      // * vite 可以使用 jsx/tsx 语法
      vueJsx(),
      // * name 可以写在 script 标签上
      VueSetupExtend(),
      AutoImport({
        imports: ['vue', 'vue-router', 'vue-i18n', '@vueuse/core'],
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      // * 是否生成包预览
      viteEnv.VITE_REPORT && visualizer(),
      // * gzip compress
      viteEnv.VITE_BUILD_GZIP &&
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'gzip',
          ext: '.gz'
        })
    ],
    esbuild: {
      pure: viteEnv.VITE_DROP_CONSOLE ? ['console.log', 'debugger'] : []
    },
    // build configure
    build: {
      outDir: 'dist',
      // esbuild 打包更快，但是不能去除 console.log
      minify: 'esbuild',
      // minify: "terser",
      // terserOptions: {
      // 	compress: {
      // 		drop_console: viteEnv.VITE_DROP_CONSOLE,
      // 		drop_debugger: true
      // 	}
      // },
      rollupOptions: {
        output: {
          // Static resource classification and packaging
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
})

// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Work/Espressif/Code/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Work/Espressif/Code/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///C:/Work/Espressif/Code/frontend/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/Work/Espressif/Code/frontend/node_modules/unplugin-vue-components/dist/vite.mjs";
import viteCompression from "file:///C:/Work/Espressif/Code/frontend/node_modules/vite-plugin-compression/dist/index.mjs";
import VueSetupExtend from "file:///C:/Work/Espressif/Code/frontend/node_modules/vite-plugin-vue-setup-extend/dist/index.mjs";
import vueJsx from "file:///C:/Work/Espressif/Code/frontend/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { visualizer } from "file:///C:/Work/Espressif/Code/frontend/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { ElementPlusResolver } from "file:///C:/Work/Espressif/Code/frontend/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import { resolve } from "path";

// src/utils/getEnv.ts
import dotenv from "file:///C:/Work/Espressif/Code/frontend/node_modules/dotenv/lib/main.js";
function wrapperEnv(envConf) {
  const ret = {};
  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");
    realName = realName === "true" ? true : realName === "false" ? false : realName;
    if (envName === "VITE_PORT") {
      realName = Number(realName);
    }
    if (envName === "VITE_PROXY") {
      try {
        realName = JSON.parse(realName);
      } catch (error) {
        console.log(error);
      }
    }
    ret[envName] = realName;
    process.env[envName] = realName;
  }
  return ret;
}

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Work\\Espressif\\Code\\frontend";
var vite_config_default = defineConfig((mode) => {
  const env = loadEnv(mode.mode, process.cwd());
  const viteEnv = wrapperEnv(env);
  return {
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "./src"),
        "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js"
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
      host: "0.0.0.0",
      // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
      port: viteEnv.VITE_PORT,
      open: viteEnv.VITE_OPEN,
      cors: true,
      // https: false,
      // 代理跨域
      proxy: {
        "/api": {
          target: "http://localhost:8086",
          changeOrigin: true
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
        imports: ["vue", "vue-router", "vue-i18n", "@vueuse/core"],
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      // * 是否生成包预览
      viteEnv.VITE_REPORT && visualizer(),
      // * gzip compress
      viteEnv.VITE_BUILD_GZIP && viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: "gzip",
        ext: ".gz"
      })
    ],
    esbuild: {
      pure: viteEnv.VITE_DROP_CONSOLE ? ["console.log", "debugger"] : []
    },
    // build configure
    build: {
      outDir: "dist",
      // esbuild 打包更快，但是不能去除 console.log
      minify: "esbuild",
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
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3V0aWxzL2dldEVudi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFdvcmtcXFxcRXNwcmVzc2lmXFxcXENvZGVcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFdvcmtcXFxcRXNwcmVzc2lmXFxcXENvZGVcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1dvcmsvRXNwcmVzc2lmL0NvZGUvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBDb25maWdFbnYsIFVzZXJDb25maWcsIGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xuaW1wb3J0IHZpdGVDb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbidcbmltcG9ydCBWdWVTZXR1cEV4dGVuZCBmcm9tICd2aXRlLXBsdWdpbi12dWUtc2V0dXAtZXh0ZW5kJ1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcbmltcG9ydCB7IEVsZW1lbnRQbHVzUmVzb2x2ZXIgfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IHdyYXBwZXJFbnYgfSBmcm9tICcuL3NyYy91dGlscy9nZXRFbnYnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygobW9kZTogQ29uZmlnRW52KTogVXNlckNvbmZpZyA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZS5tb2RlLCBwcm9jZXNzLmN3ZCgpKVxuICBjb25zdCB2aXRlRW52ID0gd3JhcHBlckVudihlbnYpXG4gIC8vIHNlcnZlciBjb25maWdcbiAgcmV0dXJuIHtcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICAgJ3Z1ZS1pMThuJzogJ3Z1ZS1pMThuL2Rpc3QvdnVlLWkxOG4uY2pzLmpzJ1xuICAgICAgfVxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBtb2RpZnlWYXJzOiB7XG4gICAgICAgICAgICBoYWNrOiBgdHJ1ZTsgQGltcG9ydCAocmVmZXJlbmNlKSBcIkAvc3R5bGVzL3Zhci5sZXNzXCI7YFxuICAgICAgICAgIH0sXG4gICAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiAnMC4wLjAuMCcsIC8vIFx1NjcwRFx1NTJBMVx1NTY2OFx1NEUzQlx1NjczQVx1NTQwRFx1RkYwQ1x1NTk4Mlx1Njc5Q1x1NTE0MVx1OEJCOFx1NTkxNlx1OTBFOFx1OEJCRlx1OTVFRVx1RkYwQ1x1NTNFRlx1OEJCRVx1N0Y2RVx1NEUzQVwiMC4wLjAuMFwiXG4gICAgICBwb3J0OiB2aXRlRW52LlZJVEVfUE9SVCxcbiAgICAgIG9wZW46IHZpdGVFbnYuVklURV9PUEVOLFxuICAgICAgY29yczogdHJ1ZSxcbiAgICAgIC8vIGh0dHBzOiBmYWxzZSxcbiAgICAgIC8vIFx1NEVFM1x1NzQwNlx1OERFOFx1NTdERlxuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDg2JyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgdnVlKCksXG4gICAgICAvLyAqIHZpdGUgXHU1M0VGXHU0RUU1XHU0RjdGXHU3NTI4IGpzeC90c3ggXHU4QkVEXHU2Q0Q1XG4gICAgICB2dWVKc3goKSxcbiAgICAgIC8vICogbmFtZSBcdTUzRUZcdTRFRTVcdTUxOTlcdTU3Mjggc2NyaXB0IFx1NjgwN1x1N0I3RVx1NEUwQVxuICAgICAgVnVlU2V0dXBFeHRlbmQoKSxcbiAgICAgIEF1dG9JbXBvcnQoe1xuICAgICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3Z1ZS1pMThuJywgJ0B2dWV1c2UvY29yZSddLFxuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldXG4gICAgICB9KSxcbiAgICAgIENvbXBvbmVudHMoe1xuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldXG4gICAgICB9KSxcbiAgICAgIC8vICogXHU2NjJGXHU1NDI2XHU3NTFGXHU2MjEwXHU1MzA1XHU5ODg0XHU4OUM4XG4gICAgICB2aXRlRW52LlZJVEVfUkVQT1JUICYmIHZpc3VhbGl6ZXIoKSxcbiAgICAgIC8vICogZ3ppcCBjb21wcmVzc1xuICAgICAgdml0ZUVudi5WSVRFX0JVSUxEX0daSVAgJiZcbiAgICAgICAgdml0ZUNvbXByZXNzaW9uKHtcbiAgICAgICAgICB2ZXJib3NlOiB0cnVlLFxuICAgICAgICAgIGRpc2FibGU6IGZhbHNlLFxuICAgICAgICAgIHRocmVzaG9sZDogMTAyNDAsXG4gICAgICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXG4gICAgICAgICAgZXh0OiAnLmd6J1xuICAgICAgICB9KVxuICAgIF0sXG4gICAgZXNidWlsZDoge1xuICAgICAgcHVyZTogdml0ZUVudi5WSVRFX0RST1BfQ09OU09MRSA/IFsnY29uc29sZS5sb2cnLCAnZGVidWdnZXInXSA6IFtdXG4gICAgfSxcbiAgICAvLyBidWlsZCBjb25maWd1cmVcbiAgICBidWlsZDoge1xuICAgICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgICAvLyBlc2J1aWxkIFx1NjI1M1x1NTMwNVx1NjZGNFx1NUZFQlx1RkYwQ1x1NEY0Nlx1NjYyRlx1NEUwRFx1ODBGRFx1NTNCQlx1OTY2NCBjb25zb2xlLmxvZ1xuICAgICAgbWluaWZ5OiAnZXNidWlsZCcsXG4gICAgICAvLyBtaW5pZnk6IFwidGVyc2VyXCIsXG4gICAgICAvLyB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICAvLyBcdGNvbXByZXNzOiB7XG4gICAgICAvLyBcdFx0ZHJvcF9jb25zb2xlOiB2aXRlRW52LlZJVEVfRFJPUF9DT05TT0xFLFxuICAgICAgLy8gXHRcdGRyb3BfZGVidWdnZXI6IHRydWVcbiAgICAgIC8vIFx0fVxuICAgICAgLy8gfSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgLy8gU3RhdGljIHJlc291cmNlIGNsYXNzaWZpY2F0aW9uIGFuZCBwYWNrYWdpbmdcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bZXh0XS9bbmFtZV0tW2hhc2hdLltleHRdJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxXb3JrXFxcXEVzcHJlc3NpZlxcXFxDb2RlXFxcXGZyb250ZW5kXFxcXHNyY1xcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcV29ya1xcXFxFc3ByZXNzaWZcXFxcQ29kZVxcXFxmcm9udGVuZFxcXFxzcmNcXFxcdXRpbHNcXFxcZ2V0RW52LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Xb3JrL0VzcHJlc3NpZi9Db2RlL2Zyb250ZW5kL3NyYy91dGlscy9nZXRFbnYudHNcIjtpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldkZuKG1vZGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW9kZSA9PT0gJ2RldmVsb3BtZW50J1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcm9kRm4obW9kZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBtb2RlID09PSAncHJvZHVjdGlvbidcbn1cblxuLyoqXG4gKiBcdTY2MkZcdTU0MjZcdTc1MUZcdTYyMTBcdTUzMDVcdTk4ODRcdTg5QzhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVwb3J0TW9kZSgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHByb2Nlc3MuZW52LlZJVEVfUkVQT1JUID09PSAndHJ1ZSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBwZXJFbnYoZW52Q29uZjogUmVjb3JkYWJsZSk6IFZpdGVFbnYge1xuICBjb25zdCByZXQ6IGFueSA9IHt9XG5cbiAgZm9yIChjb25zdCBlbnZOYW1lIG9mIE9iamVjdC5rZXlzKGVudkNvbmYpKSB7XG4gICAgbGV0IHJlYWxOYW1lID0gZW52Q29uZltlbnZOYW1lXS5yZXBsYWNlKC9cXFxcbi9nLCAnXFxuJylcbiAgICByZWFsTmFtZSA9IHJlYWxOYW1lID09PSAndHJ1ZScgPyB0cnVlIDogcmVhbE5hbWUgPT09ICdmYWxzZScgPyBmYWxzZSA6IHJlYWxOYW1lXG5cbiAgICBpZiAoZW52TmFtZSA9PT0gJ1ZJVEVfUE9SVCcpIHtcbiAgICAgIHJlYWxOYW1lID0gTnVtYmVyKHJlYWxOYW1lKVxuICAgIH1cbiAgICBpZiAoZW52TmFtZSA9PT0gJ1ZJVEVfUFJPWFknKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZWFsTmFtZSA9IEpTT04ucGFyc2UocmVhbE5hbWUpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0W2Vudk5hbWVdID0gcmVhbE5hbWVcbiAgICBwcm9jZXNzLmVudltlbnZOYW1lXSA9IHJlYWxOYW1lXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NEVFNVx1NjMwN1x1NUI5QVx1NTI0RFx1N0YwMFx1NUYwMFx1NTkzNFx1NzY4NFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlxuICogQHBhcmFtIG1hdGNoIFx1NTI0RFx1N0YwMFxuICogQHBhcmFtIGNvbmZGaWxlcyBleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudkNvbmZpZyhtYXRjaCA9ICdWSVRFX0dMT0JfJywgY29uZkZpbGVzID0gWycuZW52JywgJy5lbnYucHJvZHVjdGlvbiddKSB7XG4gIGxldCBlbnZDb25maWcgPSB7fVxuICBjb25mRmlsZXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZW52ID0gZG90ZW52LnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgaXRlbSkpKVxuICAgICAgZW52Q29uZmlnID0geyAuLi5lbnZDb25maWcsIC4uLmVudiB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIHBhcnNpbmcgJHtpdGVtfWAsIGVycm9yKVxuICAgIH1cbiAgfSlcblxuICBPYmplY3Qua2V5cyhlbnZDb25maWcpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCByZWcgPSBuZXcgUmVnRXhwKGBeKCR7bWF0Y2h9KWApXG4gICAgaWYgKCFyZWcudGVzdChrZXkpKSB7XG4gICAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGVudkNvbmZpZywga2V5KVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGVudkNvbmZpZ1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NzUyOFx1NjIzN1x1NjgzOVx1NzZFRVx1NUY1NVxuICogQHBhcmFtIGRpciBcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJvb3RQYXRoKC4uLmRpcjogc3RyaW5nW10pIHtcbiAgcmV0dXJuIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAuLi5kaXIpXG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlSLFNBQWdDLGNBQWMsZUFBZTtBQUN0VixPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTyxvQkFBb0I7QUFDM0IsT0FBTyxZQUFZO0FBQ25CLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsMkJBQTJCO0FBQ3BDLFNBQVMsZUFBZTs7O0FDUHhCLE9BQU8sWUFBWTtBQWlCWixTQUFTLFdBQVcsU0FBOEI7QUFDdkQsUUFBTSxNQUFXLENBQUM7QUFFbEIsYUFBVyxXQUFXLE9BQU8sS0FBSyxPQUFPLEdBQUc7QUFDMUMsUUFBSSxXQUFXLFFBQVEsT0FBTyxFQUFFLFFBQVEsUUFBUSxJQUFJO0FBQ3BELGVBQVcsYUFBYSxTQUFTLE9BQU8sYUFBYSxVQUFVLFFBQVE7QUFFdkUsUUFBSSxZQUFZLGFBQWE7QUFDM0IsaUJBQVcsT0FBTyxRQUFRO0FBQUEsSUFDNUI7QUFDQSxRQUFJLFlBQVksY0FBYztBQUM1QixVQUFJO0FBQ0YsbUJBQVcsS0FBSyxNQUFNLFFBQVE7QUFBQSxNQUNoQyxTQUFTLE9BQU87QUFDZCxnQkFBUSxJQUFJLEtBQUs7QUFBQSxNQUNuQjtBQUFBLElBQ0Y7QUFDQSxRQUFJLE9BQU8sSUFBSTtBQUNmLFlBQVEsSUFBSSxPQUFPLElBQUk7QUFBQSxFQUN6QjtBQUNBLFNBQU87QUFDVDs7O0FEeENBLElBQU0sbUNBQW1DO0FBWXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLFNBQWdDO0FBQzNELFFBQU0sTUFBTSxRQUFRLEtBQUssTUFBTSxRQUFRLElBQUksQ0FBQztBQUM1QyxRQUFNLFVBQVUsV0FBVyxHQUFHO0FBRTlCLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDL0IsWUFBWTtBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixZQUFZO0FBQUEsWUFDVixNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0EsbUJBQW1CO0FBQUEsUUFDckI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBO0FBQUEsTUFDTixNQUFNLFFBQVE7QUFBQSxNQUNkLE1BQU0sUUFBUTtBQUFBLE1BQ2QsTUFBTTtBQUFBO0FBQUE7QUFBQSxNQUdOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxRQUNoQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxJQUFJO0FBQUE7QUFBQSxNQUVKLE9BQU87QUFBQTtBQUFBLE1BRVAsZUFBZTtBQUFBLE1BQ2YsV0FBVztBQUFBLFFBQ1QsU0FBUyxDQUFDLE9BQU8sY0FBYyxZQUFZLGNBQWM7QUFBQSxRQUN6RCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxNQUNuQyxDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxNQUNuQyxDQUFDO0FBQUE7QUFBQSxNQUVELFFBQVEsZUFBZSxXQUFXO0FBQUE7QUFBQSxNQUVsQyxRQUFRLG1CQUNOLGdCQUFnQjtBQUFBLFFBQ2QsU0FBUztBQUFBLFFBQ1QsU0FBUztBQUFBLFFBQ1QsV0FBVztBQUFBLFFBQ1gsV0FBVztBQUFBLFFBQ1gsS0FBSztBQUFBLE1BQ1AsQ0FBQztBQUFBLElBQ0w7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU0sUUFBUSxvQkFBb0IsQ0FBQyxlQUFlLFVBQVUsSUFBSSxDQUFDO0FBQUEsSUFDbkU7QUFBQTtBQUFBLElBRUEsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBO0FBQUEsTUFFUixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQVFSLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQTtBQUFBLFVBRU4sZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

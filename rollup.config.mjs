import path from 'path';
import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { eslint } from 'rollup-plugin-eslint'
import { VDomCompiler } from './packages/compiler/index.mjs';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const config = {
  input: path.join(__dirname, '/src/index.ts'),
  output: path.join(__dirname, '/dist'),
  title: "framework",
  // html文件位置
  html: path.join(__dirname, '/public/index.html'),
  // bundle的名称
  bundleName: 'bundle.js',
}





// 构建public目录下面的资源
export const buildPublic = () => {
  let html = fs.readFileSync(config.html, { encoding: 'utf-8' }).toString();
  html = html.replace("%title%", config.title);
  html = html.replace("%bundle%", "./" + config.bundleName)
  fs.mkdir(config.output, { recursive: true }, (err) => { if (err) throw err; });
  fs.writeFileSync(path.join(config.output, 'index.html'), html);
}







// rollup 配置项
const rollupConfig = {
  input: config.input,
  output: {
      file: path.join(config.output, config.bundleName),
      format: 'iife', // iife
      name: config.title,
      sourcemap: true, // Enable source maps
      inlineDynamicImports: true,
  },
  preserveEntrySignatures: false,
  assert: {
    json: true,
  },
  // external: ['lodash'], // 指出应将哪些模块视为外部模块，如 Peer dependencies 中的依赖
  // plugins 需要注意引用顺序
  plugins: [
    alias({
      entries: [
        { find: "@", replacement: path.join(__dirname, '/src') },
        { find: "@packages", replacement: path.join(__dirname, '/packages') },
      ]
    }),
    VDomCompiler(),    
    // 使得 rollup 支持 commonjs 规范，识别 commonjs 规范的依赖
    commonjs(),    
    // 验证导入的文件
    eslint({
      throwOnError: true, // lint 结果有错误将会抛出异常
      throwOnWarning: false,
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**', 'lib/**', '*.js'],
    }),
    // 配合 commnjs 解析第三方模块
    nodeResolve({
      // 将自定义选项传递给解析插件
      customResolveOptions: {
        moduleDirectories: ['node_modules'],
      },
    }),
    // typescript compile configuration
    typescript(),
  
    json(),
  ],
}


export default rollupConfig 
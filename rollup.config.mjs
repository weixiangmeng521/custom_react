import path from 'path';
import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { eslint } from 'rollup-plugin-eslint'
import { DEFAULT_EXTENSIONS } from '@babel/core'
import compilerImportPlugin from './compiler/import_plugin.mjs';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildPublic, buildDynamicImportTree } from "./compiler/helpr.mjs"


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const config = {
  root: path.join(__dirname, "/src"),
  input: path.join(__dirname, '/src/index.ts'),
  output: path.join(__dirname, '/dist'),
  title: "framework",
  // html文件位置
  html: path.join(__dirname, '/public/index.html'),
  // bundle的名称
  bundleName: 'bundle.js',
}


const configPlugins = [
  compilerImportPlugin({
    include: 'src/**/*.html', // 包含的文件
    // exclude: 'src/**/*.json', // 可选，排除的文件
  }),

  // 验证导入的文件
  eslint({
    throwOnError: true, // lint 结果有错误将会抛出异常
    throwOnWarning: true,
    include: ['src/**/*.ts'],
    exclude: ['node_modules/**', 'lib/**', '*.js'],
  }),

  alias({
    entries: [
      { find: "@", replacement: path.join(__dirname, '/src') }
    ]
  }),
  // 使得 rollup 支持 commonjs 规范，识别 commonjs 规范的依赖
  commonjs(),

  // 配合 commnjs 解析第三方模块
  nodeResolve({
    // 将自定义选项传递给解析插件
    customResolveOptions: {
      moduleDirectory: 'node_modules',
    },
  }),

  typescript({
    lib: ["es5", "es6", "dom"],
    target: "es5"
  }),

  json(),

  babel({
    runtimeHelpers: true,
    // 只转换源代码，不运行外部依赖
    exclude: 'node_modules/**',
    // babel 默认不支持 ts 需要手动添加
    extensions: [
      ...DEFAULT_EXTENSIONS,
      '.ts',
    ],
  }),
];





export const templateCompilerConfig = {
  input: [],
  output: [],
  outputDir: config.output,
  root: path.join(__dirname, "/src"),
  assert: {
    json: true,
  },
  plugins: [
    ...configPlugins,
  ],
}





export const build = () => {
  buildPublic(config);
  buildDynamicImportTree(templateCompilerConfig);


}






// rollup 配置项
const rollupConfig = {
  input: config.input,
  output: [
    {
      file: path.join(config.output, config.bundleName),
      format: 'iife', // iife
      name: config.title,
      sourcemap: true, // Enable source maps
    },
  ],
  inlineDynamicImports: true,
  preserveEntrySignatures: false,
  assert: {
    json: true,
  },
  // external: ['lodash'], // 指出应将哪些模块视为外部模块，如 Peer dependencies 中的依赖
  // plugins 需要注意引用顺序
  plugins: [
    ...configPlugins,
  ],
}


export default rollupConfig 
import { createFilter } from '@rollup/pluginutils'
import fs from 'fs'
import { toFiberTree } from "./convert.mjs"
import pluginConfig from "./config.mjs"
import { consola } from "consola";


export default function compilerImportPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'compiler-import-plugin',

    // transform(code, id) {
    //   // 使用正则表达式匹配动态 import
    //   const __dirname = dirname(fileURLToPath(import.meta.url));
      
    //   const importRegex = /import\s*\(\s*([^)]+)\s*\)/g;
    //   const stringWithoutQuotes = (stringWithQuotes) => stringWithQuotes.replace(/['"]/g, '');
    //   let modifiedCode = code;

    //   let match;
    //   while ((match = importRegex.exec(code)) !== null) {
    //     const mapping = options.common.dynamicMapping;
    //     const regularPath = path.resolve(options.common.root + "/" + stringWithoutQuotes(match[1]));
    //     const replacedPath = mapping[regularPath].replace(__dirname + "/dist/", "");

    //     // 例如，替换动态 import 为静态 import
    //     const replacement = `import("${replacedPath}")`;
    //     modifiedCode = modifiedCode.replace(match[0], replacement);

    //     consola.info(replacement);

    //     // TODO: match[1] 的error处理
    //   }

    //   return {
    //     code: modifiedCode, // 返回 null 表示不修改源代码
    //     map: null,
    //   }
    // },


    resolveId(source, importer) {
      // 只处理以 extension 结尾的 import
      if (filter(source) && source.endsWith(pluginConfig.extension)) {
        // 构建完整的路径
        const resolvedPath = importer ? new URL(source, importer).pathname : source;

        // 检查文件是否存在
        if (fs.existsSync(resolvedPath)) {
          return resolvedPath;
        } else {
          console.error(`File not found: ${resolvedPath}`);
          return null;
        }
      }
    },

    load(id) {
      if (filter(id) && id.endsWith(pluginConfig.extension)) {
        // Read the content of the file
        const content = fs.readFileSync(id, 'utf-8');
        // Return the content as a object tree

        const tree = toFiberTree(content);
        return `export default ${JSON.stringify(tree)};`;
      }
    },


  };
}



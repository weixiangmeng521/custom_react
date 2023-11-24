import { createFilter } from '@rollup/pluginutils'
import fs from 'fs'
import { toFiberTree } from "./convert"

export default function customImportPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const extension = ".html";

  return {
    name: 'custom-import-plugin',

    resolveId(source, importer) {
      // 只处理以 '.custom' 结尾的 import
      if (filter(source) && source.endsWith(extension)) {
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
      if (filter(id) && id.endsWith(extension)) {
        // Read the content of the file
        const content = fs.readFileSync(id, 'utf-8');
        // Return the content as a object tree

        const tree = toFiberTree(content);
        return `export default ${JSON.stringify(tree)};`;
      }
    },    
  };
}

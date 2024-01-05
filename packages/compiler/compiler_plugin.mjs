import { createFilter } from '@rollup/pluginutils'
import fs from 'fs'
import { toFiberTreeText } from "./nodeTree.mjs"
import pluginConfig from "./config.mjs"


export function VDomCompiler(options = {}) {
  // set default
  if(!options || !options.include) {
    options.include = `src/**/*${pluginConfig.extension}`;
  }

  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'vdom-compiler',

    resolveId(source, importer) {
      // 只处理以 extension 结尾的 import
      if (filter(source) && source.endsWith(pluginConfig.extension)) {
        // 构建完整的路径
        let resolvedPath = "";
        try{
          resolvedPath = importer ? new URL(source, importer).pathname : source;
        }catch(e){
          return source;
        }

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

        const tree = toFiberTreeText(content);
return `
import { createElement, createTextElement, displayTplStr, displayTplList } from "@packages/runtime";
/** automatically generate */
export default {
  render: function(){ return (${tree}) }
}
`;
      }
    },

  };
}



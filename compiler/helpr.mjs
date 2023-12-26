import fs from "fs"
import { consola } from "consola";
import path from 'path';
import pluginConfig from "./config.mjs"
import crypto from 'crypto';
import { toFiberTree } from "./convert.mjs"


// 获取目录下所有文件的函数
function getFilesInDirectory(directory) {
    const files = [];
    function scan(directory) {
        const entries = fs.readdirSync(directory);

        entries.forEach(entry => {
            const entryPath = path.join(directory, entry);
            const stat = fs.statSync(entryPath);

            if (stat.isDirectory()) {
                scan(entryPath);
            }
            if (stat.isFile() && entry.endsWith(pluginConfig.extension)) {
                // 这里假设你只关心 TypeScript 文件，可以根据需要调整过滤条件
                files.push(entryPath);
            }
        });
    }
    scan(directory);
    return files;
}

// 生成动态加载的文件
const generateDirPath = (key, root) => {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return `${root}/${hash}.js`;
}



// 构建public目录下面的资源
export const buildPublic = (config) => {
    let html = fs.readFileSync(config.html, { encoding: 'utf-8' }).toString();
    html = html.replace("%title%", config.title);
    html = html.replace("%bundle%", "./" + config.bundleName)
    fs.mkdir(config.output, { recursive: true }, (err) => { if (err) throw err; });
    fs.writeFileSync(path.join(config.output, 'index.html'), html);
}



// 分析动态导入的数据
export const buildDynamicImportTree = (templateCompilerConfig) => {
    const outputRootDir = templateCompilerConfig.outputDir;
    const sourceRootDir = templateCompilerConfig.root;
    const list = getFilesInDirectory(sourceRootDir);

    templateCompilerConfig.input = list;
    templateCompilerConfig.output = list.map((item, i) => {
        return {
            file: generateDirPath(item + i, outputRootDir),
            format: 'es',
            sourcemap: true, // Enable source maps              
        }
    });
}




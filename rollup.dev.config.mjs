import base, { build, templateCompilerConfig } from "./rollup.config.mjs"
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload'

build();

export default [{
    ...base,
    plugins: [
      ...base.plugins,
      livereload(),
      serve({
        // open: true,
        verbose: true,
        contentBase: "dist",
        host: "localhost",
        port: 8888,
      }),
    ]
}, templateCompilerConfig]
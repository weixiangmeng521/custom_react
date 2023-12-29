import base, { buildPublic } from "./rollup.config.mjs"
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload'

buildPublic();

export default [{
    ...base,
    plugins: [
      ...base.plugins,
      livereload(),
      serve({
        open: false,
        verbose: true,
        contentBase: "dist",
        host: "localhost",
        port: 8888,
      }),
    ]
}]
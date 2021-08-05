import base, { buildPublic } from "./rollup.config"
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload'

buildPublic();

export default {
    ...base,
    plugins: [
      ...base.plugins,
      livereload(),
      serve({
        open: true,
        verbose: true,
        contentBase: "dist",
        host: "localhost",
        port: 8888,
      }),
    ]
}


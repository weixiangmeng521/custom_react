import base, { buildPublic } from "./rollup.config.mjs"
import { terser } from "rollup-plugin-minification";

buildPublic();

export default [{
    ...base,
    plugins: [
        ...base.plugins,
        terser()
    ],
}];

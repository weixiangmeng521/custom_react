import base, { buildPublic } from "./rollup.config.mjs"
import { terser } from 'rollup-plugin-terser';

buildPublic();

export default [{
    ...base,
    plugins: [
        ...base.plugins,
        terser()
    ],
}];

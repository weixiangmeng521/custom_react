import base, { build, templateCompilerConfig } from "./rollup.config.mjs"
import { uglify } from 'rollup-plugin-uglify';

build();

export default [{
    ...base,
    plugins: [
        ...base.plugins,
        uglify()
    ],
}, templateCompilerConfig];

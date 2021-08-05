import base, { buildPublic } from "./rollup.config"
import { uglify } from 'rollup-plugin-uglify';

buildPublic();

export default {
    ...base,
    plugins: [
        ...base.plugins,
        uglify()
    ],
};

import baseConfig from './base.js';
import {terser} from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
const version = process.env.VERSION || require('./package.json').version

function prodConfig(){


    baseConfig[0].plugins.push(terser({
        compress:{
            pure_funcs: ['console.log', 'console.info'],
            drop_console:false
        }
    }));
    baseConfig[0].output.file=`./lib/TimeLine.umd.js`;
    baseConfig[1].output.file=`./lib/TimeLine.es.js`;

    return baseConfig;

}

export default prodConfig();
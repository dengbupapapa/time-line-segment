import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import globals from 'rollup-plugin-node-globals';
import alias from 'rollup-plugin-alias';
import builtin from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';
import url from '@rollup/plugin-url';

let isProd = process.env.NODE_ENV === 'production';

const plugins = [
    url(),
    replace({
      PRODUCTION: isProd
    }),
    alias({
      resolve: ['.js']
    }),
    resolve(),
    babel({
        exclude: 'node_modules/**',
        // include: [path.join(__dirname,'./node_modules/three/**'),path.join(__dirname,'./static/**'),path.join(__dirname,'./source/**'),path.join(__dirname,'./assets/**')],
        runtimeHelpers: true
    }),
    commonjs({
      include: "node_modules/**"
    }),
    globals(),
    builtin(),
];


// console.log(path.join(__dirname,'./static/three.min.js'))

export default [{
    input: './src/index.js',
    plugins:[...plugins],
    // globals: {
    //     jquery: '$'
    // },
    // banner: '/* my-library version ' + 1.00 + ' */',
    // footer: '/* follow me on Twitter! @rich_harris */',
    // intro: 'var ENVIRONMENT = "production";',
    // outro: 'var asdasdsa="123"',
    // cache:true,
    output:{name: 'TimeLine',format: 'umd'}
},{
    input: './src/index.js',
    plugins:[...plugins],
    // globals: {
    //     jquery: '$'
    // },
    // banner: '/* my-library version ' + 1.00 + ' */',
    // footer: '/* follow me on Twitter! @rich_harris */',
    // intro: 'var ENVIRONMENT = "production";',
    // outro: 'var asdasdsa="123"',
    // cache:true,
    output:{name: 'TimeLine',format: 'es'}
}];
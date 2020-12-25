import { writeFile, readFile } from 'fs';

import { rollup } from 'rollup';
import babel from 'rollup-plugin-babel';
import { minify } from 'terser';

import { IsIn, FileIO } from "./normalizeConfig.js";

global.rollupCache = global.rollupCache || {};

function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|[-_])/g, (letter, index) => {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '').replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
}

async function jsCompiler(config) {
    const {
        file: file_input,
        dest
    } = config;

    const _config = new IsIn(config);
    const file = new FileIO(file_input, dest);
    const cache = global.rollupCache[file.input.base] ? global.rollupCache[file.input.base] : null;

    if ('fileName' in config) {
        file.output = file.output
                          .replace(file.input.base, 
                                config.fileName.replace('{name}', file.input.without_ext)
                            );
    }

    return (
        rollup({
            input: file.input.path,
            cache: cache,
            plugins: [
                babel({
                    comments: false,
                    exclude: 'node_modules/**',
                    presets: [
                        ['@babel/preset-env', {
                            modules: false, // https://babeljs.io/docs/en/babel-preset-env#modules
                            targets: {
                                esmodules: true
                            }
                        }]
                    ]
                }),
            ]
        }).then(async bundle => {
            global.rollupCache[file.input.base] = bundle.cache;
            await bundle.write({
                file: file.output,
                format: _config("format").orDefault("iife"),
                strict: _config("strict").orDefault(true),
                sourcemap: _config("sourcemap").orDefault(false),
                name: _config("moduleID", "name")
                        .orDefault(toCamelCase(file.input.without_ext))
            });
            return file.output;
        })
    );
}


/**
 * @param { Object } options path: input file path, path_output: output file path
 */
async function jsMinifier (options) {
    const {
        path,
        path_output
    } = options;

    return new Promise((resolve, reject) => {
        readFile(path, async (err, data) => {
            if(err)
                return reject(err);
            
            writeFile(path_output, (await minify(data.toString())).code, err => 
                err ? reject(err) : resolve(err) 
            );
        })
    })
}

export { jsCompiler, jsMinifier };

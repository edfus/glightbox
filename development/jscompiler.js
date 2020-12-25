import { basename, extname, join } from 'path';

import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import rollup_resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

import __dirname from "./helpers/__dirname.js";

global.rollupCache = global.rollupCache || {};

function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|[-_])/g, (letter, index) => {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '').replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
}

class IsIn {
    constructor (obj) {
        return key => {
            return {
                orDefault (defaultValue) {
                    return obj.hasOwnProperty(key) ? obj[key] : defaultValue;
                }
            }
        }
    }
}

async function jscompiler(config) {
    const {
        file: file_input,
        dest
    } = config;

    const _config = new IsIn(config);

    const file = new class {
        input = file_input
        input_base = basename(this.input)
        input_ext = extname(this.input_base)
        input_without_ext = this.input_base.replace(this.input_ext, '')
        output = join(__dirname, '../', dest, this.input_base)
    }

    const cache = global.rollupCache[file.input_base] ? global.rollupCache[file.input_base] : null;

    if ('fileName' in config) {
        file.output = file.output
                          .replace(file.input_base, 
                                config.fileName.replace('{name}', file.input_without_ext)
                            );
    }

    return (
        rollup.rollup({
            input: file.input,
            cache: cache,
            plugins: [
                rollup_resolve({
                    mainFields: ['module', 'main'],
                    browser: true
                }),
                commonjs(),
                babel({
                    comments: false,
                    exclude: 'node_modules/**',
                    presets: [
                        ['@babel/preset-env', {
                            modules: false
                        }]
                    ]
                }),
            ]
        }).then(async bundle => {
            global.rollupCache[file.input_base] = bundle.cache;
            await bundle.write({
                file: file.output,
                format: _config("format").orDefault("iife"),
                strict: _config("strict").orDefault(true),
                sourcemap: _config("sourcemap").orDefault(false),
                name: _config("moduleID")
                        .orDefault(
                            _config("name")
                                .orDefault(toCamelCase(file.input_without_ext))
                            )
            })
            return file.output;
        })
    );
}

export default jscompiler;

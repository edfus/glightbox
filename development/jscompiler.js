const { rollup } = require('rollup');
const babel = require('rollup-plugin-babel');
const rollup_resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const path = require('path');

global.rollupCache = global.rollupCache || {};

function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|[-_])/g, (letter, index) => {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '').replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
}

class TestConfig {
    constructor (config) {
        return key => {
            return {
                orDefault (defaultValue) {
                    return config.hasOwnProperty(key) ? config[key] : defaultValue;
                }
            }
        }
    }
}

function jscompiler(config) {
    const {
        file: file_input,
        dest
    } = config;

    const _config = new TestConfig(config);

    const file = new class {
        input = file_input
        input_base = path.basename(this.input)
        input_ext = path.extname(this.input_base)
        input_without_ext = this.input_base.replace(this.input_ext, '')
        output = path.join(__dirname, '../', dest, this.input_base)
    }

    const cache = global.rollupCache[file.input_base] ? global.rollupCache[file.input_base] : null;

    if ('fileName' in config) {
        file.output = file.output
                          .replace(file.input_base, 
                                config.fileName.replace('{name}', file.input_without_ext)
                            );
    }

    return new Promise((resolve, reject) => {
        rollup({
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
        }).then(async (bundle) => {
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
            }).then(() => {
                resolve(true);
            }).catch(error => {
                console.error(error)
                reject(error);
            });

            return file.output;
        })
    })
}

module.exports = jscompiler;

import postcss from 'postcss';
import cssnext from 'postcss-preset-env';
import cssnested from 'postcss-nested';
import cssmqpacker from 'css-mqpacker';
import cssprettify from 'postcss-prettify';
import cssclean from 'clean-css';
import { basename, join, extname } from 'path';
import { readFile, writeFile } from 'fs';
import __dirname from "../helpers/__dirname.js";

async function postcssCompiler(config) {
    const {
        file,
        dest,
        minify = true
    } = config;
    const fileName = basename(file);
    const from = join(__dirname, '../', file);
    const to = join(__dirname, '../', dest, fileName);
    const fileNameMin = extname(fileName);
    const min = join(__dirname, '../', dest, fileName.replace(fileNameMin, `.min${fileNameMin}`));
    const css = await new Promise(
        (resolve, reject) => 
            readFile(from, 'utf8', 
                (err, data) => err ? reject(err) : resolve(data)
                )
        );

    return new Promise(async (resolve, reject) => {
        return postcss([
                cssnested(),
                cssnext({
                    stage: 0,
                    browsers: ['last 2 version'],
                    features: {
                        calc: false
                    }
                }),
                cssmqpacker({
                    sort: true
                }),
                cssprettify(),
            ])
            .process(css, {
                from,
                to
            })
            .then(result => {
                if (result && result.css) {
                    writeFile(to, result.css, 'utf8', (err) => reject(err));


                    if (minify) {
                        const minified = new cssclean({}).minify(result.css);
                        writeFile(min, minified.styles, 'utf8', (err) => reject(err));

                        if (result.map) {
                            writeFile(to + '.map', result.map, 'utf8', (err) => reject(err));
                        }
                    }

                    resolve(to);
                } else {
                    reject(result);
                }
            })
            .catch((err) => {
                console.log(err)
                reject(err);
            })
    })
}

export default postcssCompiler;

import stylus from "stylus";
import { basename, join, extname } from 'path';
import { readFile, writeFile } from 'fs';
import __dirname from "../helpers/__dirname.js";

// https://github.com/stylus/stylus/blob/dev/docs/js.md

stylus(str)
  .set('filename', 'nesting.css')
  .render(function(err, css){
    // logic
  });

  async function stylusCompiler(config) {
    const {
        file,
        dest,
        minify = true
    } = config;

    const fileName = basename(file);

    const fileNameMin = extname(fileName);
    const min = join(__dirname, '../', dest, fileName.replace(fileNameMin, `.min${fileNameMin}`));
    
    const css = await new Promise(
        (resolve, reject) => 
            readFile(from, 'utf8', 
                (err, data) => err ? reject(err) : resolve(data)
                )
        );

    return new Promise(async (resolve, reject) => {
        return stylus()
            .then(result => {
                if (result && result.css) {
                    writeFile(to, result.css, 'utf8', (err) => reject(err));
                }
              })
    })
}

async function minify () {
  const minified = new cssclean({}).minify(result.css);
  writeFile(min, minified.styles, 'utf8', (err) => reject(err));

  if (result.map) {
      writeFile(to + '.map', result.map, 'utf8', (err) => reject(err));
  }
}

export default stylusCompiler;
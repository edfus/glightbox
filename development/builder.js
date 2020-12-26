import { join, basename, resolve } from 'path';

import notify from './helpers/notify.js';
import __dirname from "./helpers/__dirname.js";
import jsCompiler from './compilers/rollup.js';
import jsMinifier from "./compilers/terser.js";
import stylusCompiler from './compilers/stylus.js';
import cssMinifier from "./compilers/clean-css.js";

const offset = join(__dirname, "../");

let config = {
  js: {
      src: offset.concat("src/js"),
      dest: offset.concat("dist/js"),
  },
  css: {
      src: offset.concat("src/css"),
      dest: offset.concat("dist/css"),
  }
};

/**
 * rollup, babel (es2015), minify.
 */
async function buildGlightboxJS() {
  const file = resolve(join(config.js.src, 'glightbox.js'));

  const outputFile = await jsCompiler({
      src:  file,
      dest: resolve(config.js.dest),
      fileName: "{name}.js",
      format: 'umd', // amd, cjs, es, iife, umd, system. esm? universal module.
      sourcemap: false,
      moduleID: 'GLightbox'
  }).catch(error => {
    notify('Build Error', `View logs for more info`);
    throw error;
  });

  await jsMinifier({
      file: outputFile,
      path_o: resolve(config.js.dest),
      fileName: "{name}.min.js"
  })

  console.info(`Built, Compiled and Minified ${basename(file)}`)
}


/**
* Handle Postcss files
*/
async function buildGlightboxCSS() {
  const file = resolve(join(config.css.src, 'glightbox.styl'));

  const options = {
      file,
      dest: resolve(config.css.dest),
      fileName: "{name}.css",
      minify: false,
      sourcemap: false
  };

  await stylusCompiler(options).catch(error => {
    notify('Build Error', `View logs for more info`);
    throw error;
  }).then(file_o => cssMinifier({
    file: file_o,
    dest: options.dest,
    fileName: "{name}.min.css",
    sourcemap: false
  }))

  console.info(`Built, Compiled and Minified ${basename(file)}`);
}

export { buildGlightboxJS, buildGlightboxCSS }
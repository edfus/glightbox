import { join, basename, resolve } from 'path';

import notify from './helpers/notify.js';
import __dirname from "./helpers/__dirname.js";
import { jsCompiler, jsMinifier } from './compilers/jscompiler.js';

// import stylusCompiler from './compilers/stylus.js';

const offset = join(__dirname, "../");

let config = {
  js: {
      src: offset.concat("src/js"),
      dest: offset.concat("dist/js"),
  },
  css: {
      src: offset.concat("src/postcss"),
      dest: offset.concat("dist/css"),
  }
};

/**
 * rollup, babel (es2015), minify.
 */
async function buildGlightboxJS() {
  const file = resolve(join(config.js.src, 'glightbox.js'));

  const outputFile = await jsCompiler({
      file,
      dest: resolve(config.js.dest),
      format: 'umd', // amd, cjs, es, iife, umd, system. esm? universal module.
      sourcemap: false,
      moduleID: 'GLightbox'
  }).catch(error => {
    notify('Build Error', `View logs for more info`);
    throw error;
  });

  const minifiedPath_o = resolve(join(
      config.js.dest, basename(file).replace('.js', '.min.js')
    ));

  await jsMinifier({
    path: outputFile,
    path_output: minifiedPath_o
  })

  console.info(`Built, Compiled and Minified ${basename(file)}`)
}


/**
* Handle Postcss files
*/
async function buildGlightboxCSS() {
  const file = resolve(join(config.css.src, 'glightbox.css'));

  // await Compiler({
  //     file,
  //     dest: resolve(config.css.dest),
  //     minify: true
  // }).catch(error => {
  //   notify('Build Error', `View logs for more info`);
  //   throw error;
  // });

  console.info(`Built, Compiled and Minified ${basename(file)}`);
}

export { buildGlightboxJS, buildGlightboxCSS }
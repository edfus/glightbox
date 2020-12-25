import { writeFile } from 'fs';
import { join, basename } from 'path';
import { minify } from 'terser';

import notify from './helpers/notify.js';
import jscompiler from './jscompiler.js';
import postcssCompiler from './postcss.js';

let config = {
  js: {
      src: 'src/js',
      dest: 'dist/js',
  },
  css: {
      src: 'src/postcss',
      dest: 'dist/css',
  }
};

/**
 * rollup, babel (es2015), minify.
 */
async function buildGlightboxJS() {
  const file = join(config.js.src, 'glightbox.js');

  const name = basename(file);

  const outputFile = await jscompiler({
      file,
      dest: config.js.dest,
      format: 'umd', // amd, cjs, es, iife, umd, system. esm? universal module.
      sourcemap: false,
      moduleID: 'GLightbox'
  }).catch(error => {
    notify('Build Error', `View logs for more info`);
    throw error;
  });

  const minName = name.replace('.js', '.min.js');
  const minifyPath = join(config.js.dest, minName);

  return new Promise((resolve, reject) => {
    writeFile(minifyPath, (await minify(outputFile)).code, err => 
      err ? reject(err) : console.info(`Built, Compiled and Minified ${name}`) || resolve(err) 
    );
  })
}


/**
* Handle Postcss files
*/
async function buildGlightboxCSS() {
  const file = join(config.css.src, 'glightbox.css');
  const name = basename(file);
  const dest = config.css.dest;

  await postcssCompiler({
      file,
      dest,
      minify: true
  }).catch(error => {
    notify('Build Error', `View logs for more info`);
    throw error;
  });

  console.info(`Built, Compiled and Minified ${name}`);
}

export { buildGlightboxJS, buildGlightboxCSS }
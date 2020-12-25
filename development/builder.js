import { readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import minify from 'terser';

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

  await jscompiler({
      file,
      dest: config.js.dest,
      format: 'umd',
      sourcemap: false,
      moduleID: 'GLightbox'
  }).catch(error => {
    notify('Build Error', `View logs for more info`);
    throw error;
  });

  const minName = name.replace('.js', '.min.js');
  const processed = join(config.js.dest, name);
  const code = readFileSync(processed, 'utf8');
  const minified = minify(code);
  const minifyPath = join(config.js.dest, minName);

  writeFileSync(minifyPath, minified.code);

  console.info(`Built, Compiled and Minified ${name}`);
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
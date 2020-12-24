import { readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import notify from './notifications.js';
import jscompiler from './jscompiler.js';
import postcssCompiler from './postcss.js';
import minify from 'terser';

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
* Handle Javascript files
* compile the javascript files
* to es2015, minify and sync the files
*
* @return { Promise<Boolean> }
*/
async function buildGlightboxJS() {
  const file = join(config.js.src, 'glightbox.js');

  const name = basename(file);

  const res = await jscompiler({
      file,
      dest: config.js.dest,
      format: 'umd',
      sourcemap: false,
      moduleID: 'GLightbox'
  }).catch(error => console.log(error));

  if (!res) {
      notify('Build Error', `View logs for more info`);
      return false;
  }

  const minName = name.replace('.js', '.min.js');
  const processed = join(config.js.dest, name);
  const code = readFileSync(processed, 'utf8');
  const minified = minify(code);
  const minifyPath = join(config.js.dest, minName);

  writeFileSync(minifyPath, minified.code);

  console.info(`Built, Compiled and Minified ${name}`);
  return true;
}


/**
* Handle Postcss files
* compile the css files
*
* @return { Promise<Boolean> }
*/
async function buildGlightboxCSS() {
  const file = join(config.css.src, 'glightbox.css');
  const name = basename(file);
  const dest = config.css.dest;

  let res = await postcssCompiler({
      file,
      dest,
      minify: true
  }).catch(error => console.log(error));
  if (!res) {
      return false;
  }
  console.info(`Built, Compiled and Minified ${name}`);
  return true;
}

export { buildGlightboxJS, buildGlightboxCSS }
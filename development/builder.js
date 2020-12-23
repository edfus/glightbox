const fs = require('fs');
const path = require('path');
const notify = require('./notifications');
const jscompiler = require('./jscompiler');
const postcssCompiler = require('./postcss');
const terser = require('terser');

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
  const file = path.join(config.js.src, 'glightbox.js');

  const name = path.basename(file);

  const res = await jscompiler({
      file,
      dest: config.js.dest,
      format: 'umd',
      sourcemap: false,
      moduleID: 'GLightbox'
  }).catch(error => console.log(error));

  if (!res) {
      notify('Build Error', `View logs for more info`);
      console.log(res)
      return false;
  }

  const minName = name.replace('.js', '.min.js');
  const processed = path.join(config.js.dest, name);
  const code = fs.readFileSync(processed, 'utf8');
  const minified = terser.minify(code);
  const minifyPath = path.join(config.js.dest, minName);

  fs.writeFileSync(minifyPath, minified.code);

  notify('Build', `Compiled and Minified ${name}`);

  return true;
}


/**
* Handle Postcss files
* compile the css files
*
* @return { Promise<Boolean> }
*/
async function buildGlightboxCSS() {
  const file = path.join(config.css.src, 'glightbox.css');
  const name = path.basename(file);
  const dest = config.css.dest;

  let res = await postcssCompiler({
      file,
      dest,
      minify: true
  }).catch(error => console.log(error));
  if (!res) {
      return false;
  }
  notify('Build', `Compiled and Minified ${name}`);

  return true;
}

module.exports = { buildGlightboxJS, buildGlightboxCSS }